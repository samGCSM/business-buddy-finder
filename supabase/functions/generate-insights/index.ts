import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType } = await req.json();
    console.log(`Generating daily insight for user ${userId} (${userType})`);

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          content: 'Unable to generate insights at this time. Please try again later.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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
          model: 'gpt-3.5-turbo',
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              error: 'Rate limit exceeded',
              content: "Today's insight is not available right now due to high demand. Please try again in a few minutes." 
            }), {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('Successfully generated insight');
      
      return new Response(
        JSON.stringify({ content: data.choices[0].message.content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        content: 'Unable to generate insights at this time. Please try again later.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});