// OAuth PKCE utility — works client-side, no backend required for the auth initiation.
// The callback route handles code exchange if env vars are set; otherwise falls back
// to letting the user paste their own client ID for a bring-your-own-credentials flow.

export type OAuthProvider = 'google' | 'github';

interface OAuthConfig {
  authUrl: string;
  scopes: string[];
  clientIdEnvHint: string; // shown in UI if env var not set
  setupUrl: string;
  setupSteps: string[];
  freeNote?: string;
}

export const OAUTH_CONFIGS: Record<OAuthProvider, OAuthConfig> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/generative-language',
      'openid',
      'email',
      'profile',
    ],
    clientIdEnvHint: 'GOOGLE_CLIENT_ID',
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    setupSteps: [
      'Go to Google Cloud Console → APIs & Services → Credentials',
      'Create OAuth 2.0 Client ID → Web application',
      'Add your app URL to Authorized redirect URIs',
      'Copy the Client ID and paste it below',
    ],
    freeNote: '✅ Free — Gemini 2.0 Flash: 1,500 req/day, 1M tokens/min',
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    scopes: ['read:user', 'repo'],
    clientIdEnvHint: 'GITHUB_CLIENT_ID',
    setupUrl: 'https://github.com/settings/applications/new',
    setupSteps: [
      'Go to GitHub → Settings → Developer settings → OAuth Apps',
      'Click "New OAuth App"',
      'Set callback URL to your app URL + /api/auth/callback',
      'Copy the Client ID below',
    ],
  },
};

// Generate a PKCE code verifier + challenge
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { verifier, challenge };
}

export async function initiateOAuth(
  provider: OAuthProvider,
  clientId: string,
  redirectUri: string
): Promise<void> {
  const config = OAUTH_CONFIGS[provider];
  const { verifier, challenge } = await generatePKCE();

  // Encode provider + verifier in state (base64 JSON)
  const state = btoa(JSON.stringify({ provider, codeVerifier: verifier }));

  // Persist verifier for code exchange (callback reads this)
  sessionStorage.setItem(`oauth_verifier_${provider}`, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'offline',   // Google: get refresh token too
    prompt: 'consent',
  });

  window.location.href = `${config.authUrl}?${params.toString()}`;
}

// Listen for the OAuth redirect back — reads fragment hash set by callback route
export function consumeOAuthRedirect(): { provider: string; token: string } | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.slice(1);
  if (!hash.includes('oauth_token')) return null;

  const params = new URLSearchParams(hash);
  const provider = params.get('oauth_provider');
  const token = params.get('oauth_token');

  if (!provider || !token) return null;

  // Clean the fragment from the URL
  window.history.replaceState(null, '', window.location.pathname);

  return { provider, token: decodeURIComponent(token) };
}
