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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst providing detailed company insights and contact information.'
          },
          {
            role: 'user',
            content: `Summarize what ${businessName} (${website}) does, who owns it, who runs it, and who are their competitors. Also find emails for employees and managers if possible.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
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
        JSON.stringify({ error: result.message }),
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
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});