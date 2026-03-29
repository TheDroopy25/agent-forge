'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';

const MODEL_OPTIONS = [
  'claude-sonnet-4-6',
  'claude-haiku-4-5',
  'gpt-4o',
  'gpt-4o-mini',
  'gemini-2.0-flash',
];

const ROUTING_MODES = ['Round-Robin', 'Specialization', 'Priority'];
const ROLES = ['Coordinator', 'Worker'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SubAgentsDrawer({ open, onClose }: Props) {
  const subAgents = useAgentStore((s) => s.subAgents);
  const setSubAgents = useAgentStore((s) => s.setSubAgents);

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-6');

  const handleAdd = () => {
    if (!name.trim()) return;
    setSubAgents({
      agents: [
        ...subAgents.agents,
        { id: Date.now().toString(), name: name.trim(), purpose: purpose.trim(), model },
      ],
    });
    setName('');
    setPurpose('');
    setModel('claude-sonnet-4-6');
  };

  const handleRemove = (id: string) => {
    setSubAgents({ agents: subAgents.agents.filter((a) => a.id !== id) });
  };

  const isFormValid = name.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Sub-Agents</SheetTitle>
        </SheetHeader>

        {/* Add Sub-Agent Form */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Add Sub-Agent</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sub-agent name"
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="What this agent specializes in"
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
          />
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!isFormValid}
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
              isFormValid
                ? 'bg-[#76b900] text-black hover:bg-[#8fd400]'
                : 'bg-[#1e2d3d] text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Agent
          </button>
        </div>

        {/* Agent List */}
        <div className="space-y-2">
          {subAgents.agents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No sub-agents added yet</p>
          ) : (
            subAgents.agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between gap-3 bg-[#1a1a2e] border border-[#1e2d3d] rounded-lg px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{agent.name}</p>
                  {agent.purpose && (
                    <p className="text-xs text-gray-400 truncate">{agent.purpose}</p>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs bg-[#1e2d3d] text-gray-300 border border-[#2a3d52] rounded px-2 py-0.5">
                  {agent.model}
                </span>
                <button
                  onClick={() => handleRemove(agent.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Remove agent"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#1e2d3d]" />

        {/* Configuration */}
        <div className="space-y-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Configuration</p>

          {/* Routing Mode */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Routing Mode</label>
            <div className="flex gap-2">
              {ROUTING_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSubAgents({ routingMode: mode.toLowerCase().replace('-', '-') })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    subAgents.routingMode === mode.toLowerCase().replace(/-/g, '-')
                      ? 'bg-[#76b900] text-black'
                      : 'bg-[#1e2d3d] text-gray-400 hover:bg-[#253d52]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Max Concurrent */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-300">Max Concurrent</label>
              <span className="text-sm font-medium text-[#76b900]">{subAgents.maxConcurrent} agents</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[subAgents.maxConcurrent]}
              onValueChange={(v) => setSubAgents({ maxConcurrent: (v as number[])[0] })}
              className="w-full"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Role</label>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSubAgents({ role: role.toLowerCase() })}
                  className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    subAgents.role === role.toLowerCase()
                      ? 'bg-[#76b900] text-black'
                      : 'bg-[#1e2d3d] text-gray-400 hover:bg-[#253d52]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
