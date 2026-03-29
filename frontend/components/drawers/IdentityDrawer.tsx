'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';

const AVATARS = ['🤖', '🧠', '⚡', '🔮', '🦾', '🌟', '🚀', '🎯', '💎', '🔥', '🌊', '🦁', '🐉', '🎭', '🌈', '⚙️', '🛸', '🎪', '🔬', '🏆'];

interface SliderRowProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

function SliderRow({ label, leftLabel, rightLabel, value, onChange }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
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

        {/* Agent Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Agent Name</label>
          <input
            type="text"
            value={identity.name}
            onChange={(e) => setIdentity({ name: e.target.value })}
            placeholder="e.g. Nexus, Atlas, Sage..."
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
          />
        </div>

        {/* Avatar Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Avatar</label>
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
          <label className="text-sm font-medium text-gray-300">Purpose</label>
          <textarea
            rows={4}
            maxLength={160}
            value={identity.purpose}
            onChange={(e) => setIdentity({ purpose: e.target.value })}
            placeholder="Describe what this agent does..."
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
            />
            <SliderRow
              label="Tone"
              leftLabel="Formal"
              rightLabel="Casual"
              value={identity.tone}
              onChange={(v) => setIdentity({ tone: v })}
            />
            <SliderRow
              label="Humor"
              leftLabel="Serious"
              rightLabel="Witty"
              value={identity.humor}
              onChange={(v) => setIdentity({ humor: v })}
            />
            <SliderRow
              label="Assertiveness"
              leftLabel="Passive"
              rightLabel="Opinionated"
              value={identity.assertiveness}
              onChange={(v) => setIdentity({ assertiveness: v })}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
