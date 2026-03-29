'use client';

import { useState, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAgentStore } from '@/store/agentStore';
import HubNode from '@/components/nodes/HubNode';
import SectionNode from '@/components/nodes/SectionNode';

import IdentityDrawer from './drawers/IdentityDrawer';
import LLMDrawer from './drawers/LLMDrawer';
import VoiceDrawer from './drawers/VoiceDrawer';
import MemoryDrawer from './drawers/MemoryDrawer';
import DataDrawer from './drawers/DataDrawer';
import ToolsDrawer from './drawers/ToolsDrawer';
import SkillsDrawer from './drawers/SkillsDrawer';
import SubAgentsDrawer from './drawers/SubAgentsDrawer';
import ChannelsDrawer from './drawers/ChannelsDrawer';
import GuardrailsDrawer from './drawers/GuardrailsDrawer';
import ObservabilityDrawer from './drawers/ObservabilityDrawer';

// ─── Node types ───────────────────────────────────────────────────────────────

const nodeTypes = {
  hub: HubNode,
  section: SectionNode,
} as const;

// ─── Sections config ──────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'identity',      label: 'Identity',       icon: '🧠' },
  { id: 'llm',           label: 'LLM / Brain',    icon: '🤖' },
  { id: 'voice',         label: 'Voice',           icon: '🎙️' },
  { id: 'memory',        label: 'Memory',          icon: '💾' },
  { id: 'data',          label: 'Data / Context', icon: '📁' },
  { id: 'tools',         label: 'Tools',           icon: '🔧' },
  { id: 'skills',        label: 'Skills',          icon: '⚡' },
  { id: 'subagents',     label: 'Sub-Agents',      icon: '👥' },
  { id: 'channels',      label: 'Channels',        icon: '📡' },
  { id: 'guardrails',    label: 'Guardrails',      icon: '🛡️' },
  { id: 'observability', label: 'Observability',   icon: '📊' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const RADIUS = 320;
const HUB_OFFSET_X = -80; // half of 160px hub
const HUB_OFFSET_Y = -80; // half of 160px hub

// ─── Canvas inner (needs ReactFlowProvider context) ───────────────────────────

function AgentCanvasInner() {
  const sectionComplete = useAgentStore((s) => s.sectionComplete);
  const [activeDrawer, setActiveDrawer] = useState<SectionId | null>(null);

  // Build static nodes — hub + 11 section nodes
  const nodes = useMemo<Node[]>(() => {
    const hubNode: Node = {
      id: 'hub',
      type: 'hub',
      position: { x: 0, y: 0 },
      data: { label: 'YOUR AGENT' },
      // Offset so the hub circle is visually centered at origin
      style: { transform: `translate(${HUB_OFFSET_X}px, ${HUB_OFFSET_Y}px)` },
    };

    const sectionNodes: Node[] = SECTIONS.map((section, index) => {
      const angle = (index / SECTIONS.length) * 2 * Math.PI - Math.PI / 2;
      const x = Math.round(Math.cos(angle) * RADIUS) - 60;
      const y = Math.round(Math.sin(angle) * RADIUS) - 40;

      return {
        id: section.id,
        type: 'section',
        position: { x, y },
        data: {
          label: section.label,
          icon: section.icon,
          section: section.id,
          onClick: () => setActiveDrawer(section.id),
        },
      };
    });

    return [hubNode, ...sectionNodes];
  }, []); // sections are static; onClick captures latest via closure over state setter

  // Build edges — recompute when sectionComplete changes
  const edges = useMemo<Edge[]>(() => {
    return SECTIONS.map((section) => {
      const complete = sectionComplete[section.id] ?? false;
      return {
        id: `edge-${section.id}`,
        source: section.id,
        target: 'hub',
        style: {
          stroke: complete ? '#76b900' : '#1e2d3d',
          strokeWidth: complete ? 2 : 1.5,
        },
      };
    });
  }, [sectionComplete]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0f' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={true}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0f' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e2d3d"
          gap={20}
          size={1}
        />
      </ReactFlow>

      {/* Drawers — rendered outside ReactFlow so they overlay the canvas */}
      <IdentityDrawer      open={activeDrawer === 'identity'}      onClose={() => setActiveDrawer(null)} />
      <LLMDrawer           open={activeDrawer === 'llm'}           onClose={() => setActiveDrawer(null)} />
      <VoiceDrawer         open={activeDrawer === 'voice'}         onClose={() => setActiveDrawer(null)} />
      <MemoryDrawer        open={activeDrawer === 'memory'}        onClose={() => setActiveDrawer(null)} />
      <DataDrawer          open={activeDrawer === 'data'}          onClose={() => setActiveDrawer(null)} />
      <ToolsDrawer         open={activeDrawer === 'tools'}         onClose={() => setActiveDrawer(null)} />
      <SkillsDrawer        open={activeDrawer === 'skills'}        onClose={() => setActiveDrawer(null)} />
      <SubAgentsDrawer     open={activeDrawer === 'subagents'}     onClose={() => setActiveDrawer(null)} />
      <ChannelsDrawer      open={activeDrawer === 'channels'}      onClose={() => setActiveDrawer(null)} />
      <GuardrailsDrawer    open={activeDrawer === 'guardrails'}    onClose={() => setActiveDrawer(null)} />
      <ObservabilityDrawer open={activeDrawer === 'observability'} onClose={() => setActiveDrawer(null)} />
    </div>
  );
}

// ─── Public export — wraps with ReactFlowProvider ─────────────────────────────

export default function AgentCanvas() {
  return (
    <ReactFlowProvider>
      <AgentCanvasInner />
    </ReactFlowProvider>
  );
}
