import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPEN_AI_NEW_KEY');
console.log('OpenAI API Key present:', !!openAIApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExistingInsight(userId: number, contentType: string) {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching existing insight:', error);
    return null;
  }

  // If insight is less than 1 hour old, return it
  if (data && new Date(data.created_at) > new Date(Date.now() - 60 * 60 * 1000)) {
    return data.content;
  }

  return null;
}

async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional sales coach and business advisor.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!openAIResponse.ok) {
        const error = await openAIResponse.text();
        console.error('OpenAI API error:', error);
        
        if (openAIResponse.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await sleep(waitTime);
          continue;
        }
        
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await openAIResponse.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType, insightType } = await req.json();
    console.log(`Generating ${insightType} for user ${userId} (${userType})`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check for existing recent insight
    const existingContent = await getExistingInsight(userId, insightType);
    if (existingContent) {
      console.log('Using existing insight');
      return new Response(JSON.stringify({ content: existingContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let prompt = '';
    if (insightType === 'pep_talk') {
      if (userType === 'user') {
        prompt = "You are a motivational speaker like Grant Cardone, Gary Vee, Tony Robbins, or Barbara Corcoran. Provide a 4-sentence pep talk to energize a salesperson.";
      } else if (userType === 'supervisor') {
        prompt = "As a sales leadership expert, provide 4 sentences of motivation and management advice for a sales team supervisor.";
      } else if (userType === 'admin') {
        prompt = "As a business analytics expert, provide 4 sentences highlighting key areas to focus on for managing a sales organization effectively.";
      }
    } else {
      if (userType === 'user') {
        prompt = "Provide 3 actionable tips for a salesperson to improve their prospecting success rate.";
      } else if (userType === 'supervisor') {
        prompt = "Provide 3 specific strategies for a sales supervisor to better support and develop their team.";
      } else if (userType === 'admin') {
        prompt = "Provide 3 data-driven insights for optimizing sales team performance and resource allocation.";
      }
    }

    console.log('Generating new content with prompt:', prompt);
    const generatedContent = await generateWithRetry(prompt);
    console.log('Generated content:', generatedContent);

    // Store the new insight
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        content_type: insightType,
        content: generatedContent,
      });

    if (insertError) {
      console.error('Error storing insight:', insertError);
      // Continue anyway - we can still return the content even if storing fails
    }

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});