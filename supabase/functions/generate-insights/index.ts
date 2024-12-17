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

async function generateWithRetry(prompt: string, maxRetries = 3, initialDelay = 2000) {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to generate content`);
      
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Add exponential backoff delay
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await sleep(delay);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a professional sales coach.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 100,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error (${response.status}):`, errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.code === 'rate_limit_exceeded') {
              console.log('Rate limit exceeded, will retry after delay');
              lastError = new Error('Rate limit exceeded');
              continue;
            }
          } catch (parseError) {
            console.error('Error parsing OpenAI error response:', parseError);
          }
          
          throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('Successfully generated content');
        return data.choices[0].message.content;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.log('Request timed out, will retry');
        continue;
      }
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Max retries reached');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType, insightType } = await req.json();
    console.log(`Generating ${insightType} for user ${userId} (${userType})`);

    let prompt = '';
    if (insightType === 'pep_talk') {
      prompt = "Give a short, energizing 1-sentence pep talk for a salesperson.";
    } else if (insightType === 'recommendations') {
      prompt = "Provide 1 specific, actionable tip for improving sales performance.";
    }

    console.log('Generating with prompt:', prompt);
    const generatedContent = await generateWithRetry(prompt);
    console.log('Generated content:', generatedContent);

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    
    // Specific error response for rate limits
    if (error.message?.includes('rate_limit_exceeded')) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});