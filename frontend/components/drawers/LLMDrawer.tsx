import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';
import { initiateOAuth, consumeOAuthRedirect, OAUTH_CONFIGS, type OAuthProvider } from '@/lib/oauth';

type AuthMode = 'apikey' | 'oauth' | 'setup-token';

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
  freeNote?: string;
  apiKeyUrl?: string;
  apiKeySteps?: string[];
  supportsOAuth?: boolean;
  oauthProvider?: OAuthProvider;
  authType: 'oauth' | 'setup-token' | 'apikey';
  setupTokenSteps?: string[];
}

const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🟢',
    description: 'GPT-4o, o3, and more',
    freeNote: '✅ Uses your ChatGPT Plus subscription ($20/mo) — no per-token billing',
    supportsOAuth: true,
    oauthProvider: 'openai-codex',
    authType: 'oauth',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeySteps: [
      'Go to platform.openai.com and sign in (or create a free account)',
      'Click your profile icon in the top-right corner',
      'Select "API keys" from the menu',
      'Click "Create new secret key" — give it any name',
      'Copy the key immediately — you will NOT be able to see it again',
      'Paste it in the box below',
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🟣',
    description: 'Claude Sonnet, Opus, and more',
    freeNote: '✅ Uses your Claude.ai subscription ($20/mo) — no per-token billing',
    authType: 'setup-token',
    setupTokenSteps: [
      'First, make sure Claude Code is installed on your computer (it came with OpenClaw)',
      'Open Terminal: press Cmd+Space, type "Terminal", press Enter (on Mac) — or search "Terminal" in your Start menu (on Windows)',
      'Type this exactly and press Enter: claude setup-token',
      'A browser window will open — sign in to your Claude.ai account',
      'When the browser closes, look back at your Terminal window',
      'You will see a long code starting with "sk-" — copy the entire thing',
      'Paste it in the box below',
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: '🔵',
    description: 'Gemini model family',
    freeNote: '✅ Free — 1,500 requests/day on Gemini 2.0 Flash',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    apiKeySteps: [
      'Google AI Studio just opened in a new tab — switch to that tab now',
      'If asked, sign in with your Google account (the same one you use for Gmail)',
      'Click the blue "Create API key" button',
      'Select "Create API key in new project"',
      'Your key will appear — click the copy icon next to it',
      'Come back to this tab and paste it in the box below',
    ],
    supportsOAuth: true,
    oauthProvider: 'google',
    authType: 'oauth',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: '🟩',
    description: 'Accelerated inference',
    freeNote: '✅ Free tier — 1,000 req/month',
    apiKeyUrl: 'https://build.nvidia.com/explore/discover',
    apiKeySteps: [
      'Go to build.nvidia.com and click "Sign In" (top right) — create a free account if you do not have one',
      'Once logged in, click any model (for example "Llama 3.1")',
      'Look for "Get API Key" button — click it',
      'Click "Generate Personal Key"',
      'Copy the key (starts with "nvapi-")',
      'Paste it in the box below',
    ],
    authType: 'apikey',
  },
];

const MODELS: Record<string, string[]> = {
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o3-mini'],
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  google:    ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-pro'],
  nvidia:    [
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'meta/llama-3.1-405b-instruct',
    'meta/llama-3.1-8b-instruct',
    'mistralai/mixtral-8x7b-instruct-v0.1',
    'google/gemma-2-9b-it',
  ],
};

const TRIGGER_OPTIONS = [
  { value: 'rate_limit',    label: 'Rate Limit' },
  { value: 'error',         label: 'Error' },
  { value: 'cost_exceeded', label: 'Cost Exceeded' },
  { value: 'latency',       label: 'High Latency' },
];

const selectClass =
  'bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors';

const TEMP_DESCRIPTION =
  'Controls how predictable vs. creative the model\'s responses are. ' +
  'Low (0–0.3): precise, consistent, factual answers — great for coding and structured tasks. ' +
  'Mid (0.5–1.0): balanced — good for most assistant work. ' +
  'High (1.2–2.0): more varied and creative, but can drift or hallucinate. Start at 0.7 and adjust.';

