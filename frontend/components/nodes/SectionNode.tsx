'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/agentStore';

type SectionNodeData = {
  label: string;
  icon: string;
  section: string;
};

// Determine status from store state for the given section key
function useSectionStatus(section: string): 'complete' | 'inProgress' | 'notStarted' {
  const sectionComplete = useAgentStore((s) => s.sectionComplete);
  const state = useAgentStore((s) => s);

  const storeKey = section === 'subagents' ? 'subAgents' : section;
  if (sectionComplete[storeKey]) return 'complete';

  // Detect "in progress" — any non-default value set
  switch (section) {
    case 'identity':
      if (state.identity.name || state.identity.purpose) return 'inProgress';
      break;
    case 'llm':
      if (state.llm.provider || state.llm.model) return 'inProgress';
      break;
    case 'voice':
      if (state.voice.enabled) return 'inProgress';
      break;
    case 'memory':
      if (
        state.memory.shortTerm.enabled ||
        state.memory.longTerm.enabled ||
        state.memory.episodic.enabled ||
        state.memory.workingMemory.enabled ||
        state.memory.externalDb.enabled
      )
        return 'inProgress';
      break;
    case 'data':
      if (
        state.data.files.length > 0 ||
        state.data.urls.length > 0 ||
        state.data.apiConnections.length > 0
      )
        return 'inProgress';
      break;
    case 'tools': {
      const { webSearch, codeExecution, fileSystem, browserControl, terminal,
              imageAnalysis, pdfReader, calendar, email, customMcp } = state.tools;
      if (webSearch || codeExecution || fileSystem || browserControl || terminal ||
          imageAnalysis || pdfReader || calendar || email || customMcp)
        return 'inProgress';
      break;
    }
    case 'skills': {
      const { discord, github, googleWorkspace, weather, summarize, figma,
              clawHub, webScraper, cronScheduler, notion, slack, airtable } = state.skills;
      if (discord || github || googleWorkspace || weather || summarize || figma ||
          clawHub || webScraper || cronScheduler || notion || slack || airtable)
        return 'inProgress';
      break;
    }
    case 'subagents':
      if (state.subAgents.agents.length > 0) return 'inProgress';
      break;
    case 'channels':
      if (
        state.channels.discord.enabled ||
        state.channels.telegram.enabled ||
        state.channels.whatsapp.enabled ||
        state.channels.restApi.enabled ||
        state.channels.sms.enabled ||
        state.channels.cliOnly
      )
        return 'inProgress';
      break;
    case 'guardrails':
      if (state.guardrails.neverDo.length > 0 || state.guardrails.alwaysAsk.length > 0)
        return 'inProgress';
      break;
    case 'observability':
      if (
        state.observability.heartbeatInterval !== 'disabled' ||
        state.observability.discordAlertChannel.length > 0 ||
        state.observability.dailySummary === true
      )
        return 'inProgress';
      break;
  }

  return 'notStarted';
}

const STATUS_COLORS: Record<string, string> = {
  complete: '#76b900',
  inProgress: '#f6c90e',
  notStarted: '#4a5568',
};

const STEP_NUMBERS: Record<string, number> = {
  identity: 1,
  llm: 2,
  voice: 3,
  memory: 4,
  data: 5,
  tools: 6,
  skills: 7,
  subagents: 8,
  channels: 9,
  guardrails: 10,
  observability: 11,
};

export default function SectionNode({ data }: NodeProps & { data: SectionNodeData }) {
  const sectionComplete = useAgentStore((s) => s.sectionComplete);
  const nextStep = useAgentStore((s) => s.nextStep);
  const status = useSectionStatus(data.section);
  const storeKey = data.section === 'subagents' ? 'subAgents' : data.section;
  const isComplete = sectionComplete[storeKey] ?? false;
  const isNextStep = nextStep === data.section && !isComplete;
  const stepNumber = STEP_NUMBERS[data.section];

  const borderColor = isComplete
    ? '#76b900'
    : isNextStep
    ? '#00d4ff'
    : '#1e2d3d';

  const boxShadow = isComplete
    ? '0 0 15px rgba(118,185,0,0.35)'
    : isNextStep
    ? '0 0 15px rgba(0,212,255,0.35)'
    : 'none';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: 120,
        height: 80,
        background: '#12121a',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        boxShadow,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Step number badge — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 5,
          left: 6,
          background: isNextStep ? '#00d4ff' : '#1e2d3d',
          color: isNextStep ? '#000' : '#6b7a8d',
          fontSize: 8,
          fontWeight: 700,
          width: 14,
          height: 14,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {stepNumber}
      </div>

      {/* Status dot */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: STATUS_COLORS[status],
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
        {data.icon}
      </span>

      {/* Label */}
      <span
        style={{
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {data.label}
      </span>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </motion.div>
  );
}
