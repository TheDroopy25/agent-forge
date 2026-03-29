'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { BottomBar } from '@/components/BottomBar'
import { BuildModal } from '@/components/BuildModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { TemplateSelector } from '@/components/TemplateSelector'

// Use dynamic import with ssr:false for AgentCanvas (React Flow requires browser)
const AgentCanvas = dynamic(() => import('@/components/AgentCanvas'), { ssr: false })

export default function Page() {
  const [buildOpen, setBuildOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('agentforge_welcomed')) {
      setShowWelcome(true)
    } else if (!localStorage.getItem('agentforge_template_chosen')) {
      setShowTemplates(true)
    }
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0f' }}>
      {/* Header */}
      <div
        style={{
          height: '52px',
          background: '#0d0d14',
          borderBottom: '1px solid #1e2d3d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        {/* Left: branding */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#76b900', fontWeight: 700, fontSize: '20px' }}>AgentForge</span>
          <span style={{ color: '#4a5568', fontSize: '14px', marginLeft: '8px' }}>Visual Agent Builder</span>
        </div>

        {/* Right: stub buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid #1e2d3d',
              color: '#888',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#76b900';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2d3d';
              (e.currentTarget as HTMLButtonElement).style.color = '#888';
            }}
          >
            New Agent
          </button>
          <button
            style={{
              background: 'transparent',
              border: '1px solid #1e2d3d',
              color: '#888',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#76b900';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2d3d';
              (e.currentTarget as HTMLButtonElement).style.color = '#888';
            }}
          >
            Load Saved
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AgentCanvas />
      </div>

      <BottomBar onBuildClick={() => setBuildOpen(true)} />
      <BuildModal open={buildOpen} onClose={() => setBuildOpen(false)} />

      {/* Onboarding overlays */}
      {showWelcome && (
        <WelcomeScreen
          onComplete={() => {
            setShowWelcome(false)
            setShowTemplates(true)
          }}
        />
      )}
      {showTemplates && !showWelcome && (
        <TemplateSelector onComplete={() => setShowTemplates(false)} />
      )}
    </div>
  )
}
