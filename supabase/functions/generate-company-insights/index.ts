import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openAIApiKey) {
  throw new Error('OpenAI API key not configured');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateInsight(businessName: string, website: string) {
  console.log('Generating insight for:', businessName, 'website:', website);

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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error response:', data);
      
      // Handle quota exceeded error
      if (data.error?.message?.includes('exceeded your current quota')) {
        return {
          error: true,
          message: 'OpenAI API quota exceeded. Please check your billing details.',
          status: 402 // Payment Required
        };
      }
      
      return {
        error: true,
        message: data.error?.message || 'OpenAI API error',
        status: response.status
      };
    }

    return {
      error: false,
      content: data.choices[0].message.content.trim(),
      status: 200
    };
  } catch (error) {
    console.error('Error in generateInsight:', error);
    return {
      error: true,
      message: error.message || 'Internal server error',
      status: 500
    };
  }
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

    const result = await generateInsight(businessName, website || '');
    console.log('Generate insight result:', result);

    if (result.error) {
      return new Response(
        JSON.stringify({ 
          error: result.message,
          isQuotaError: result.status === 402
        }),
        { 
          status: result.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ insight: result.content }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-company-insights function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});