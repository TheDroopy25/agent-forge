'use client';

import { useEffect, useState } from 'react';

const V = 'v1.0.0';
const BASE = `https://github.com/TheDroopy25/agent-forge/releases/download/${V}`;

const PLATFORMS = [
  {
    id: 'mac-arm',
    icon: '🍎',
    label: 'Download for Mac',
    note: 'Apple Silicon (M1 / M2 / M3) — macOS 11+',
    url: `${BASE}/AgentForge-1.0.0-arm64.dmg`,
    detect: () =>
      typeof navigator !== 'undefined' &&
      /Mac/.test(navigator.userAgent) &&
      !/iPhone|iPad/.test(navigator.userAgent),
  },
  {
    id: 'windows',
    icon: '🪟',
    label: 'Download for Windows',
    note: 'Windows 10 or 11, 64-bit',
    url: `${BASE}/AgentForge-Setup-1.0.0.exe`,
    detect: () => typeof navigator !== 'undefined' && /Win/.test(navigator.userAgent),
  },
  {
    id: 'linux',
    icon: '🐧',
    label: 'Download for Linux',
    note: 'AppImage — works on most Linux distros',
    url: `${BASE}/AgentForge-1.0.0.AppImage`,
    detect: () => typeof navigator !== 'undefined' && /Linux/.test(navigator.userAgent),
  },
];

// Mac Intel as a secondary option
const MAC_INTEL = {
  label: 'Mac (Intel)',
  url: `${BASE}/AgentForge-1.0.0.dmg`,
};

export default function DownloadPage() {
  const [detected, setDetected] = useState(PLATFORMS[0]);
  const [others, setOthers] = useState(PLATFORMS.slice(1));
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const match = PLATFORMS.find((p) => p.detect()) ?? PLATFORMS[0];
    setDetected(match);
    setOthers(PLATFORMS.filter((p) => p.id !== match.id));
    setIsMac(match.id === 'mac-arm');
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
      color: '#e2e8f0',
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
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Download AgentForge</h1>
        <p style={{ color: '#8b9cb3', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
          Build and deploy your own AI agent — no coding required.
        </p>

        {/* Primary download */}
        <a
          href={detected.url}
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
        <p style={{ color: '#4a5568', fontSize: 13, marginBottom: isMac ? 8 : 32 }}>
          {detected.note}
        </p>

        {/* Mac Intel secondary link */}
        {isMac && (
          <p style={{ color: '#4a5568', fontSize: 12, marginBottom: 32 }}>
            On an older Intel Mac?{' '}
            <a href={MAC_INTEL.url} style={{ color: '#76b900', textDecoration: 'none' }}>
              Download the Intel version
            </a>
          </p>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #1e2d3d', margin: '0 0 24px' }} />
        <p style={{ color: '#4a5568', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Other platforms
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {others.map((p) => (
            <a
              key={p.id}
              href={p.url}
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
          padding: 16,
          background: '#0d1a24',
          borderRadius: 10,
          fontSize: 13,
          color: '#8b9cb3',
          lineHeight: 1.6,
        }}>
          After installing, AgentForge checks if{' '}
          <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900', textDecoration: 'none' }}>
            Node.js
          </a>{' '}
          is on your computer and walks you through the rest.{' '}
          <strong style={{ color: '#e2e8f0' }}>No technical experience needed.</strong>
        </div>
      </div>
    </div>
  );
}
