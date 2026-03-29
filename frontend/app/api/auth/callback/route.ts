import { NextRequest, NextResponse } from 'next/server';

// OAuth callback handler — receives authorization code, exchanges for access token,
// stores in a short-lived cookie, then redirects back to the app.
// Works for Google (Gemini) and GitHub.

const PROVIDERS: Record<string, {
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
}> = {
  google: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  github: {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientIdEnv: 'GITHUB_CLIENT_ID',
    clientSecretEnv: 'GITHUB_CLIENT_SECRET',
  },
  'openai-codex': {
    tokenUrl: 'https://auth.openai.com/oauth/token',
    clientIdEnv: 'OPENAI_CLIENT_ID',
    clientSecretEnv: 'OPENAI_CLIENT_SECRET',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // encodes provider + code_verifier
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/?oauth_error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?oauth_error=missing_params', request.url));
  }

  let parsedState: { provider: string; codeVerifier?: string };
  try {
    parsedState = JSON.parse(atob(state));
  } catch {
    return NextResponse.redirect(new URL('/?oauth_error=invalid_state', request.url));
  }

  const { provider, codeVerifier } = parsedState;
  const providerConfig = PROVIDERS[provider];

  if (!providerConfig) {
    return NextResponse.redirect(new URL('/?oauth_error=unknown_provider', request.url));
  }

  const clientId = process.env[providerConfig.clientIdEnv];
  const clientSecret = process.env[providerConfig.clientSecretEnv];

  // If env vars aren't set, redirect back with the code for client-side handling
  // (useful for local dev where user supplies their own client ID)
  if (!clientId || !clientSecret) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('oauth_code', code);
    redirectUrl.searchParams.set('oauth_provider', provider);
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUri = new URL('/api/auth/callback', request.url).toString();

  // Build token request body
  const body: Record<string, string> = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };
  if (codeVerifier) body.code_verifier = codeVerifier;

  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (provider === 'github') headers['Accept'] = 'application/json';

  try {
    const tokenRes = await fetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body),
    });
    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token ?? '';

    if (!accessToken) {
      return NextResponse.redirect(new URL(`/?oauth_error=no_token`, request.url));
    }

    // Redirect back to app with token in fragment (never in query param — stays client-side)
    const successUrl = new URL('/', request.url);
    successUrl.hash = `oauth_provider=${provider}&oauth_token=${encodeURIComponent(accessToken)}`;
    const response = NextResponse.redirect(successUrl);
    return response;

  } catch {
    return NextResponse.redirect(new URL('/?oauth_error=token_exchange_failed', request.url));
  }
}
