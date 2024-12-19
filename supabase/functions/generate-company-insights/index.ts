import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, website } = await req.json();
    console.log('Generating insights for:', businessName, website);

    const prompt = `Analyze this business: ${businessName} (${website || 'no website provided'}). 
    Provide a brief summary of:
    1. What they likely do
    2. Their target market
    3. Potential opportunities
    Keep it concise and business-focused.`;

    // Implement exponential backoff
    const maxRetries = 3;
    let delay = 1000; // Start with 1 second delay

    for (let attempt = 0; attempt < maxRetries; attempt++) {
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
              { role: 'system', content: 'You are a helpful business analyst.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (response.status === 429) {
          console.log(`Rate limited on attempt ${attempt + 1}, waiting ${delay}ms`);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Double the delay for next attempt
            continue;
          }
          throw new Error('Rate limit exceeded after all retries');
        }

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const insight = data.choices[0].message.content;

        return new Response(
          JSON.stringify({ insight }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error('All retry attempts failed');
  } catch (error) {
    console.error('Error in generate-company-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        retryAfter: error.message.includes('Rate limit') ? 60 : undefined 
      }),
      { 
        status: error.message.includes('Rate limit') ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});