'use client';

import { useEffect, useState } from 'react';

const RELEASES_URL = 'https://github.com/TheDroopy25/agent-forge/releases/latest';

const PLATFORMS = [
  {
    id: 'mac',
    icon: '🍎',
    label: 'Download for Mac',
    note: 'Works on Apple Silicon (M1/M2/M3) and Intel — macOS 11+',
    detect: () => typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) && !/iPhone|iPad/.test(navigator.userAgent),
  },
  {
    id: 'windows',
    icon: '🪟',
    label: 'Download for Windows',
    note: 'Windows 10 or 11, 64-bit',
    detect: () => typeof navigator !== 'undefined' && /Win/.test(navigator.userAgent),
  },
  {
    id: 'linux',
    icon: '🐧',
    label: 'Download for Linux',
    note: 'AppImage — works on most Linux distros',
    detect: () => typeof navigator !== 'undefined' && /Linux/.test(navigator.userAgent),
  },
];

export default function DownloadPage() {
  const [detected, setDetected] = useState(PLATFORMS[0]);
  const [others, setOthers] = useState(PLATFORMS.slice(1));

  useEffect(() => {
    const match = PLATFORMS.find((p) => p.detect()) ?? PLATFORMS[0];
    setDetected(match);
    setOthers(PLATFORMS.filter((p) => p.id !== match.id));
  }, []);

  return (
    <div style={{
      background: '#0a0a0f',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        background: '#12121a',
        border: '1px solid #1e2d3d',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 520,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
          Download AgentForge
        </h1>
        <p style={{ color: '#8b9cb3', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
          Build and deploy your own AI agent — no coding required.
        </p>

        {/* Primary download */}
        <a
          href={RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#76b900',
            color: '#000',
            fontWeight: 700,
            fontSize: 16,
            padding: '14px 28px',
            borderRadius: 10,
            textDecoration: 'none',
            marginBottom: 10,
          }}
        >
          <span>{detected.icon}</span>
          <span>{detected.label}</span>
        </a>
        <p style={{ color: '#4a5568', fontSize: 13, marginBottom: 32 }}>{detected.note}</p>

        <hr style={{ border: 'none', borderTop: '1px solid #1e2d3d', margin: '24px 0' }} />
        <p style={{ color: '#4a5568', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Other platforms
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {others.map((p) => (
            <a
              key={p.id}
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'transparent',
                border: '1px solid #1e2d3d',
                color: '#8b9cb3',
                fontSize: 13,
                padding: '8px 18px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              {p.icon} {p.label.replace('Download for ', '')}
            </a>
          ))}
        </div>

        <div style={{
          marginTop: 32,
          padding: 16,
          background: '#0d1a24',
          borderRadius: 10,
          fontSize: 13,
          color: '#8b9cb3',
          lineHeight: 1.6,
        }}>
          After installing, AgentForge will check if{' '}
          <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900', textDecoration: 'none' }}>
            Node.js
          </a>{' '}
          is installed and walk you through the rest.{' '}
          <strong style={{ color: '#e2e8f0' }}>No technical experience needed.</strong>
        </div>
      </div>
    </div>
  );
}
