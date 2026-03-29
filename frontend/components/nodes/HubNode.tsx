'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/agentStore';

type HubNodeData = {
  label: string;
};

export default function HubNode({ data }: NodeProps & { data: HubNodeData }) {
  const name = useAgentStore((s) => s.identity.name);
  const setIdentity = useAgentStore((s) => s.setIdentity);

  const hasName = name.length > 0;

  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
      {/* "Start here" prompt — shown only when no name */}
      {!hasName && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            color: '#76b900',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}
        >
          👆 Start here
        </motion.div>
      )}

      {/* Animated pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(118, 185, 0, 0.45)',
          pointerEvents: 'none',
        }}
      />

      {/* Main circle */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: '#12121a',
          border: '2px solid #76b900',
          boxShadow: '0 0 30px rgba(118,185,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '0 16px',
        }}
      >
        {/* Robot emoji — shrinks when name present */}
        <span style={{ fontSize: hasName ? 28 : 36, lineHeight: 1 }}>🤖</span>

        {/* Name input */}
        <input
          value={name}
          onChange={(e) => setIdentity({ name: e.target.value })}
          placeholder="Name your agent..."
          className="nodrag"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: hasName ? 'none' : '1px solid rgba(118,185,0,0.4)',
            outline: 'none',
            color: hasName ? '#76b900' : '#ffffff',
            fontSize: hasName ? 14 : 12,
            fontWeight: hasName ? 700 : 400,
            textAlign: 'center',
            width: '100%',
            padding: '2px 0',
            letterSpacing: hasName ? '0.04em' : '0',
          }}
        />

        {/* Checkmark — shown when named */}
        {hasName && (
          <span style={{ fontSize: 14, lineHeight: 1 }}>✅</span>
        )}

        {/* Hub badge */}
        <span
          style={{
            background: '#2a2a38',
            color: '#9ca3af',
            fontSize: 9,
            fontWeight: 500,
            padding: '1px 7px',
            borderRadius: 9999,
            letterSpacing: '0.05em',
          }}
        >
          Hub
        </span>
      </div>

      {/* Handles — hidden visually but functional for edges */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
