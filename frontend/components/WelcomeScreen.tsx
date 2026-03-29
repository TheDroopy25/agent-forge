'use client';

import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: '🎨',
    title: 'Design It',
    subtitle: 'Give your agent a name, personality, and purpose',
  },
  {
    icon: '🧠',
    title: 'Configure It',
    subtitle: 'Choose what AI model it uses and what it can do',
  },
  {
    icon: '🚀',
    title: 'Deploy It',
    subtitle: 'One click and it runs on your computer',
  },
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  function dismiss() {
    localStorage.setItem('agentforge_welcomed', 'true');
    onComplete();
  }

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
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        {/* Robot emoji */}
        <div style={{ fontSize: '80px', lineHeight: 1 }}>🤖</div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1
            style={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '36px',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Build Your First AI Assistant
          </h1>
          <p
            style={{
              color: '#8b9cb3',
              fontSize: '18px',
              margin: 0,
            }}
          >
            No coding. No setup. About 5 minutes.
          </p>
        </div>

        {/* Step cards */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.title}
              style={{
                background: '#12121a',
                border: '1px solid #1e2d3d',
                borderRadius: '12px',
                padding: '20px 18px',
                flex: '1 1 160px',
                minWidth: '140px',
                maxWidth: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '32px' }}>{step.icon}</span>
              <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px' }}>
                {step.title}
              </span>
              <span style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: 1.4 }}>
                {step.subtitle}
              </span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={dismiss}
          style={{
            background: '#76b900',
            color: '#000000',
            fontWeight: 700,
            fontSize: '16px',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#8fd400';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#76b900';
          }}
        >
          Let&apos;s Build! →
        </button>

        {/* Skip link */}
        <button
          onClick={dismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4a5568',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Skip intro →
        </button>
      </motion.div>
    </div>
  );
}
