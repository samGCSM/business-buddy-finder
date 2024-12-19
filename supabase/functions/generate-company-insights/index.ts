import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateInsight(businessName: string, website: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Generating insight for:', businessName, 'website:', website);

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
          content: 'You are a business analyst providing insights about companies. Be concise and focus on actionable recommendations.'
        },
        {
          role: 'user',
          content: `Please analyze the business "${businessName}" with website "${website}" and provide insights about their online presence, potential opportunities, and areas for improvement. Focus on actionable recommendations.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, website } = await req.json();
    console.log('Received request for business:', businessName);

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: 'Business name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const insight = await generateInsight(businessName, website || '');
    
    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-company-insights function:', error);
    
    // Handle rate limiting specifically
    if (error.message?.includes('429')) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: 60
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});