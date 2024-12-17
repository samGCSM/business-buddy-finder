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

async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to generate content with prompt: ${prompt}`);
      
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not configured');
      }

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

      const data = await openAIResponse.json();
      console.log('Generated content successfully');
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
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
        prompt = "As a motivational sales coach like Grant Cardone or Tony Robbins, provide a 4-sentence energizing pep talk for a salesperson to boost their confidence and drive.";
      } else if (userType === 'supervisor') {
        prompt = "As a sales leadership expert, provide 4 sentences of motivation and management advice for a sales team supervisor.";
      } else if (userType === 'admin') {
        prompt = "As a business analytics expert, provide 4 sentences highlighting key areas to focus on for managing a sales organization effectively.";
      }
    } else if (insightType === 'recommendations') {
      if (userType === 'user') {
        prompt = "Provide 3 specific, actionable tips for a salesperson to improve their prospecting success rate in the next week.";
      } else if (userType === 'supervisor') {
        prompt = "Provide 3 specific strategies for a sales supervisor to better support and develop their team in the coming week.";
      } else if (userType === 'admin') {
        prompt = "Provide 3 data-driven insights for optimizing sales team performance and resource allocation in the next week.";
      }
    }

    console.log('Generating content with prompt:', prompt);
    const generatedContent = await generateWithRetry(prompt);
    console.log('Generated content:', generatedContent);

    // Store the new insight
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        content_type: insightType,
        content: generatedContent,
      });

    if (insertError) {
      console.error('Error storing insight:', insertError);
      // Continue anyway - we can still return the content even if storing fails
    }

    // Update the tracking record
    const { error: trackingError } = await supabase
      .from('user_insights_tracking')
      .upsert({
        user_id: userId,
        [insightType === 'pep_talk' ? 'last_pep_talk_date' : 'last_recommendations_date']: new Date().toISOString().split('T')[0]
      });

    if (trackingError) {
      console.error('Error updating tracking:', trackingError);
    }

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