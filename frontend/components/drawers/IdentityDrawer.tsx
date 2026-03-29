'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';

const AVATARS = ['🤖', '🧠', '⚡', '🔮', '🦾', '🌟', '🚀', '🎯', '💎', '🔥', '🌊', '🦁', '🐉', '🎭', '🌈', '⚙️', '🛸', '🎪', '🔬', '🏆'];

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
      <div className="absolute left-6 top-0 z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
}

function SliderRow({ label, leftLabel, rightLabel, value, onChange, tooltip }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          {tooltip && <Tip text={tooltip} />}
        </div>
        <span className="text-sm text-[#76b900] font-mono">{value}%</span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(val) => onChange(Array.isArray(val) ? (val as number[])[0] : (val as number))}
        className="w-full"
      />
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">{leftLabel}</span>
        <span className="text-xs text-gray-500">{rightLabel}</span>
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function IdentityDrawer({ open, onClose }: Props) {
  const identity = useAgentStore((s) => s.identity);
  const setIdentity = useAgentStore((s) => s.setIdentity);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Identity</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            This is your agent&apos;s personality. Describe what it&apos;s for, and use the sliders to tune how it communicates — formal or casual, serious or witty.
          </p>
        </div>

        {/* Avatar Picker */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Avatar</label>
            <Tip text="Visual icon for your agent in dashboards and logs. Cosmetic only — no impact." />
          </div>
          <div className="grid grid-cols-10 gap-2">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIdentity({ avatar: emoji })}
                className={`w-9 h-9 flex items-center justify-center text-xl rounded-md border transition-all ${
                  identity.avatar === emoji
                    ? 'border-[#76b900] ring-2 ring-[#76b900] bg-[#76b900]/10'
                    : 'border-[#1e2d3d] bg-[#1a1a2e] hover:border-[#76b900]/50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Purpose</label>
            <Tip text="This goes directly into your agent's personality file — it tells the agent who it is and what its job is. The more specific you are, the better it behaves. Examples: 'You help me remember appointments and send reminders.' / 'You answer questions about my small business inventory.' / 'You check my email and summarize anything important.'" />
          </div>
          <textarea
            rows={4}
            maxLength={160}
            value={identity.purpose}
            onChange={(e) => setIdentity({ purpose: e.target.value })}
            placeholder="e.g. You help me remember appointments and send reminders."
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors resize-none"
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">{identity.purpose.length}/160</span>
          </div>
        </div>

        {/* Personality Sliders */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Personality</h3>
          <div className="space-y-5">
            <SliderRow
              label="Verbosity"
              leftLabel="Terse"
              rightLabel="Verbose"
              value={identity.verbosity}
              onChange={(v) => setIdentity({ verbosity: v })}
              tooltip="How much your agent writes. Terse agents respond faster and use fewer tokens (cheaper). Verbose agents give richer answers but cost more per response. Recommended: 40-60 for general use."
            />
            <SliderRow
              label="Tone"
              leftLabel="Formal"
              rightLabel="Casual"
              value={identity.tone}
              onChange={(v) => setIdentity({ tone: v })}
              tooltip="Formal agents use professional language suitable for business tools. Casual agents feel more conversational. No performance impact — affects system prompt wording only."
            />
            <SliderRow
              label="Humor"
              leftLabel="Serious"
              rightLabel="Witty"
              value={identity.humor}
              onChange={(v) => setIdentity({ humor: v })}
              tooltip="How often the agent uses wit or lightness. Higher values make interactions more engaging but can reduce precision in technical tasks. Keep low for data/coding work."
            />
            <SliderRow
              label="Assertiveness"
              leftLabel="Passive"
              rightLabel="Opinionated"
              value={identity.assertiveness}
              onChange={(v) => setIdentity({ assertiveness: v })}
              tooltip="Passive agents hedge and ask for confirmation. Opinionated agents make decisions and state preferences. High assertiveness reduces back-and-forth but may overstep on sensitive tasks."
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
