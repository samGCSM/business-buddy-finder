import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPEN_AI_NEW_KEY');
console.log('OpenAI API Key present:', !!openAIApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType, insightType } = await req.json();
    console.log(`Generating ${insightType} for user ${userId} (${userType})`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
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

    console.log('Sending prompt to OpenAI:', prompt);

    // Call OpenAI API
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
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received:', openAIData);

    if (!openAIData.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', openAIData);
      throw new Error('Invalid response from OpenAI');
    }

    const generatedContent = openAIData.choices[0].message.content;
    console.log('Generated content:', generatedContent);

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