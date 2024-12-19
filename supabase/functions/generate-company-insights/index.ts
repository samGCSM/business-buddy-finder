import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

async function handleRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<Response> {
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await fn();
      
      return new Response(
        JSON.stringify({ insight: completion.data.choices[0].text.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers.get('retry-after') || '60', 10);
        console.log(`Rate limited on attempt ${attempt + 1}, retry after ${retryAfter}s`);
        
        if (attempt === maxRetries - 1) {
          return new Response(
            JSON.stringify({ 
              error: 'Rate limit exceeded after all retries',
              retryAfter: retryAfter
            }),
            { 
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      if (attempt === maxRetries - 1) {
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${error.response?.status || error.message}` }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Max retries exceeded');
}

async function generateInsight(businessName: string, website: string) {
  const prompt = `Please analyze the business "${businessName}" with website "${website}" and provide insights about their online presence, potential opportunities, and areas for improvement. Focus on actionable recommendations.`;

  return openai.createCompletion({
    model: 'gpt-4o-mini',
    prompt,
    max_tokens: 500,
    temperature: 0.7,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { businessName, website } = await req.json();
    
    if (!businessName) {
      return new Response(
        JSON.stringify({ error: 'Business name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return await handleRetry(() => generateInsight(businessName, website));
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});