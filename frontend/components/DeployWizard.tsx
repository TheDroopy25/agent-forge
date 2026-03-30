'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { electronAPI, type AgentDeployConfig, type PrereqResult } from '@/lib/electron';
import { useAgentStore } from '@/store/agentStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'prereqs' | 'apikeys' | 'deploying' | 'done' | 'error';

interface DeployWizardProps {
  config: Omit<AgentDeployConfig, 'apiKey' | 'discordToken'>;
  llmProvider: string;
  discordEnabled: boolean;
  onClose: () => void;
}

// ─── Provider → key label map ─────────────────────────────────────────────────

const PROVIDER_KEY_LABEL: Record<string, string> = {
  openai:    'OpenAI API Key',
  anthropic: 'Anthropic API Key',
  google:    'Google API Key',
  gemini:    'Google Gemini API Key',
  groq:      'Groq API Key',
  cohere:    'Cohere API Key',
};

function apiKeyLabel(provider: string): string {
  return PROVIDER_KEY_LABEL[provider.toLowerCase()] ?? 'LLM API Key';
}

function nodeInstallUrl(os: string): string {
  if (os === 'mac') return 'https://nodejs.org/en/download/package-manager#macos';
  if (os === 'windows') return 'https://nodejs.org/en/download/package-manager#windows';
  return 'https://nodejs.org/en/download/package-manager#linux';
}

function nodeInstallLabel(os: string): string {
  if (os === 'mac') return 'Install Node.js for Mac (pkg installer)';
  if (os === 'windows') return 'Install Node.js for Windows (.msi installer)';
  return 'Install Node.js for Linux';
}

