'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/store/agentStore';

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

const OS_OPTIONS = [
  {
    id: 'mac' as const,
    icon: '🍎',
    label: 'Mac',
    subtitle: 'macOS (Apple Silicon or Intel)',
  },
  {
    id: 'linux' as const,
    icon: '🐧',
    label: 'Linux',
    subtitle: 'Ubuntu, Debian, or other Linux',
  },
  {
    id: 'windows' as const,
    icon: '🪟',
    label: 'Windows',
    subtitle: 'Windows 10 or 11',
  },
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const setTargetOS = useAgentStore((s) => s.setTargetOS);
  const [step, setStep] = useState<'os' | 'welcome'>('os');
  const [selectedOS, setSelectedOS] = useState<'mac' | 'linux' | 'windows' | null>(null);

  function handleOSContinue() {
    if (!selectedOS) return;
    setTargetOS(selectedOS);
    setStep('welcome');
  }

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
      <AnimatePresence mode="wait">
        {step === 'os' ? (
          <motion.div
            key="os-picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              maxWidth: '560px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '28px',
            }}
          >
            {/* Heading */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h1
                style={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '28px',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                One quick question before we start
              </h1>
              <p style={{ color: '#8b9cb3', fontSize: '16px', margin: 0 }}>
                What computer are you using?
              </p>
            </div>

            {/* OS buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
                width: '100%',
              }}
            >
              {OS_OPTIONS.map((os) => {
                const isSelected = selectedOS === os.id;
                return (
                  <button
                    key={os.id}
                    onClick={() => setSelectedOS(os.id)}
                    style={{
                      background: isSelected ? 'rgba(118,185,0,0.08)' : '#12121a',
                      border: `2px solid ${isSelected ? '#76b900' : '#1e2d3d'}`,
                      borderRadius: '14px',
                      padding: '24px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(118,185,0,0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2d3d';
                      }
                    }}
                  >
                    <span style={{ fontSize: '40px', lineHeight: 1 }}>{os.icon}</span>
                    <span
                      style={{
                        color: isSelected ? '#76b900' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '16px',
                      }}
                    >
                      {os.label}
                    </span>
                    <span
                      style={{
                        color: '#8b9cb3',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        textAlign: 'center',
                      }}
                    >
                      {os.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Continue button */}
            <button
              onClick={handleOSContinue}
              disabled={!selectedOS}
              style={{
                background: selectedOS ? '#76b900' : '#1e2d3d',
                color: selectedOS ? '#000000' : '#4a5568',
                fontWeight: 700,
                fontSize: '16px',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                cursor: selectedOS ? 'pointer' : 'not-allowed',
                letterSpacing: '0.01em',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (selectedOS) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#8fd400';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOS) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#76b900';
                }
              }}
            >
              Continue →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
              {STEPS.map((s) => (
                <div
                  key={s.title}
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
                  <span style={{ fontSize: '32px' }}>{s.icon}</span>
                  <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px' }}>
                    {s.title}
                  </span>
                  <span style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: 1.4 }}>
                    {s.subtitle}
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
        )}
      </AnimatePresence>
    </div>
  );
}
