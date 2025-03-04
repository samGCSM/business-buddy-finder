
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  domain?: string;
  companyName?: string;
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { domain, companyName } = await req.json() as RequestBody;

    if (!domain && !companyName) {
      throw new Error('Either domain or company name is required');
    }

    const HUNTER_API_KEY = Deno.env.get('HUNTER_IO_API_KEY');
    if (!HUNTER_API_KEY) {
      throw new Error('Hunter.io API key not configured');
    }

    // Prepare the API URL based on available data
    let apiUrl: string;
    if (domain) {
      apiUrl = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${HUNTER_API_KEY}`;
    } else {
      apiUrl = `https://api.hunter.io/v2/email-finder?company=${encodeURIComponent(companyName)}&api_key=${HUNTER_API_KEY}`;
    }

    console.log('Calling Hunter.io API for:', domain || companyName);
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Hunter.io API error:', data);
      throw new Error(data.errors?.[0]?.details || 'Failed to fetch email data');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in enrich-prospect-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
