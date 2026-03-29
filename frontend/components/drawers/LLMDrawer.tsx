import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';
import { initiateOAuth, consumeOAuthRedirect, OAUTH_CONFIGS, type OAuthProvider } from '@/lib/oauth';

type AuthMode = 'apikey' | 'oauth';

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
}

const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🟢',
    description: 'GPT-4o and beyond',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeySteps: [
      'Sign up at platform.openai.com',
      'Go to API Keys → Create new secret key',
      'Paste it here — new accounts get $5 free credit',
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🟣',
    description: 'Claude model family',
    apiKeyUrl: 'https://console.anthropic.com/keys',
    apiKeySteps: [
      'Sign up at console.anthropic.com',
      'Go to API Keys → Create Key',
      'Paste it here — new accounts get $5 free credit',
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    icon: '🔵',
    description: 'Gemini model family',
    freeNote: '✅ Free — 1,500 req/day on Gemini 2.0 Flash',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    apiKeySteps: [
      'Go to aistudio.google.com → Sign in with Google',
      'Click "Get API Key" → Create API key',
      'Paste it here — free tier works immediately',
    ],
    supportsOAuth: true,
    oauthProvider: 'google',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: '🟠',
    description: 'Open-weight models',
    freeNote: '✅ Free tier available — Mistral Small & Codestral',
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    apiKeySteps: [
      'Sign up at console.mistral.ai',
      'Go to API Keys → Create new key',
      'Free tier includes Mistral Small at no cost',
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '⚫',
    description: 'Local model inference',
    freeNote: '✅ Completely free — runs on your machine',
    apiKeySteps: [
      'Install from ollama.com/download',
      'Run: ollama pull llama3.2',
      'No API key needed — Ollama runs at localhost:11434',
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: '🟩',
    description: 'Accelerated inference',
    freeNote: '✅ Free tier — 1,000 req/month on most models',
    apiKeyUrl: 'https://build.nvidia.com/explore/discover',
    apiKeySteps: [
      'Sign up at build.nvidia.com → NVIDIA account',
      'Browse models → click any → "Get API Key"',
      'Free tier: 1,000 requests/month per model',
    ],
  },
];

const MODELS: Record<string, string[]> = {
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o3-mini'],
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  google:    ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-pro'],
  mistral:   ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest', 'open-mixtral-8x7b'],
  ollama:    ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'gemma2', 'qwen2.5'],
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

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LLMDrawer({ open, onClose }: Props) {
  const llm = useAgentStore((s) => s.llm);
  const setLLM = useAgentStore((s) => s.setLLM);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [oauthTokens, setOAuthTokens] = useState<Record<string, string>>({});
  const [authModes, setAuthModes] = useState<Record<string, AuthMode>>({});
  const [oauthClientIds, setOAuthClientIds] = useState<Record<string, string>>({});
  const [setupOpen, setSetupOpen] = useState<string | null>(null);

  // Consume OAuth redirect on mount (user came back from provider)
  useEffect(() => {
    const result = consumeOAuthRedirect();
    if (result) {
      setOAuthTokens((prev) => ({ ...prev, [result.provider]: result.token }));
      setSetupOpen(result.provider);
    }
  }, []);

  const currentModels = MODELS[llm.provider] ?? [];
  const selectedProviderInfo = PROVIDERS.find((p) => p.id === llm.provider);

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
      // Reset model when provider changes
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
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-[#76b900] bg-[#76b900]/10'
                      : 'border-[#1e2d3d] bg-[#1a1a2e] hover:border-[#76b900]/40'
                  }`}
                >
                  <span className="text-xl leading-none">{p.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description}</p>
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

            {selectedProviderInfo.freeNote && (
              <p className="text-xs text-[#76b900]">{selectedProviderInfo.freeNote}</p>
            )}

            {/* Auth mode toggle — only show for providers that support OAuth */}
            {selectedProviderInfo.supportsOAuth && selectedProviderInfo.id !== 'ollama' && (
              <div className="flex rounded-lg overflow-hidden border border-[#1e2d3d] text-xs font-medium">
                {(['oauth', 'apikey'] as AuthMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAuthModes((prev) => ({ ...prev, [selectedProviderInfo.id]: mode }))}
                    className={`flex-1 py-2 transition-colors ${
                      (authModes[selectedProviderInfo.id] ?? 'oauth') === mode
                        ? 'bg-[#76b900] text-black font-semibold'
                        : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode === 'oauth' ? '🔐 Connect with Google' : '🔑 API Key'}
                  </button>
                ))}
              </div>
            )}

            {/* OAUTH mode */}
            {selectedProviderInfo.supportsOAuth &&
              (authModes[selectedProviderInfo.id] ?? 'oauth') === 'oauth' && (
              <div className="space-y-3">
                {oauthTokens[selectedProviderInfo.oauthProvider!] ? (
                  // Already connected
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#76b900]/10 border border-[#76b900]/30">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="text-sm font-medium text-[#76b900]">Connected to Google</p>
                      <p className="text-xs text-gray-400">OAuth token stored — your agent will use it automatically</p>
                    </div>
                    <button
                      onClick={() => setOAuthTokens((prev) => ({ ...prev, [selectedProviderInfo.oauthProvider!]: '' }))}
                      className="ml-auto text-xs text-gray-500 hover:text-red-400"
                    >
                      disconnect
                    </button>
                  </div>
                ) : (
                  // Not yet connected
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Sign in with Google to authorize Gemini access. No API key needed — one click and you&apos;re done.
                    </p>

                    {/* Option A: Use app's shared client ID (if env var is set on Vercel) */}
                    <button
                      onClick={async () => {
                        const sharedClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                        const clientId = sharedClientId || oauthClientIds['google'];
                        if (!clientId) {
                          // Show the manual setup section instead
                          setAuthModes((prev) => ({ ...prev, [selectedProviderInfo.id]: 'oauth_manual' as AuthMode }));
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

                    {/* If no shared client ID is configured, show manual client ID input */}
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
                  </div>
                )}
              </div>
            )}

            {/* API KEY mode (or for providers that don't support OAuth) */}
            {selectedProviderInfo.id !== 'ollama' &&
              (!selectedProviderInfo.supportsOAuth || (authModes[selectedProviderInfo.id] ?? 'oauth') === 'apikey') && (
              <div className="space-y-2">
                {selectedProviderInfo.apiKeySteps && (
                  <ol className="space-y-1">
                    {selectedProviderInfo.apiKeySteps.map((step, i) => (
                      <li key={i} className="text-xs text-gray-400 flex gap-2">
                        <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                <input
                  type="password"
                  placeholder={`Paste your ${selectedProviderInfo.name} API key`}
                  value={apiKeys[selectedProviderInfo.id] ?? ''}
                  onChange={(e) => setApiKeys((prev) => ({ ...prev, [selectedProviderInfo.id]: e.target.value }))}
                  className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                {apiKeys[selectedProviderInfo.id] && (
                  <p className="text-xs text-[#76b900]">✓ Key saved</p>
                )}
                {selectedProviderInfo.apiKeyUrl && (
                  <a href={selectedProviderInfo.apiKeyUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-[#00d4ff] hover:underline">
                    → Get your API key at {selectedProviderInfo.apiKeyUrl.replace('https://', '')}
                  </a>
                )}
              </div>
            )}

            {/* Ollama — no auth needed */}
            {selectedProviderInfo.id === 'ollama' && (
              <div className="space-y-1">
                {selectedProviderInfo.apiKeySteps?.map((step, i) => (
                  <p key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-[#76b900] font-bold shrink-0">{i + 1}.</span>
                    {step}
                  </p>
                ))}
              </div>
            )}
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
              {/* Tooltip trigger */}
              <div className="group relative">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
                <div className="absolute left-6 top-0 z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
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
          {/* Contextual hint based on current value */}
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
              <div className="absolute left-6 top-0 z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
                <p className="text-xs text-gray-300 leading-relaxed">
                  If your primary model fails, the agent automatically switches to the next one in line.
                  Primary is set to match your provider selection above. Add Fallback 1 and 2 for resilience.
                </p>
              </div>
            </div>
          </div>

          {fallbackRows.map((row, i) => {
            const rowModels = MODELS[row.provider] ?? [];
            return (
              <div key={i} className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{rowLabels[i]}</span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Provider dropdown */}
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

                  {/* Model dropdown — populates based on provider */}
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

                  {/* Trigger dropdown */}
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
              </div>
            );
          })}
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
