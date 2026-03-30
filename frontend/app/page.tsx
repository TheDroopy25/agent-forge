'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { BottomBar } from '@/components/BottomBar'
import { BuildModal } from '@/components/BuildModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { TemplateSelector } from '@/components/TemplateSelector'
import { useAgentStore } from '@/store/agentStore'

// Use dynamic import with ssr:false for AgentCanvas (React Flow requires browser)
const AgentCanvas = dynamic(() => import('@/components/AgentCanvas'), { ssr: false })

const CONFIG_SLICES = ['identity', 'llm', 'voice', 'memory', 'tools', 'skills', 'channels', 'guardrails', 'observability', 'targetOS'] as const

export default function Page() {
  const [buildOpen, setBuildOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const loadFileRef = useRef<HTMLInputElement>(null)

  const resetStore = useAgentStore((s) => s.resetStore)
  const loadConfig = useAgentStore((s) => s.loadConfig)
  const storeState = useAgentStore((s) => s)

  // Restore previous session on mount
  useEffect(() => {
    const saved = localStorage.getItem('agentforge-save')
    if (saved) {
      try {
        loadConfig(JSON.parse(saved))
      } catch {
        // ignore malformed saves
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save config slices on every change
  useEffect(() => {
    const snapshot: Record<string, unknown> = {}
    for (const key of CONFIG_SLICES) {
      snapshot[key] = storeState[key]
    }
    localStorage.setItem('agentforge-save', JSON.stringify(snapshot))
  }, CONFIG_SLICES.map((k) => storeState[k])) // eslint-disable-line react-hooks/exhaustive-deps

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
            onClick={() => {
              if (window.confirm('Start a new agent? Your current config will be cleared.')) {
                resetStore()
                localStorage.removeItem('agentforge-save')
              }
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
            onClick={() => loadFileRef.current?.click()}
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
      <input
        ref={loadFileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            try {
              const parsed = JSON.parse(ev.target?.result as string)
              loadConfig(parsed)
              toast('Agent config loaded!')
            } catch {
              toast('Failed to parse config file.')
            }
          }
          reader.readAsText(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
