import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  userId: number;
  userType: string;
  insightType: 'pep_talk' | 'recommendations';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userType, insightType } = await req.json() as InsightRequest;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
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

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0].message.content;

    // Store the generated insight
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        content_type: insightType,
        content: generatedContent,
      });

    if (insertError) throw insertError;

    // Update tracking table
    const trackingColumn = insightType === 'pep_talk' ? 'last_pep_talk_date' : 'last_recommendations_date';
    const { error: trackingError } = await supabase
      .from('user_insights_tracking')
      .upsert({
        user_id: userId,
        [trackingColumn]: new Date().toISOString().split('T')[0],
      });

    if (trackingError) throw trackingError;

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