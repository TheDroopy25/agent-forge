'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

type HubNodeData = {
  label: string;
};

export default function HubNode({ data }: NodeProps & { data: HubNodeData }) {
  return (
    <div style={{ position: 'relative', width: 160, height: 160 }}>
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
          gap: 4,
        }}
      >
        {/* Robot emoji */}
        <span style={{ fontSize: 48, lineHeight: 1 }}>🤖</span>

        {/* Label */}
        <span
          style={{
            color: '#76b900',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          YOUR AGENT
        </span>

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
