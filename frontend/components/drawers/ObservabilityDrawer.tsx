import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';
import Tip from "@/components/Tip";
import { ChevronDown, ChevronUp } from 'lucide-react';

const LOG_LEVELS = ['Silent', 'Normal', 'Verbose', 'Debug'] as const;

const HEARTBEAT_OPTIONS = [
  { value: 'disabled',    label: 'Disabled' },
  { value: '15min',       label: 'Every 15 min' },
  { value: '30min',       label: 'Every 30 min' },
  { value: '1hour',       label: 'Every hour' },
  { value: '4hours',      label: 'Every 4 hours' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ObservabilityDrawer({ open, onClose }: Props) {
  const observability = useAgentStore((s) => s.observability);
  const setObservability = useAgentStore((s) => s.setObservability);
  const [showChannelIdGuide, setShowChannelIdGuide] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Observability</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Observability is how you keep an eye on your running agent. Set up logging so you can see what it&apos;s doing, enable heartbeats so it checks in regularly, and get Discord alerts if something goes wrong.
          </p>
        </div>

        {/* Log Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Log Level
            </label>
            <Tip text="Controls how much detail the agent writes to logs. Silent = no logs. Normal = key events only. Verbose = all decisions and tool calls. Debug = everything including internal state. More logging = slightly higher disk/CPU overhead." />
          </div>
          <div className="flex rounded-md border border-[#1e2d3d]">
            {LOG_LEVELS.map((level) => {
              const value = level.toLowerCase();
              const active = observability.logLevel === value;
              return (
                <button
                  key={level}
                  onClick={() => setObservability({ logLevel: value })}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#76b900] text-black'
                      : 'bg-[#1e2d3d] text-gray-400 hover:bg-[#253d52]'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Heartbeat Interval */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Heartbeat Interval
            </label>
            <Tip text="How often the agent sends a 'still alive' ping to monitoring systems. Disabled = no pings. Shorter interval = faster failure detection. Resource: negligible — just a small log write." />
          </div>
          <select
            value={observability.heartbeatInterval}
            onChange={(e) => setObservability({ heartbeatInterval: e.target.value })}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors"
          >
            {HEARTBEAT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Trace Output Path */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Trace Output Path
            </label>
            <Tip text="Directory where the agent writes structured trace files (JSON). Useful for debugging and replay. Zero performance impact. Each trace file is ~10-100KB depending on task complexity." />
          </div>
          <input
            type="text"
            value={observability.traceOutputPath}
            onChange={(e) => setObservability({ traceOutputPath: e.target.value })}
            placeholder="/tmp/agent-traces/"
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors font-mono"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Discord Alert Channel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Discord Alert Channel
            </label>
            <Tip text="Send alerts to this Discord channel when the agent errors, hits limits, or completes major tasks. Requires Discord channel ID and the Discord skill enabled. Zero overhead when idle." />
          </div>
          <input
            type="text"
            value={observability.discordAlertChannel}
            onChange={(e) => setObservability({ discordAlertChannel: e.target.value })}
            placeholder="#agent-alerts channel ID"
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          {/* Collapsible How to get a Channel ID guide */}
          <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setShowChannelIdGuide((v) => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b9cb3', letterSpacing: '0.02em' }}>How to get a Channel ID</span>
              {showChannelIdGuide
                ? <ChevronUp size={14} style={{ color: '#8b9cb3', flexShrink: 0 }} />
                : <ChevronDown size={14} style={{ color: '#8b9cb3', flexShrink: 0 }} />}
            </button>
            {showChannelIdGuide && (
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Enable Developer Mode', body: <>In Discord, go to <strong style={{ color: '#fff' }}>Settings → Advanced</strong> → turn on <strong style={{ color: '#fff' }}>Developer Mode</strong> (if not already on).</> },
                  { title: 'Copy the Channel ID', body: <>Right-click any channel name in your server → <strong style={{ color: '#fff' }}>&quot;Copy Channel ID&quot;</strong>.</> },
                  { title: 'Paste it above', body: <>Paste it in the field above.</> },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#76b900', color: '#000', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>{i + 1}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: '1.4' }}>{step.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8b9cb3', lineHeight: '1.5' }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Daily Summary */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">Daily Summary</p>
              <Tip text="Agent sends a daily digest of what it did, how many requests it made, and approximate cost. Sent to your primary channel. Resource: one extra LLM call per day to generate the summary." />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Send daily activity summary</p>
          </div>
          <Switch
            checked={observability.dailySummary}
            onCheckedChange={(checked) => setObservability({ dailySummary: checked })}
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Context Compression */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">Context Compression</p>
              <Tip text="When the conversation approaches token limits, the agent automatically summarizes older messages to free up space. Keeps long conversations running without hitting model limits. Adds ~200ms and ~1000 tokens when triggered." />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Compress context when approaching limits
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Automatically summarizes older messages to stay within token limits
            </p>
          </div>
          <Switch
            checked={observability.contextCompression}
            onCheckedChange={(checked) => setObservability({ contextCompression: checked })}
            className="flex-shrink-0 mt-0.5"
          />
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
