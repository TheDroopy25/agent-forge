'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Update these URLs after the first CI build completes
const DOWNLOADS = [
  {
    platform: 'macOS',
    icon: '🍎',
    label: 'Download for Mac',
    sublabel: 'macOS 12+ · Intel & Apple Silicon',
    url: '#coming-soon',
    ext: '.dmg',
    instructions: 'Open the DMG file, drag AgentForge to your Applications folder, and launch it.',
    available: false,
  },
  {
    platform: 'Windows',
    icon: '🪟',
    label: 'Download for Windows',
    sublabel: 'Windows 10/11 · 64-bit',
    url: '#coming-soon',
    ext: '.exe',
    instructions: 'Run the installer (.exe) and follow the setup wizard. Windows may show a SmartScreen warning — click "More info" → "Run anyway".',
    available: false,
  },
  {
    platform: 'Linux',
    icon: '🐧',
    label: 'Download for Linux',
    sublabel: 'Ubuntu, Debian, Fedora · x64 & ARM64',
    url: '#coming-soon',
    ext: '.AppImage',
    instructions: 'Download the .AppImage file, then run: chmod +x AgentForge-*.AppImage && ./AgentForge-*.AppImage',
    available: false,
  },
];

export default function BetaPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '48px' }}
      >
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🤖</div>
        <h1
          style={{
            color: '#e2e8f0',
            fontSize: '36px',
            fontWeight: 700,
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
          }}
        >
          AgentForge Desktop
        </h1>
        <p style={{ color: '#8b9cb3', fontSize: '17px', margin: '0 0 8px' }}>
          Private Beta — thanks for testing! 🙏
        </p>
        <div
          style={{
            display: 'inline-block',
            background: '#1e2d3d',
            border: '1px solid #2d3f52',
            borderRadius: '20px',
            padding: '4px 14px',
            color: '#76b900',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          v0.1.0-beta
        </div>
      </motion.div>

      {/* Download cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '520px',
        }}
      >
        {DOWNLOADS.map((d, i) => (
          <motion.div
            key={d.platform}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div
              style={{
                background: '#12121a',
                border: `1px solid ${expanded === d.platform ? '#76b900' : '#1e2d3d'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Main row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px 20px',
                }}
              >
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px' }}>
                    {d.platform}
                  </div>
                  <div style={{ color: '#4a5568', fontSize: '12px', marginTop: '2px' }}>
                    {d.sublabel}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setExpanded(expanded === d.platform ? null : d.platform)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2d3f52',
                      borderRadius: '6px',
                      color: '#8b9cb3',
                      fontSize: '12px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    How to install
                  </button>
                  <a
                    href={d.available ? d.url : undefined}
                    style={{
                      background: d.available ? '#76b900' : '#1e2d3d',
                      color: d.available ? '#000' : '#4a5568',
                      fontWeight: 700,
                      fontSize: '13px',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      cursor: d.available ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                      display: 'inline-block',
                    }}
                  >
                    {d.available ? `Download ${d.ext}` : 'Building...'}
                  </a>
                </div>
              </div>

              {/* Expanded install instructions */}
              {expanded === d.platform && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    borderTop: '1px solid #1e2d3d',
                    padding: '14px 20px',
                    background: '#0d0d14',
                  }}
                >
                  <p style={{ color: '#8b9cb3', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                    {d.instructions}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* What to expect section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '48px',
          maxWidth: '520px',
          width: '100%',
          background: '#12121a',
          border: '1px solid #1e2d3d',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>
          What to expect 👇
        </h3>
        {[
          ['🎨', 'Visual canvas', 'Click the nodes to configure your agent — no code needed'],
          ['🤖', 'Templates', 'Pick a starting point: Personal Assistant, Discord Bot, and more'],
          ['🚀', 'One-click deploy', 'Hit Build → Deploy and your agent is running locally in minutes'],
          ['💡', 'Guided everywhere', 'Every section has plain-English explanations of what it does'],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>{title}</div>
              <div style={{ color: '#8b9cb3', fontSize: '12px', marginTop: '2px' }}>{desc}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Feedback */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          color: '#4a5568',
          fontSize: '13px',
          marginTop: '32px',
          textAlign: 'center',
        }}
      >
        Found a bug or have feedback? Drop a message and let us know. 🙏
      </motion.p>
    </main>
  );
}