// ── localStorage helpers ──────────────────────────────────────────────────────

interface StoredAuth {
  authType: string;
  token: string;
  refreshToken?: string;
  expires?: number;
}

function saveAuthToStorage(providerId: string, data: StoredAuth) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`agentforge_auth_${providerId}`, JSON.stringify(data));
}

function clearAuthFromStorage(providerId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`agentforge_auth_${providerId}`);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LLMDrawer({ open, onClose }: Props) {
  const llm = useAgentStore((s) => s.llm);
  const setLLM = useAgentStore((s) => s.setLLM);
  const targetOS = useAgentStore((s) => s.targetOS);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [oauthTokens, setOAuthTokens] = useState<Record<string, string>>({});
  const [setupTokens, setSetupTokens] = useState<Record<string, string>>({});
  const [authModes, setAuthModes] = useState<Record<string, AuthMode>>({});
  const [oauthClientIds, setOAuthClientIds] = useState<Record<string, string>>({});
  const [setupOpen, setSetupOpen] = useState<string | null>(null);
  const [fallbackAuthOpen, setFallbackAuthOpen] = useState<Record<number, boolean>>({});

  // Load saved auth from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    PROVIDERS.forEach((p) => {
      const raw = localStorage.getItem(`agentforge_auth_${p.id}`);
      if (!raw) return;
      try {
        const data: StoredAuth = JSON.parse(raw);
        if (!data.token) return;
        if (p.authType === 'oauth' && p.oauthProvider) {
          setOAuthTokens((prev) => ({ ...prev, [p.oauthProvider!]: data.token }));
        } else if (p.authType === 'setup-token') {
          setSetupTokens((prev) => ({ ...prev, [p.id]: data.token }));
        } else if (p.authType === 'apikey') {
          setApiKeys((prev) => ({ ...prev, [p.id]: data.token }));
        }
      } catch {}
    });
  }, []);

  // Consume OAuth redirect on mount (user came back from provider)
  useEffect(() => {
    const result = consumeOAuthRedirect();
    if (result) {
      setOAuthTokens((prev) => ({ ...prev, [result.provider]: result.token }));
      // Find the provider by oauthProvider name and open its panel
      const providerInfo = PROVIDERS.find((p) => p.oauthProvider === result.provider);
      if (providerInfo) {
        saveAuthToStorage(providerInfo.id, { authType: 'oauth', token: result.token });
        setSetupOpen(providerInfo.id);
      }
    }
  }, []);

  const currentModels = MODELS[llm.provider] ?? [];
  const selectedProviderInfo = PROVIDERS.find((p) => p.id === llm.provider);

  function getAuthMode(providerId: string): AuthMode {
    if (authModes[providerId]) return authModes[providerId];
    const p = PROVIDERS.find((x) => x.id === providerId);
    return (p?.authType as AuthMode) ?? 'apikey';
  }

  function isProviderConnected(providerId: string): boolean {
    const p = PROVIDERS.find((x) => x.id === providerId);
    if (!p) return false;
    if (p.authType === 'oauth' && p.oauthProvider) return !!oauthTokens[p.oauthProvider];
    if (p.authType === 'setup-token') return !!setupTokens[p.id];
    return !!apiKeys[p.id];
  }

  function handleProviderSelect(id: string) {
    const firstModel = MODELS[id]?.[0] ?? '';
    const chain = [...llm.fallbackChain];
    if (chain.length > 0) {
      chain[0] = { ...chain[0], provider: id, model: firstModel };
    } else {
      chain[0] = { provider: id, model: firstModel, trigger: 'rate_limit' };
    }
    setLLM({ provider: id, model: firstModel, fallbackChain: chain });
    setSetupOpen(id);
  }

  function handleFallbackChange(index: number, field: 'provider' | 'model' | 'trigger', value: string) {
    const chain: { provider: string; model: string; trigger: string }[] =
      llm.fallbackChain.length >= 3
        ? [...llm.fallbackChain]
        : [
            llm.fallbackChain[0] ?? { provider: llm.provider, model: llm.model, trigger: 'rate_limit' },
            llm.fallbackChain[1] ?? { provider: '', model: '', trigger: 'rate_limit' },
            llm.fallbackChain[2] ?? { provider: '', model: '', trigger: 'rate_limit' },
          ];
    if (field === 'provider') {
      chain[index] = { ...chain[index], provider: value, model: MODELS[value]?.[0] ?? '' };
    } else {
      chain[index] = { ...chain[index], [field]: value };
    }
    setLLM({ fallbackChain: chain });
  }

  const fallbackRows = [
    llm.fallbackChain[0] ?? { provider: llm.provider, model: llm.model, trigger: 'rate_limit' },
    llm.fallbackChain[1] ?? { provider: '', model: '', trigger: 'rate_limit' },
    llm.fallbackChain[2] ?? { provider: '', model: '', trigger: 'rate_limit' },
  ];

  const rowLabels = ['Primary', 'Fallback 1', 'Fallback 2'];

  // ── Auth panel renderers ───────────────────────────────────────────────────

  function renderOpenAIPanel(p: Provider) {
    const mode = getAuthMode(p.id);
    const oauthKey = p.oauthProvider!;
    const connected = !!oauthTokens[oauthKey];

    if (mode === 'apikey') {
      return (
        <div className="space-y-2">
          <button
            onClick={() => setAuthModes((prev) => ({ ...prev, [p.id]: 'oauth' }))}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            ← Back to Sign in with ChatGPT
          </button>
          {p.apiKeySteps && (
            <ol className="space-y-1">
              {p.apiKeySteps.map((step, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <input
            type="password"
            placeholder="Paste your OpenAI API key"
            value={apiKeys[p.id] ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setApiKeys((prev) => ({ ...prev, [p.id]: val }));
              if (val) saveAuthToStorage(p.id, { authType: 'apikey', token: val });
              else clearAuthFromStorage(p.id);
            }}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          {apiKeys[p.id] && <p className="text-xs text-[#76b900]">✓ Key saved</p>}
          {p.apiKeyUrl && (
            <a href={p.apiKeyUrl} target="_blank" rel="noreferrer" className="text-xs text-[#00d4ff] hover:underline">
              → Get your API key at {p.apiKeyUrl.replace('https://', '')}
            </a>
          )}
        </div>
      );
    }

    // OAuth mode
    return (
      <div className="space-y-3">
        {connected ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#76b900]/10 border border-[#76b900]/30">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-[#76b900]">Connected to ChatGPT</p>
              <p className="text-xs text-gray-400">OAuth token stored — your agent will use it automatically</p>
            </div>
            <button
              onClick={() => {
                setOAuthTokens((prev) => ({ ...prev, [oauthKey]: '' }));
                clearAuthFromStorage(p.id);
              }}
              className="ml-auto text-xs text-gray-500 hover:text-red-400"
            >
              disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              This uses your ChatGPT Plus subscription ($20/mo) — no extra charges. Click the button below to sign in.
            </p>
            {/* Web/Vercel notice — OAuth only works in the desktop app */}
            {typeof window !== 'undefined' && !window.electronAPI && (
              <div style={{ background: '#1a1200', border: '1px solid #92400e', borderRadius: 6, padding: '8px 12px' }}>
                <p className="text-xs" style={{ color: '#fbbf24' }}>
                  ⚠️ ChatGPT sign-in works in the <strong>desktop app</strong>. You&apos;re currently in the browser preview — use an API key below to test here.
                </p>
              </div>
            )}
            <button
              onClick={async () => {
                // Desktop app: use Electron IPC OAuth flow
                if (typeof window !== 'undefined' && window.electronAPI) {
                  const config = OAUTH_CONFIGS['openai-codex'];
                  const clientId = process.env.NEXT_PUBLIC_OPENAI_CLIENT_ID || config.defaultClientId!;
                  const redirectUri = `http://127.0.0.1:1455/auth/callback`;
                  await initiateOAuth('openai-codex', clientId, redirectUri);
                  return;
                }
                // Browser fallback: show API key mode
                setAuthModes((prev) => ({ ...prev, [p.id]: 'apikey' }));
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#10a37f] text-white font-medium text-sm hover:bg-[#0d8f6e] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.212-2.415 10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.212 2.414 10.079 10.079 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.998l-4.331 2.5-4.331-2.5V18z" fill="currentColor"/>
              </svg>
              Sign in with ChatGPT
            </button>
            <button
              onClick={() => setAuthModes((prev) => ({ ...prev, [p.id]: 'apikey' }))}
              className="text-xs text-gray-500 hover:text-gray-300 underline w-full text-center"
            >
              I have an API key instead
            </button>
          </div>
        )}
      </div>
    );
  }

  function getAnthropicSetupSteps(): string[] {
    const openTerminalStep =
      targetOS === 'mac'
        ? 'Open Terminal: press Cmd+Space, type "Terminal", press Enter'
        : targetOS === 'windows'
        ? 'Open Terminal: press the Windows key, type "Terminal" or "Command Prompt", press Enter'
        : targetOS === 'linux'
        ? 'Open Terminal: press Ctrl+Alt+T to open a terminal'
        : 'Open Terminal: on Mac press Cmd+Space and type "Terminal"; on Windows press the Windows key and type "Terminal"; on Linux press Ctrl+Alt+T';

    return [
      'First, make sure Claude Code is installed on your computer (it came with OpenClaw)',
      openTerminalStep,
      'Type this exactly and press Enter: claude setup-token',
      'A browser window will open — sign in to your Claude.ai account',
      'When the browser closes, look back at your Terminal window',
      'You will see a long code starting with "sk-" — copy the entire thing',
      'Paste it in the box below',
    ];
  }

  function renderAnthropicPanel(p: Provider) {
    const token = setupTokens[p.id] ?? '';
    const connected = !!token;
    const dynamicSteps = getAnthropicSetupSteps();

    return (
      <div className="space-y-3">
        {connected ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#76b900]/10 border border-[#76b900]/30">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-[#76b900]">Connected to Claude.ai</p>
              <p className="text-xs text-gray-400">Setup token stored — your agent will use your subscription</p>
            </div>
            <button
              onClick={() => {
                setSetupTokens((prev) => ({ ...prev, [p.id]: '' }));
                clearAuthFromStorage(p.id);
              }}
              className="ml-auto text-xs text-gray-500 hover:text-red-400"
            >
              disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Connect your Claude.ai subscription</p>
            <ol className="space-y-1">
              {dynamicSteps.map((step, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <input
              type="password"
              placeholder="Paste your setup token here"
              value={token}
              onChange={(e) => {
                const val = e.target.value;
                setSetupTokens((prev) => ({ ...prev, [p.id]: val }));
                if (val) saveAuthToStorage(p.id, { authType: 'setup-token', token: val });
                else clearAuthFromStorage(p.id);
              }}
              className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
            />
            <p className="text-xs text-yellow-500 leading-relaxed">
              ⚠️ This uses your Claude.ai subscription. Make sure you have an active plan at claude.ai
            </p>
          </div>
        )}
      </div>
    );
  }

  function renderGooglePanel(p: Provider) {
    const oauthKey = p.oauthProvider!;
    const connected = !!oauthTokens[oauthKey];
    const mode = getAuthMode(p.id);

    if (mode === 'apikey') {
      return (
        <div className="space-y-2">
          <button
            onClick={() => setAuthModes((prev) => ({ ...prev, [p.id]: 'oauth' }))}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            ← Back to Sign in with Google
          </button>
          {p.apiKeySteps && (
            <ol className="space-y-1">
              {p.apiKeySteps.map((step, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <input
            type="password"
            placeholder="Paste your Google API key"
            value={apiKeys[p.id] ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setApiKeys((prev) => ({ ...prev, [p.id]: val }));
              if (val) saveAuthToStorage(p.id, { authType: 'apikey', token: val });
              else clearAuthFromStorage(p.id);
            }}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          {apiKeys[p.id] && <p className="text-xs text-[#76b900]">✓ Key saved</p>}
        </div>
      );
    }

    // OAuth mode
    return (
      <div className="space-y-3">
        {connected ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#76b900]/10 border border-[#76b900]/30">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm font-medium text-[#76b900]">Connected to Google</p>
              <p className="text-xs text-gray-400">OAuth token stored — your agent will use it automatically</p>
            </div>
            <button
              onClick={() => {
                setOAuthTokens((prev) => ({ ...prev, [oauthKey]: '' }));
                clearAuthFromStorage(p.id);
              }}
              className="ml-auto text-xs text-gray-500 hover:text-red-400"
            >
              disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign in with Google to authorize Gemini access. No API key needed — one click and you&apos;re done.
            </p>
            <button
              onClick={async () => {
                const sharedClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                const clientId = sharedClientId || oauthClientIds['google'];
                if (!clientId) {
                  // Open AI Studio in a new tab, then show API key instructions
                  window.open('https://aistudio.google.com/app/apikey', '_blank');
                  setAuthModes((prev) => ({ ...prev, [p.id]: 'apikey' }));
                  return;
                }
                const redirectUri = `${window.location.origin}/api/auth/callback`;
                await initiateOAuth('google', clientId, redirectUri);
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <details className="group">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 list-none flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                  Using your own Google Cloud project?
                </summary>
                <div className="mt-2 space-y-2">
                  <ol className="space-y-1">
                    {OAUTH_CONFIGS.google.setupSteps.map((step, i) => (
                      <li key={i} className="text-xs text-gray-400 flex gap-2">
                        <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <input
                    type="text"
                    placeholder="Paste your Google Client ID"
                    value={oauthClientIds['google'] ?? ''}
                    onChange={(e) => setOAuthClientIds((prev) => ({ ...prev, google: e.target.value }))}
                    className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900]"
                  />
                  <a href={OAUTH_CONFIGS.google.setupUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-[#00d4ff] hover:underline block">
                    → Open Google Cloud Console
                  </a>
                </div>
              </details>
            )}
            <button
              onClick={() => setAuthModes((prev) => ({ ...prev, [p.id]: 'apikey' }))}
              className="text-xs text-gray-500 hover:text-gray-300 underline w-full text-center"
            >
              I have an API key instead
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderNvidiaPanel(p: Provider) {
    return (
      <div className="space-y-2">
        {p.apiKeySteps && (
          <ol className="space-y-1">
            {p.apiKeySteps.map((step, i) => (
              <li key={i} className="text-xs text-gray-400 flex gap-2">
                <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}
        <input
          type="password"
          placeholder="Paste your NVIDIA NIM API key"
          value={apiKeys[p.id] ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            setApiKeys((prev) => ({ ...prev, [p.id]: val }));
            if (val) saveAuthToStorage(p.id, { authType: 'apikey', token: val });
            else clearAuthFromStorage(p.id);
          }}
          className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
        />
        {apiKeys[p.id] && <p className="text-xs text-[#76b900]">✓ Key saved</p>}
        <p className="text-xs text-gray-500">Free tier includes 1,000 requests/month. No credit card required.</p>
        {p.apiKeyUrl && (
          <a href={p.apiKeyUrl} target="_blank" rel="noreferrer" className="text-xs text-[#00d4ff] hover:underline">
            → Get your API key at {p.apiKeyUrl.replace('https://', '')}
          </a>
        )}
      </div>
    );
  }

  function renderAuthPanel(p: Provider) {
    switch (p.id) {
      case 'openai':    return renderOpenAIPanel(p);
      case 'anthropic': return renderAnthropicPanel(p);
      case 'google':    return renderGooglePanel(p);
      case 'nvidia':    return renderNvidiaPanel(p);
      default:          return null;
    }
  }

  // ── Compact auth panel for fallback rows ───────────────────────────────────

  function renderCompactAuthPanel(providerId: string) {
    const p = PROVIDERS.find((x) => x.id === providerId);
    if (!p) return null;

    const connected = isProviderConnected(providerId);

    if (connected) {
      return (
        <p className="text-xs text-[#76b900] py-1">✅ Already connected</p>
      );
    }

    // Amber warning note
    const warningNote = (
      <p className="text-xs text-amber-400 leading-relaxed">
        ⚠️ Optional — only needed if your primary model goes down
      </p>
    );

    if (p.authType === 'setup-token') {
      const token = setupTokens[p.id] ?? '';
      return (
        <div className="space-y-2">
          {warningNote}
          {p.setupTokenSteps && (
            <ol className="space-y-1">
              {p.setupTokenSteps.map((step, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <input
            type="password"
            placeholder="Paste your setup token here"
            value={token}
            onChange={(e) => {
              const val = e.target.value;
              setSetupTokens((prev) => ({ ...prev, [p.id]: val }));
              if (val) saveAuthToStorage(p.id, { authType: 'setup-token', token: val });
              else clearAuthFromStorage(p.id);
            }}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          {token && <p className="text-xs text-[#76b900]">✓ Token saved</p>}
        </div>
      );
    }

    if (p.authType === 'oauth') {
      // For compact fallback, show API key option (simpler than OAuth redirect flow)
      const steps = p.apiKeySteps;
      const apiKey = apiKeys[p.id] ?? '';
      const isGoogle = p.id === 'google';
      return (
        <div className="space-y-2">
          {warningNote}
          {steps && (
            <ol className="space-y-1">
              {steps.map((step, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          <input
            type="password"
            placeholder={isGoogle ? 'Paste your Google API key' : 'Paste your OpenAI API key'}
            value={apiKey}
            onChange={(e) => {
              const val = e.target.value;
              setApiKeys((prev) => ({ ...prev, [p.id]: val }));
              if (val) saveAuthToStorage(p.id, { authType: 'apikey', token: val });
              else clearAuthFromStorage(p.id);
            }}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          {apiKey && <p className="text-xs text-[#76b900]">✓ Key saved</p>}
        </div>
      );
    }

    // apikey
    const apiKey = apiKeys[p.id] ?? '';
    return (
      <div className="space-y-2">
        {warningNote}
        {p.apiKeySteps && (
          <ol className="space-y-1">
            {p.apiKeySteps.map((step, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}
        <input
          type="password"
          placeholder={`Paste your ${p.name} API key`}
          value={apiKey}
          onChange={(e) => {
            const val = e.target.value;
            setApiKeys((prev) => ({ ...prev, [p.id]: val }));
            if (val) saveAuthToStorage(p.id, { authType: 'apikey', token: val });
            else clearAuthFromStorage(p.id);
          }}
          className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
        />
        {apiKey && <p className="text-xs text-[#76b900]">✓ Key saved</p>}
        {p.id === 'nvidia' && (
          <p className="text-xs text-gray-500">Free tier includes 1,000 requests/month. No credit card required.</p>
        )}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">LLM / Brain</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            This is your agent&apos;s brain. You&apos;re choosing which AI model powers it. Not sure? Pick Anthropic Claude — it&apos;s reliable, smart, and works well for most tasks.
          </p>
        </div>

        {/* Provider Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((p) => {
              const selected = llm.provider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProviderSelect(p.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-[#76b900] bg-[#76b900]/10'
                      : 'border-[#1e2d3d] bg-[#1a1a2e] hover:border-[#76b900]/40'
                  }`}
                >
                  <span className="text-xl leading-none mt-0.5 shrink-0">{p.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                    {p.freeNote && (
                      <p className="text-xs text-[#76b900] mt-1 leading-tight">{p.freeNote}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Setup Panel — shows when a provider is selected */}
        {selectedProviderInfo && setupOpen === llm.provider && (
          <div className="rounded-lg border border-[#1e2d3d] bg-[#0e0e1a] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{selectedProviderInfo.name} Setup</p>
              <button onClick={() => setSetupOpen(null)} className="text-xs text-gray-500 hover:text-gray-300">
                dismiss
              </button>
            </div>

            {renderAuthPanel(selectedProviderInfo)}
          </div>
        )}

        {/* Model Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Model</label>
          <select
            value={llm.model}
            onChange={(e) => setLLM({ model: e.target.value })}
            disabled={!llm.provider}
            className={`w-full ${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {!llm.provider && <option value="">Select a provider first</option>}
            {currentModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Temperature</label>
              <div className="group relative">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
                <div className="absolute right-0 bottom-full z-50 hidden group-hover:block w-72 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
                  <p className="text-xs text-gray-300 leading-relaxed">{TEMP_DESCRIPTION}</p>
                </div>
              </div>
            </div>
            <span className="text-sm text-[#76b900] font-mono">{llm.temperature.toFixed(2)}</span>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.01}
            value={[llm.temperature]}
            onValueChange={(val) => setLLM({ temperature: Array.isArray(val) ? (val as number[])[0] : (val as number) })}
            className="w-full"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Deterministic</span>
            <span className="text-xs text-gray-500">Creative</span>
          </div>
          <p className="text-xs text-gray-600 italic">
            {llm.temperature <= 0.3
              ? 'Very predictable — best for data tasks and coding'
              : llm.temperature <= 0.7
              ? 'Balanced — good for most assistant work'
              : llm.temperature <= 1.2
              ? 'Creative — good for writing and brainstorming'
              : 'Very creative — may produce unexpected results'}
          </p>
        </div>

        {/* Fallback Chain */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-300">Fallback Chain</h3>
            <div className="group relative">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
              <div className="absolute right-0 bottom-full z-50 hidden group-hover:block w-72 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
                <p className="text-xs text-gray-300 leading-relaxed">
                  If your primary model fails, the agent automatically switches to the next one in line.
                  Primary is set to match your provider selection above. Add Fallback 1 and 2 for resilience.
                </p>
              </div>
            </div>
          </div>

          {fallbackRows.map((row, i) => {
            const rowModels = MODELS[row.provider] ?? [];
            const isFallback = i >= 1;
            const showAuthPrompt = isFallback && !!row.provider && row.provider !== llm.provider;
            const isAuthOpen = fallbackAuthOpen[i] ?? false;
            const providerInfo = PROVIDERS.find((p) => p.id === row.provider);

            return (
              <div key={i} className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{rowLabels[i]}</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={row.provider}
                    onChange={(e) => handleFallbackChange(i, 'provider', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Provider</option>
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <select
                    value={row.model}
                    onChange={(e) => handleFallbackChange(i, 'model', e.target.value)}
                    disabled={!row.provider}
                    className={`${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <option value="">Model</option>
                    {rowModels.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={row.trigger}
                    onChange={(e) => handleFallbackChange(i, 'trigger', e.target.value)}
                    className={selectClass}
                  >
                    {TRIGGER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Collapsible auth prompt for Fallback 1 / Fallback 2 */}
                {showAuthPrompt && providerInfo && (
                  <div className="mt-1">
                    <button
                      onClick={() => setFallbackAuthOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <span
                        className="inline-block transition-transform duration-150"
                        style={{ transform: isAuthOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ▶
                      </span>
                      Optional: Connect {providerInfo.name} ↓
                    </button>

                    {isAuthOpen && (
                      <div className="mt-2 rounded-md border border-[#1e2d3d] bg-[#0e0e1a] p-3">
                        {renderCompactAuthPanel(row.provider)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
