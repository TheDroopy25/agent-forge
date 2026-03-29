'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';

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

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Observability</SheetTitle>
        </SheetHeader>

        {/* Log Level */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Log Level
          </label>
          <div className="flex rounded-md overflow-hidden border border-[#1e2d3d]">
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
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Heartbeat Interval
          </label>
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
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Trace Output Path
          </label>
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
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Discord Alert Channel
          </label>
          <input
            type="text"
            value={observability.discordAlertChannel}
            onChange={(e) => setObservability({ discordAlertChannel: e.target.value })}
            placeholder="#agent-alerts channel ID"
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Daily Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Daily Summary</p>
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
            <p className="text-sm font-medium text-white">Context Compression</p>
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
      </SheetContent>
    </Sheet>
  );
}
