import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
      <div className="absolute right-0 bottom-full z-50 hidden group-hover:block w-72 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  badgeClass,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  badgeClass: string;
}) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setInput('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder={placeholder}
          className="flex-1 bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-[#1e2d3d] hover:bg-[#253d52] text-gray-300 text-sm rounded-md transition-colors"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${badgeClass}`}
            >
              {tag}
              <button
                onClick={() => onRemove(tag)}
                className="leading-none hover:opacity-70 transition-opacity"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuardrailsDrawer({ open, onClose }: Props) {
  const guardrails = useAgentStore((s) => s.guardrails);
  const setGuardrails = useAgentStore((s) => s.setGuardrails);

  const addNeverDo = (tag: string) =>
    setGuardrails({ neverDo: [...guardrails.neverDo, tag] });
  const removeNeverDo = (tag: string) =>
    setGuardrails({ neverDo: guardrails.neverDo.filter((t) => t !== tag) });

  const addAlwaysAsk = (tag: string) =>
    setGuardrails({ alwaysAsk: [...guardrails.alwaysAsk, tag] });
  const removeAlwaysAsk = (tag: string) =>
    setGuardrails({ alwaysAsk: guardrails.alwaysAsk.filter((t) => t !== tag) });

  const formatTokens = (n: number) => n.toLocaleString();

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Guardrails</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Guardrails set limits on what your agent can do. Add things it should never say or do, set a daily cost limit so it doesn&apos;t run up a huge API bill, and define a hard-stop file path for emergencies.
          </p>
        </div>

        {/* Never Do */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Never do this (add tags)
            </label>
            <Tip text="Hard rules the agent will never break regardless of instructions. Written into the system prompt. Zero performance cost. Examples: 'delete files', 'send emails without approval'." />
          </div>
          <TagInput
            tags={guardrails.neverDo}
            onAdd={addNeverDo}
            onRemove={removeNeverDo}
            placeholder="e.g. delete files, send emails..."
            badgeClass="bg-red-900/40 border-red-500 text-red-300"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Always Ask Before */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Always ask before (add tags)
            </label>
            <Tip text="Actions the agent must pause and confirm with you before executing. Adds a human-in-the-loop checkpoint. No resource cost — just a confirmation prompt." />
          </div>
          <TagInput
            tags={guardrails.alwaysAsk}
            onAdd={addAlwaysAsk}
            onRemove={removeAlwaysAsk}
            placeholder="e.g. publishing, committing code..."
            badgeClass="bg-amber-900/40 border-amber-500 text-amber-300"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Cost Limit */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Cost Limit</label>
              <Tip text="Maximum spend per single request in USD. Agent stops and alerts if a single response would exceed this. Prevents runaway costs from long tool chains. Set to $0 to disable." />
            </div>
            <span className="text-sm font-medium text-[#76b900]">
              ${guardrails.costLimit.toFixed(2)} / request
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[guardrails.costLimit]}
            onValueChange={(v) => setGuardrails({ costLimit: (v as number[])[0] })}
            className="w-full"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Token Budget */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Token Budget</label>
              <Tip text="Maximum tokens the agent can use per conversation turn (input + output combined). Larger budgets allow deeper reasoning and longer responses but cost more. Each 1K tokens ≈ $0.001-0.01 depending on model." />
            </div>
            <span className="text-sm font-medium text-[#76b900]">
              {formatTokens(guardrails.tokenBudget)} tokens
            </span>
          </div>
          <Slider
            min={1000}
            max={500000}
            step={1000}
            value={[guardrails.tokenBudget]}
            onValueChange={(v) => setGuardrails({ tokenBudget: (v as number[])[0] })}
            className="w-full"
          />
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Hard Stop File */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Hard Stop File
            </label>
            <Tip text="A file path the agent checks before each action. If this file exists on disk, the agent stops immediately. Emergency brake — create this file to halt a runaway agent. Zero overhead when file doesn't exist." />
          </div>
          <input
            type="text"
            value={guardrails.hardStopPath}
            onChange={(e) => setGuardrails({ hardStopPath: e.target.value })}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors font-mono"
          />
          <p className="text-xs text-gray-500">Agent stops when this file exists</p>
        </div>

        <div className="border-t border-[#1e2d3d]" />

        {/* Max Tool Calls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Max Tool Calls
            </label>
            <Tip text="Maximum number of tool calls (web search, code execution, file reads, etc.) allowed per turn. Prevents the agent from looping endlessly. Increase for complex multi-step tasks." />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={guardrails.maxToolCalls}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 100) setGuardrails({ maxToolCalls: v });
              }}
              className="w-24 bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors"
            />
            <span className="text-sm text-gray-400">per turn</span>
          </div>
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