function needsApiKey(provider: string, authType?: string): boolean {
  if (authType === 'oauth' || authType === 'setup-token') return false;
  return provider.length > 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusRow({ ok, label, sub }: { ok: boolean | null; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-5 shrink-0">
        {ok === null ? (
          <Loader size={16} className="animate-spin" style={{ color: '#76b900' }} />
        ) : ok ? (
          <CheckCircle size={16} style={{ color: '#76b900' }} />
        ) : (
          <XCircle size={16} style={{ color: '#e53e3e' }} />
        )}
      </span>
      <span style={{ color: ok === false ? '#e53e3e' : '#e2e8f0', fontSize: 14 }}>
        {label}
      </span>
      {sub && (
        <span style={{ color: '#4a5568', fontSize: 12 }}>{sub}</span>
      )}
    </div>
  );
}

function ProgressLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div
      ref={ref}
      className="overflow-y-auto rounded-lg p-4"
      style={{ background: '#0a0a0f', maxHeight: 220, fontFamily: 'monospace', fontSize: 12 }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ color: '#76b900', lineHeight: 1.6 }}>
          {line}
        </div>
      ))}
      {lines.length === 0 && (
        <div style={{ color: '#4a5568' }}>Starting...</div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DeployWizard({ config, llmProvider, discordEnabled, onClose }: DeployWizardProps) {
  const targetOS = useAgentStore((s) => s.targetOS);
  const [step, setStep] = useState<Step>('prereqs');
  const [prereqs, setPrereqs] = useState<PrereqResult | null>(null);
  const [installLog, setInstallLog] = useState<string[]>([]);
  const [installing, setInstalling] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [discordToken, setDiscordToken] = useState('');
  const [deployLog, setDeployLog] = useState<string[]>([]);
  const [deployResult, setDeployResult] = useState<{ workspacePath?: string; error?: string } | null>(null);

  // ── Step 1: run prereq check on mount ──────────────────────────────────────
  useEffect(() => {
    if (step !== 'prereqs' || !electronAPI) return;
    electronAPI.checkPrereqs().then((result) => {
      setPrereqs(result);
      if (result.node && result.openclaw) {
        // All good — short pause then advance
        setTimeout(() => setStep('apikeys'), 600);
      }
    });
  }, [step]);

  // ── Step 3: start deploy ────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'deploying' || !electronAPI) return;

    const unsubscribe = electronAPI.onDeployProgress((msg) => {
      setDeployLog((prev) => [...prev, msg]);
    });

    const fullConfig: AgentDeployConfig = {
      ...config,
      apiKey:       apiKey       || undefined,
      discordToken: discordToken || undefined,
    };

    electronAPI.deployAgent(fullConfig).then((result) => {
      unsubscribe();
      if (result.success) {
        setDeployResult({ workspacePath: result.workspacePath });
        setStep('done');
      } else {
        setDeployResult({ error: result.error });
        setStep('error');
      }
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Install openclaw ────────────────────────────────────────────────────────
  async function handleInstall() {
    if (!electronAPI) return;
    setInstalling(true);
    setInstallLog([]);
    try {
      await electronAPI.installOpenclaw((msg) => {
        setInstallLog((prev) => [...prev, msg]);
      });
      // Re-check prereqs
      const result = await electronAPI.checkPrereqs();
      setPrereqs(result);
      if (result.node && result.openclaw) {
        setTimeout(() => setStep('apikeys'), 600);
      }
    } catch (_) {
      // Error messages already streamed into installLog
    } finally {
      setInstalling(false);
    }
  }

  function openWorkspace() {
    if (deployResult?.workspacePath && electronAPI) {
      electronAPI.openExternal(`file://${deployResult.workspacePath}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {/* ── Step 1: Prerequisites ── */}
      {step === 'prereqs' && (
        <motion.div key="prereqs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Checking your system...
          </h3>

          <StatusRow
            ok={prereqs === null ? null : prereqs.node}
            label="Node.js 18+"
            sub={prereqs?.nodeVersion}
          />
          <StatusRow
            ok={prereqs === null ? null : prereqs.openclaw}
            label="OpenClaw"
            sub={prereqs?.openclawVersion}
          />

          {prereqs && !prereqs.openclaw && (
            <div style={{ marginTop: 20 }}>
              <p style={{ color: '#8b9cb3', fontSize: 13, marginBottom: 12 }}>
                OpenClaw isn't installed yet. That's okay — we'll install it for you now.
              </p>
              <p style={{ color: '#4a5568', fontSize: 12, marginBottom: 12 }}>
                This will run: <code style={{ color: '#76b900' }}>npm install -g openclaw</code> (takes ~30 seconds)
              </p>

              {installLog.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <ProgressLog lines={installLog} />
                </div>
              )}

              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  background: installing ? '#1e2d3d' : '#76b900',
                  color: installing ? '#8b9cb3' : '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 22px',
                  fontSize: 13,
                  cursor: installing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {installing && <Loader size={14} className="animate-spin" />}
                {installing ? 'Installing...' : 'Install OpenClaw'}
              </button>
            </div>
          )}

          {prereqs && !prereqs.node && (
            <div style={{
              marginTop: 12,
              padding: '12px 16px',
              background: '#0d1a24',
              border: '1px solid #1e3a4a',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0 }}>
                <strong>Node.js is required</strong> to run your agent. It's a one-time install — takes about 2 minutes.
              </p>
              <button
                onClick={() => electronAPI?.openExternal(nodeInstallUrl(targetOS))}
                style={{
                  background: '#76b900',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                ↗ {nodeInstallLabel(targetOS)}
              </button>
              <p style={{ color: '#4a5568', fontSize: 12, margin: 0 }}>
                After installing, restart AgentForge and click "Check Again".
              </p>
              <button
                onClick={() => { setPrereqs(null); setStep('prereqs'); }}
                style={{
                  background: 'transparent',
                  color: '#76b900',
                  border: '1px solid #76b900',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                Check Again
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Step 2: API Keys ── */}
      {step === 'apikeys' && (
        <motion.div key="apikeys" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Connect your services
          </h3>
          <p style={{ color: '#8b9cb3', fontSize: 13, marginBottom: 20 }}>
            Your keys are stored locally on your computer and never sent anywhere.
          </p>

          {needsApiKey(llmProvider, config.authType) && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#8b9cb3', fontSize: 12, display: 'block', marginBottom: 6 }}>
                {apiKeyLabel(llmProvider)}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%',
                  background: '#0a0a0f',
                  border: '1px solid #2d3f52',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {discordEnabled && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#8b9cb3', fontSize: 12, display: 'block', marginBottom: 6 }}>
                Discord Bot Token
              </label>
              <input
                type="password"
                value={discordToken}
                onChange={(e) => setDiscordToken(e.target.value)}
                placeholder="Bot token from Discord Developer Portal"
                style={{
                  width: '100%',
                  background: '#0a0a0f',
                  border: '1px solid #2d3f52',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {!needsApiKey(llmProvider, config.authType) && !discordEnabled && (
            <p style={{ color: '#4a5568', fontSize: 13 }}>
              No API keys needed for your current configuration.
            </p>
          )}

          <button
            onClick={() => setStep('deploying')}
            style={{
              background: '#76b900',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              padding: '9px 22px',
              fontSize: 13,
              cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Deploy Now 🚀
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Deploying ── */}
      {step === 'deploying' && (
        <motion.div key="deploying" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Deploying your agent...
          </h3>
          <ProgressLog lines={deployLog} />
        </motion.div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 'done' && (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ color: '#76b900', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Your agent is live!
            </h3>
            <p style={{ color: '#8b9cb3', fontSize: 13, marginBottom: 20 }}>
              {config.name} is running and ready.
            </p>
            {deployResult?.workspacePath && (
              <div
                style={{
                  background: '#0a0a0f',
                  border: '1px solid #2d3f52',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: '#4a9eff',
                  marginBottom: 20,
                  wordBreak: 'break-all',
                }}
              >
                {deployResult.workspacePath}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {deployResult?.workspacePath && (
                <button
                  onClick={openWorkspace}
                  style={{
                    background: '#1e2d3d',
                    color: '#8b9cb3',
                    border: '1px solid #2d3f52',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Open Workspace
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: '#76b900',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Error ── */}
      {step === 'error' && (
        <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: '#e53e3e', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Something went wrong
            </h3>
            <p style={{ color: '#8b9cb3', fontSize: 13, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
              {deployResult?.error ?? 'Deployment failed. Please check that OpenClaw is installed and try again.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setDeployLog([]);
                  setDeployResult(null);
                  setStep('deploying');
                }}
                style={{
                  background: '#76b900',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#1e2d3d',
                  color: '#8b9cb3',
                  border: '1px solid #2d3f52',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
