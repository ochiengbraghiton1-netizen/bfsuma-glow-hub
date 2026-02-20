import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INDEXNOW_KEY = 'c8e1b2a4f3d5e6f7a8b9c0d1e2f3a4b5';
const SITE_HOST = 'bfsumaroyal.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, type } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'urls array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build full URLs
    const fullUrls = urls.map((u: string) =>
      u.startsWith('http') ? u : `https://${SITE_HOST}${u}`
    );

    console.log(`[IndexNow] Submitting ${fullUrls.length} URLs (type: ${type || 'unknown'}):`, fullUrls);

    const body = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: fullUrls,
    };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const status = response.status;
    let responseText = '';
    try {
      responseText = await response.text();
    } catch { /* empty */ }

    console.log(`[IndexNow] Response status: ${status}, body: ${responseText}`);

    // IndexNow returns 200 or 202 on success
    if (status === 200 || status === 202) {
      return new Response(JSON.stringify({
        success: true,
        status,
        submitted: fullUrls.length,
        urls: fullUrls,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      status,
      message: responseText || 'IndexNow API returned an error',
    }), {
      status: 200, // Return 200 to caller so it doesn't break workflows
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[IndexNow] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
