import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { businessData } = await req.json()
    console.log('Received business data:', businessData)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst assistant. Analyze the provided business data and provide actionable insights.'
          },
          {
            role: 'user',
            content: `Please analyze this business data and provide a concise insight: ${JSON.stringify(businessData)}`
          }
        ],
      }),
    })

    const data = await response.json()
    console.log('OpenAI response:', data)

    const insight = data.choices[0].message.content

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the insight in the database
    const { error: insertError } = await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: businessData.userId,
        content_type: 'business_analysis',
        content: insight
      })

    if (insertError) {
      console.error('Error storing insight:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-insight function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})