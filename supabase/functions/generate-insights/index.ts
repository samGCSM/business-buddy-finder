import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPEN_AI_NEW_KEY');
console.log('OpenAI API Key present:', !!openAIApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType } = await req.json();
    console.log(`Generating daily insight for user ${userId} (${userType})`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

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
                { 
                  role: 'system', 
                  content: 'You are a motivational sales coach. Provide a brief, energizing message that includes both motivation and an actionable tip.' 
                },
                { 
                  role: 'user', 
                  content: 'Give me a short motivational message and one specific, actionable sales tip for today.' 
                }
              ],
              temperature: 0.7,
              max_tokens: 150,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (response.status === 429) {
            console.log(`Rate limit hit on attempt ${attempt + 1}`);
            throw new Error('rate_limit_exceeded');
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API error (${response.status}):`, errorText);
            throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
          }

          const data = await response.json();
          console.log('Successfully generated insight');
          return new Response(JSON.stringify({ content: data.choices[0].message.content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        lastError = error;
        if (error.message === 'rate_limit_exceeded') {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${backoffTime}ms before retry ${attempt + 1}`);
          await sleep(backoffTime);
          attempt++;
        } else {
          throw error;
        }
      }
    }

    if (lastError?.message === 'rate_limit_exceeded') {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw lastError;
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});