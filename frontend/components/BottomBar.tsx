'use client';

import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/agentStore';

const SECTIONS = [
  'identity',
  'llm',
  'voice',
  'memory',
  'data',
  'tools',
  'skills',
  'subagents',
  'channels',
  'guardrails',
  'observability',
] as const;

// Map section keys in the progress bar to keys used in sectionComplete
const SECTION_KEY_MAP: Record<string, string> = {
  subagents: 'subAgents',
};

function toStoreKey(section: string): string {
  return SECTION_KEY_MAP[section] ?? section;
}

const SECTION_LABELS: Record<string, string> = {
  identity: 'Identity',
  llm: 'LLM',
  voice: 'Voice',
  memory: 'Memory',
  data: 'Data',
  tools: 'Tools',
  skills: 'Skills',
  subagents: 'Sub-Agents',
  channels: 'Channels',
  guardrails: 'Guardrails',
  observability: 'Observability',
};

const STEP_NUMBERS: Record<string, number> = {
  identity: 1, llm: 2, voice: 3, memory: 4, data: 5, tools: 6,
  skills: 7, subagents: 8, channels: 9, guardrails: 10, observability: 11,
};

interface BottomBarProps {
  onBuildClick: () => void;
}

export function BottomBar({ onBuildClick }: BottomBarProps) {
  const completedCount = useAgentStore((s) => s.completedCount);
  const sectionComplete = useAgentStore((s) => s.sectionComplete);
  const nextStep = useAgentStore((s) => s.nextStep);
  const agentNamed = useAgentStore((s) => s.agentNamed);

  const identityDone = sectionComplete['identity'] ?? false;
  const llmDone = sectionComplete['llm'] ?? false;
  const canBuild = identityDone && llmDone;
  const allComplete = completedCount === 11;

  return (
    <div
      style={{
        background: '#0d0d14',
        borderTop: '1px solid #1e2d3d',
        height: '56px',
      }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6"
    >
      {/* Left: branding */}
      <span
        style={{ color: '#76b900' }}
        className="font-bold text-lg select-none"
      >
        AgentForge
      </span>

      {/* Center: progress or hint */}
      <div className="flex flex-col items-center gap-1">
        {!agentNamed ? (
          <span className="text-xs" style={{ color: '#8b9cb3' }}>
            👆 Start by naming your agent in the center
          </span>
        ) : (
          <>
            <span className="text-xs" style={{ color: '#8b9cb3' }}>
              {allComplete ? '✅ Ready to build!' : `${completedCount} of 11 sections configured`}
            </span>
            <div className="flex items-center gap-[3px]">
              {SECTIONS.map((section) => {
                const done = sectionComplete[toStoreKey(section)] ?? false;
                return (
                  <div
                    key={section}
                    style={{
                      width: '18px',
                      height: '6px',
                      borderRadius: '3px',
                      background: done ? '#76b900' : '#1e2d3d',
                      transition: 'background 0.3s ease',
                    }}
                  />
                );
              })}
            </div>
            {!allComplete && nextStep && (
              <span className="text-xs" style={{ color: '#00d4ff' }}>
                Next: {STEP_NUMBERS[nextStep]}. {SECTION_LABELS[nextStep]} →
              </span>
            )}
          </>
        )}
      </div>

      {/* Right: build button */}
      <div className="relative group">
        {canBuild ? (
          <motion.button
            onClick={onBuildClick}
            animate={{
              boxShadow: [
                '0 0 10px rgba(118,185,0,0.4)',
                '0 0 20px rgba(118,185,0,0.7)',
                '0 0 10px rgba(118,185,0,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ filter: 'brightness(1.15)' }}
            style={{
              background: '#76b900',
              color: '#000',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            BUILD AGENT ⚡
          </motion.button>
        ) : (
          <>
            <button
              disabled
              style={{
                background: '#1e2d3d',
                color: '#4a5568',
                fontWeight: 500,
                fontSize: '13px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'not-allowed',
                letterSpacing: '0.03em',
              }}
            >
              BUILD AGENT ⚡
            </button>
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              style={{
                background: '#1e2d3d',
                color: '#8b9cb3',
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #2d3f52',
              }}
            >
              Complete Identity + LLM to build
            </div>
          </>
        )}
      </div>
    </div>
  );
}
