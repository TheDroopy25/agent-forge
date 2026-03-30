'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAgentStore } from '@/store/agentStore';

interface TemplateSelectorProps {
  onComplete: () => void;
}

interface Template {
  emoji: string;
  title: string;
  desc: string;
  dashed?: boolean;
  apply: () => void;
}

function buildTemplates(store: ReturnType<typeof useAgentStore.getState>): Template[] {
  return [
    {
      emoji: '🤝',
      title: 'Personal Assistant',
      desc: 'Answers questions, manages tasks, sends emails',
      apply: () => {
        store.setIdentity({ purpose: 'A helpful personal assistant that answers questions, manages tasks, and helps with daily work' });
      },
    },
    {
      emoji: '💬',
      title: 'Discord Bot',
      desc: 'Hangs out in your Discord server, helps your community',
      apply: () => {
        store.setIdentity({ purpose: 'A friendly Discord bot that helps server members with questions and keeps conversations going' });
      },
    },
    {
      emoji: '📱',
      title: 'Social Media Manager',
      desc: 'Drafts posts, tracks trends, manages your presence',
      apply: () => {
        store.setIdentity({ purpose: 'A social media manager that drafts engaging posts, monitors trends, and helps grow your online presence' });
      },
    },
    {
      emoji: '🛍️',
      title: 'Customer Support Bot',
      desc: 'Answers customer questions 24/7 about your business',
      apply: () => {
        store.setIdentity({ purpose: 'A customer support agent that answers questions about the business, helps resolve issues, and escalates when needed' });
      },
    },
    {
      emoji: '📚',
      title: 'Research Assistant',
      desc: 'Reads articles, summarizes documents, finds information',
      apply: () => {
        store.setIdentity({ purpose: 'A research assistant that reads documents, summarizes articles, finds information, and synthesizes knowledge on any topic' });
      },
    },
    {
      emoji: '⚙️',
      title: 'Start from Scratch',
      desc: 'Configure everything yourself',
      dashed: true,
      apply: () => {
        // No preset changes — blank canvas
      },
    },
  ];
}

export function TemplateSelector({ onComplete }: TemplateSelectorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function handleSelect(template: Template) {
    const store = useAgentStore.getState();
    template.apply();
    localStorage.setItem('agentforge_template_chosen', 'true');
    onComplete();
    if (template.title !== 'Start from Scratch') {
      toast(`✨ ${template.title} template loaded! Customize it on the canvas.`);
    }
  }

  const store = useAgentStore.getState();
  const templates = buildTemplates(store);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          maxWidth: '720px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          padding: '24px 0',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2
            style={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '28px',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            What do you want your agent to do?
          </h2>
          <p style={{ color: '#8b9cb3', fontSize: '16px', margin: 0 }}>
            Pick a starting point — you can customize everything after
          </p>
        </div>

        {/* Template grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {templates.map((template, index) => {
            const isHovered = hoveredIndex === index;
            const isDashed = template.dashed;
            return (
              <motion.button
                key={template.title}
                onClick={() => handleSelect(template)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{
                  scale: isHovered ? 1.03 : 1,
                  borderColor: isHovered ? '#76b900' : isDashed ? '#4a5568' : '#1e2d3d',
                }}
                transition={{ duration: 0.15 }}
                style={{
                  background: isDashed ? 'transparent' : '#12121a',
                  border: `${isDashed ? '2px dashed' : '1px solid'} ${isHovered ? '#76b900' : isDashed ? '#4a5568' : '#1e2d3d'}`,
                  borderRadius: '12px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '40px', lineHeight: 1 }}>{template.emoji}</span>
                <span
                  style={{
                    color: isDashed ? '#8b9cb3' : '#ffffff',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: 1.3,
                  }}
                >
                  {template.title}
                </span>
                <span
                  style={{
                    color: '#8b9cb3',
                    fontSize: '13px',
                    lineHeight: 1.4,
                  }}
                >
                  {template.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
