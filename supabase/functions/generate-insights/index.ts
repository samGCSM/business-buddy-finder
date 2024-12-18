import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Rate limiting cache using Deno's native cache API
const cache = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute per user

function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const userKey = `rate_limit_${userId}`;
  const userRequests = cache.get(userKey) || [];

  // Clean up old requests
  const validRequests = userRequests.filter((timestamp: number) => 
    now - timestamp < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= MAX_REQUESTS) {
    return true;
  }

  // Add current request
  validRequests.push(now);
  cache.set(userKey, validRequests);
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType } = await req.json();
    console.log('Generating insights for user:', userId);

    // Check rate limiting
    if (isRateLimited(userId)) {
      console.log('Rate limit exceeded for user:', userId);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          content: "Today's insight is not available right now due to high demand. Please try again in a few minutes."
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for existing recent insight first
    const { data: existingInsights, error: fetchError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', 'daily_insight')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing insights:', fetchError);
      throw fetchError;
    }

    // If we have today's insight, return it
    if (existingInsights && existingInsights.length > 0) {
      return new Response(
        JSON.stringify({ content: existingInsights[0].content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's prospects data
    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', userId);

    if (prospectsError) {
      console.error('Error fetching prospects:', prospectsError);
      throw prospectsError;
    }

    // Prepare the prompt with actual data
    const prompt = `You are a helpful sales assistant. Based on this data about the user's prospects:
      - Total prospects: ${prospects?.length || 0}
      - Recent activities: ${prospects?.slice(0, 3).map(p => p.status).join(', ')}
      
      Generate a short, encouraging insight (max 2 sentences) about their sales progress. 
      Focus on being motivational and actionable.`;

    // Call OpenAI with exponential backoff
    let retries = 3;
    let delay = 1000; // Start with 1 second delay

    while (retries > 0) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful sales assistant.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const insight = data.choices[0].message.content;

        // Store the generated insight
        const { error: insertError } = await supabase
          .from('ai_insights')
          .insert([{
            user_id: userId,
            content_type: 'daily_insight',
            content: insight
          }]);

        if (insertError) {
          console.error('Error storing insight:', insertError);
          throw insertError;
        }

        return new Response(
          JSON.stringify({ content: insight }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Attempt ${4 - retries} failed:`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed after all retries');
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        content: "Unable to generate insight at this time. Please try again later."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});