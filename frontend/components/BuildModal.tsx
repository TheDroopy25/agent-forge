'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAgentStore } from '@/store/agentStore';
import {
  generateOpenClawYAML,
  generateSOUL,
  generateAGENTS,
  generatePython,
} from '@/lib/generators';

// ─── Build sequence ──────────────────────────────────────────────────────────

const BUILD_STEPS = [
  '🔍 Validating config...',
  '🧠 Generating identity layer...',
  '⚡ Wiring tools and memory...',
  '📦 Packaging agent...',
  '✅ Agent ready.',
];

const STEP_DELAYS = [0, 500, 1000, 1500, 2000];
const COMPLETE_DELAY = 2500; // 2000 + 500

// ─── Tab definitions ─────────────────────────────────────────────────────────

interface TabDef {
  value: string;
  label: string;
  language: string;
  filename: string;
  generate: (state: ReturnType<typeof useAgentStore.getState>) => string;
}

const TAB_DEFS: TabDef[] = [
  {
    value: 'yaml',
    label: 'OpenClaw YAML',
    language: 'yaml',
    filename: 'agent.yaml',
    generate: generateOpenClawYAML,
  },
  {
    value: 'soul',
    label: 'SOUL.md',
    language: 'markdown',
    filename: 'SOUL.md',
    generate: generateSOUL,
  },
  {
    value: 'agents',
    label: 'AGENTS.md',
    language: 'markdown',
    filename: 'AGENTS.md',
    generate: generateAGENTS,
  },
  {
    value: 'python',
    label: 'Python',
    language: 'python',
    filename: 'agent.py',
    generate: generatePython,
  },
];

// ─── CopyDownload sub-component ───────────────────────────────────────────────

function CopyDownloadRow({
  text,
  filename,
}: {
  text: string;
  filename: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        onClick={handleCopy}
        style={{
          background: copied ? '#76b900' : '#1e2d3d',
          color: copied ? '#000' : '#8b9cb3',
          border: '1px solid #2d3f52',
          borderRadius: '6px',
          padding: '4px 14px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: copied ? 700 : 400,
          transition: 'all 0.2s',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        onClick={handleDownload}
        style={{
          background: '#1e2d3d',
          color: '#8b9cb3',
          border: '1px solid #2d3f52',
          borderRadius: '6px',
          padding: '4px 14px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Download
      </button>
      <span style={{ color: '#4a5568', fontSize: '11px' }}>{filename}</span>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface BuildModalProps {
  open: boolean;
  onClose: () => void;
}

export function BuildModal({ open, onClose }: BuildModalProps) {
  const agentState = useAgentStore();

  const [buildStep, setBuildStep] = useState(-1);
  const [buildComplete, setBuildComplete] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setBuildStep(-1);
      setBuildComplete(false);
    }
  }, [open]);

  // Run build sequence when modal opens
  useEffect(() => {
    if (!open) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DELAYS.forEach((delay, index) => {
      timers.push(
        setTimeout(() => {
          setBuildStep(index);
        }, delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setBuildComplete(true);
      }, COMPLETE_DELAY)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [open]);

  if (!open) return null;

  const visibleSteps = BUILD_STEPS.slice(0, buildStep + 1);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          background: '#12121a',
          border: '1px solid #1e2d3d',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid #1e2d3d' }}
        >
          <span className="font-semibold text-base" style={{ color: '#e2e8f0' }}>
            {buildComplete ? 'Agent Ready 🎉' : 'Building Agent...'}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
            className="hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Phase 1: Build sequence */}
          {!buildComplete && (
            <div className="px-6 py-6">
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {visibleSteps.map((step, index) => {
                    const isCurrent = index === buildStep;
                    const isDone = index < buildStep;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="w-5 text-center text-sm shrink-0"
                          style={{ color: isDone ? '#76b900' : '#8b9cb3' }}
                        >
                          {isDone ? '✓' : isCurrent ? (
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{ display: 'inline-block' }}
                            >
                              ●
                            </motion.span>
                          ) : '○'}
                        </span>
                        <span
                          className="text-sm"
                          style={{
                            color: isDone ? '#76b900' : isCurrent ? '#e2e8f0' : '#8b9cb3',
                          }}
                        >
                          {step}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Phase 2: Output tabs */}
          {buildComplete && (
            <div className="px-6 py-4">
              <Tabs defaultValue="yaml">
                <TabsList className="mb-4">
                  {TAB_DEFS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {TAB_DEFS.map((tab) => {
                  const code = tab.generate(agentState);
                  return (
                    <TabsContent key={tab.value} value={tab.value}>
                      <div
                        className="overflow-auto rounded-lg"
                        style={{ maxHeight: '400px' }}
                      >
                        <SyntaxHighlighter
                          language={tab.language}
                          style={vscDarkPlus}
                          customStyle={{
                            background: 'transparent',
                            fontSize: '12px',
                            margin: 0,
                            padding: '16px',
                          }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                      <CopyDownloadRow text={code} filename={tab.filename} />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0">
          <Separator />
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={onClose}
              style={{
                background: '#1e2d3d',
                color: '#8b9cb3',
                border: '1px solid #2d3f52',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                toast('🚀 Agent deployed to OpenClaw!');
              }}
              style={{
                background: '#76b900',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Deploy to OpenClaw 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
