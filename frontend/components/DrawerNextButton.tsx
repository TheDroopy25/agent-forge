'use client';

import { useAgentStore, STEP_ORDER } from '@/store/agentStore';

const SECTION_LABELS: Record<string, string> = {
  identity:      'Identity',
  llm:           'LLM / Brain',
  voice:         'Voice',
  memory:        'Memory',
  data:          'Data / Context',
  tools:         'Tools',
  skills:        'Skills',
  subagents:     'Sub-Agents',
  channels:      'Channels',
  guardrails:    'Guardrails',
  observability: 'Observability',
};

export default function DrawerNextButton() {
  const activeDrawer   = useAgentStore((s) => s.activeDrawer);
  const setActiveDrawer = useAgentStore((s) => s.setActiveDrawer);

  const currentIndex = STEP_ORDER.indexOf(activeDrawer as typeof STEP_ORDER[number]);
  const nextSection  = currentIndex >= 0 && currentIndex < STEP_ORDER.length - 1
    ? STEP_ORDER[currentIndex + 1]
    : null;

  if (!nextSection) return null; // last section — no next button

  return (
    <div style={{ borderTop: '1px solid #1e2d3d', paddingTop: 16, marginTop: 8 }}>
      <button
        onClick={() => setActiveDrawer(nextSection)}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #76b900, #5a8c00)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 0',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        Next: {SECTION_LABELS[nextSection]} →
      </button>
    </div>
  );
}
