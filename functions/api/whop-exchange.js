export async function onRequestPost(context) {
  const WHOP_CLIENT_ID = 'app_1Es2LxCfU8Efjy';
  const WHOP_CLIENT_SECRET = 'apik_zxuQziDVJqDPh_A2033124_C_6dd4375ca3bec0f0803c10a501b6bd9aed41227247efa30c5eb50fce58c640';
  const WHOP_EXP_ID = 'exp_U0aGTG8Sis05pg';
  const REDIRECT_URI = 'https://sports-card-counters.jlk12493.workers.dev/';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { code } = await context.request.json();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400, headers: corsHeaders });
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://api.whop.com/v5/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: WHOP_CLIENT_ID,
        client_secret: WHOP_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: 'Token exchange failed', detail: tokenData }), { status: 400, headers: corsHeaders });
    }

    // Get user info
    const userRes = await fetch('https://api.whop.com/v5/me', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
    });
    const userData = await userRes.json();

    if (!userData.email) {
      return new Response(JSON.stringify({ error: 'Could not get email from Whop' }), { status: 400, headers: corsHeaders });
    }

    // Check membership
    const accessRes = await fetch('https://api.whop.com/v5/me/has_access/' + WHOP_EXP_ID, {
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
    });
    const accessData = await accessRes.json();

    return new Response(JSON.stringify({
      email: userData.email,
      username: userData.username || null,
      has_access: accessData.has_access === true,
    }), { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Function error: ' + err.message }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

