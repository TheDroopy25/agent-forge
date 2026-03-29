'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';

interface VoiceProvider {
  id: string;
  name: string;
  description: string;
  color: string;
  badge?: string;
  recommend?: boolean;
}

const VOICE_PROVIDERS: VoiceProvider[] = [
  { id: 'elevenlabs', name: 'ElevenLabs', description: 'Most realistic voices — requires a free account', color: '#f59e0b' },
  { id: 'openai',     name: 'OpenAI TTS', description: 'Clean, natural voices — requires OpenAI account', color: '#10a37f' },
];

const PROVIDER_TOOLTIPS: Record<string, string> = {
  elevenlabs: 'Highest quality voices — most natural, expressive, and human-sounding. Free tier includes 10,000 characters per month. Best for production voice agents.',
  openai: '6 built-in voices. Good quality, simple setup. Best if you\'re already using OpenAI for your agent\'s brain — one API key covers both.',
};

const VOICES: Record<string, string[]> = {
  elevenlabs: [
    'Sarah - Mature, Reassuring',
    'Brian - Deep, Comforting',
    'Alice - Clear, Engaging',
    'Eric - Smooth, Trustworthy',
    'Matilda - Knowledgeable, Professional',
    'Adam - Dominant, Firm',
    'Jessica - Playful, Warm',
    'George - Warm Storyteller',
  ],
  openai: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
};

const ELEVENLABS_VOICE_IDS: Record<string, string> = {
  'Sarah - Mature, Reassuring':       'EXAVITQu4vr4xnSDxMaL',
  'Brian - Deep, Comforting':         'nPczCjzI2devNBz1zQrb',
  'Alice - Clear, Engaging':          'Xb7hH8MSUJpSbSDYk0k2',
  'Eric - Smooth, Trustworthy':       'cjVigY5qzO86Huf0OWal',
  'Matilda - Knowledgeable, Professional': 'XrExE9yKIg1WjnnlVkGX',
  'Adam - Dominant, Firm':            'pNInz6obpgDQGcFmaJgB',
  'Jessica - Playful, Warm':          'cgSgspJ2msm6clMCkdW9',
  'George - Warm Storyteller':        'JBFqnCBsd6RMkjVDRZzb',
};

const SPEAKING_STYLES = [
  { value: 'conversational',   label: 'Conversational (natural, relaxed)' },
  { value: 'narrative',        label: 'Narrative (storytelling)' },
  { value: 'newscast',         label: 'Newscast (clear, authoritative)' },
  { value: 'customerservice',  label: 'Customer Service (helpful, patient)' },
  { value: 'cheerful',         label: 'Cheerful (upbeat, energetic)' },
  { value: 'empathetic',       label: 'Empathetic (warm, understanding)' },
];

// Map style labels to ElevenLabs voice_settings (stability 0-1, style 0-1)
// Lower stability = more expressive/variable. Higher style = more exaggerated delivery.
const ELEVENLABS_STYLE_SETTINGS: Record<string, { stability: number; style: number; similarity_boost: number }> = {
  conversational:  { stability: 0.5,  style: 0.3, similarity_boost: 0.75 },
  narrative:       { stability: 0.6,  style: 0.4, similarity_boost: 0.75 },
  newscast:        { stability: 0.8,  style: 0.1, similarity_boost: 0.8  },
  customerservice: { stability: 0.7,  style: 0.2, similarity_boost: 0.8  },
  cheerful:        { stability: 0.35, style: 0.7, similarity_boost: 0.7  },
  empathetic:      { stability: 0.55, style: 0.5, similarity_boost: 0.75 },
};

const selectClass =
  'w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors';

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
      <div className="absolute left-0 bottom-full z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl" style={{ marginBottom: 6 }}>
        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// Play audio blob at a custom speed using Web Audio API
async function playWithSpeed(blob: Blob, speed: number, onEnded: () => void) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = speed;
  source.connect(audioCtx.destination);
  source.onended = () => { onEnded(); audioCtx.close(); };
  source.start();
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function VoiceDrawer({ open, onClose }: Props) {
  const voice = useAgentStore((s) => s.voice);
  const setVoice = useAgentStore((s) => s.setVoice);
  const agentName = useAgentStore((s) => s.identity.name);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [apiKey, setApiKey] = useState('');

  const currentVoices = VOICES[voice.provider] ?? [];

  function handleProviderSelect(id: string) {
    const firstVoice = VOICES[id]?.[0] ?? '';
    setVoice({ provider: id, voiceId: firstVoice });
    setApiKey('');
    setPreviewError('');
  }

  async function handlePreview() {
    setPreviewError('');
    setPreviewing(true);
    const text = `Hi, I'm ${agentName || 'your agent'}. I can speak using this voice.`;
    try {
      if (voice.provider === 'elevenlabs') {
        const voiceId = ELEVENLABS_VOICE_IDS[voice.voiceId] ?? ELEVENLABS_VOICE_IDS['Rachel'];
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: ELEVENLABS_STYLE_SETTINGS[voice.style] ?? { stability: 0.5, style: 0.3, similarity_boost: 0.75 },
          }),
        });
        if (!response.ok) throw new Error('bad_key');
        const blob = await response.blob();
        await playWithSpeed(blob, 1.0, () => setPreviewing(false));
      } else if (voice.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'tts-1', input: text, voice: voice.voiceId, speed: voice.speed }),
        });
        if (!response.ok) throw new Error('bad_key');
        const blob = await response.blob();
        await playWithSpeed(blob, voice.speed, () => setPreviewing(false));
      } else {
        setPreviewing(false);
      }
    } catch {
      setPreviewing(false);
      setPreviewError('Preview failed — check your API key');
    }
  }

  const disabled = !voice.enabled;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Voice</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Enable this if you want your agent to speak out loud. It can join voice calls, read responses aloud, or narrate content. You can leave this off if text is fine.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3">
          <Switch
            checked={voice.enabled}
            onCheckedChange={(checked) => setVoice({ enabled: checked })}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Voice Output</span>
            <Tip text="Enable text-to-speech for this agent. Adds 0.5-3 seconds of latency per response for audio generation. Increases cost by ~$0.01-0.05 per response depending on provider. Essential for voice interfaces, Discord bots, phone agents." />
          </div>
        </div>

        {/* All controls below — grayed when disabled */}
        <div className={`space-y-6 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>

          {/* Provider Cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Provider</label>
              <Tip text="The text-to-speech service that generates audio. Each provider has different voice quality, latency, and cost. See the ? on each card for details." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_PROVIDERS.map((p) => {
                const selected = voice.provider === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleProviderSelect(p.id)}
                    className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-[#76b900] bg-[#76b900]/10'
                        : 'border-[#1e2d3d] bg-[#1a1a2e] hover:border-[#76b900]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="group relative">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
                          <div className="absolute left-0 top-full z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl" style={{ marginTop: 4 }}>
                            <p className="text-xs text-gray-300 leading-relaxed">{PROVIDER_TOOLTIPS[p.id]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-snug">{p.description}</p>
                    {p.badge && (
                      <span className="inline-block self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#052e16', color: '#4ade80', border: '1px solid #166534' }}>
                        {p.badge}
                      </span>
                    )}
                    {p.recommend && (
                      <span className="text-xs text-yellow-400">⭐ Start here</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Section */}
          {voice.provider === 'elevenlabs' && (
            <div className="space-y-3 rounded-lg border border-[#1e2d3d] bg-[#0d1929] p-4">
              <p className="text-sm font-medium text-white">ElevenLabs API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
              />

              {/* Step-by-step signup guide */}
              <div style={{ background: '#0a0a14', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px' }}>
                <p className="text-xs font-semibold text-gray-300 mb-2">How to get a free key (takes 2 minutes):</p>
                <ol style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li className="text-xs text-gray-400">
                    Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-[#76b900] hover:underline">elevenlabs.io</a> and click <strong className="text-gray-300">Sign up</strong>
                  </li>
                  <li className="text-xs text-gray-400">
                    Create your account with your email and a password
                  </li>
                  <li className="text-xs text-gray-400">
                    When asked <em>&ldquo;What are you looking for?&rdquo;</em> — select <strong className="text-gray-300">Personal use</strong> and click Continue
                  </li>
                  <li className="text-xs text-gray-400">
                    You&apos;ll see a &ldquo;Select a plan&rdquo; screen. <strong className="text-[#76b900]">Do not click any plan.</strong> Look for the small <strong className="text-gray-300">&ldquo;Skip&rdquo;</strong> link at the bottom of the page — click that to stay on the free plan (10,000 characters/month, no credit card needed)
                  </li>
                  <li className="text-xs text-gray-400">
                    Once signed in, go to your{' '}
                    <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#76b900] hover:underline">API Keys page →</a>
                    {' '}and click <strong className="text-gray-300">Create API Key</strong>
                  </li>
                  <li className="text-xs text-gray-400">
                    Give it any name (like <em>&ldquo;My Agent&rdquo;</em>). You&apos;ll see a <strong className="text-gray-300">Restrict Key</strong> toggle — <strong className="text-[#76b900]">turn it OFF</strong>. This removes the confusing list of permissions. Then click <strong className="text-gray-300">Create Key</strong>
                  </li>
                  <li className="text-xs text-gray-400">
                    Copy the key that appears and paste it above. <strong className="text-gray-300">Save it somewhere safe</strong> — ElevenLabs only shows it once
                  </li>
                </ol>
              </div>
            </div>
          )}

          {voice.provider === 'openai' && (
            <div className="space-y-3 rounded-lg border border-[#1e2d3d] bg-[#0d1929] p-4">
              <p className="text-sm font-medium text-white">OpenAI API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <div style={{ background: '#060d18', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px' }}>
                <p style={{ color: '#8b9cb3', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>Don&apos;t have one? Here&apos;s how to get it:</p>
                <ol style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    <>Go to <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>platform.openai.com/signup</a> and create a free account</>,
                    <>Once logged in, click your profile icon (top-right) → <strong style={{ color: '#cdd6e0' }}>API keys</strong></>,
                    <>Or go directly: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>platform.openai.com/api-keys</a></>,
                    <>Click <strong style={{ color: '#cdd6e0' }}>Create new secret key</strong> → give it a name → click <strong style={{ color: '#cdd6e0' }}>Create secret key</strong></>,
                    <>Copy the key immediately — OpenAI only shows it once. Paste it in the box above.</>,
                    <><strong style={{ color: '#f59e0b' }}>Note:</strong> OpenAI TTS requires a paid account with billing set up. Add a card at <a href="https://platform.openai.com/settings/organization/billing" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>platform.openai.com/billing</a>. Cost is very low (~$0.015 per 1,000 characters).</>,
                  ].map((step, i) => (
                    <li key={i} style={{ color: '#8b9cb3', fontSize: '12px', lineHeight: '1.5' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Voice Picker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Voice</label>
              <Tip text="Specific voice character within the provider. Each provider offers different voices with unique tone, gender, and style. Changing voice has no cost or performance impact beyond the base TTS cost." />
            </div>
            <select
              value={voice.voiceId}
              onChange={(e) => setVoice({ voiceId: e.target.value })}
              className={selectClass}
            >
              {currentVoices.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Preview Button */}
          {(() => {
                        const hasKey = apiKey.trim().length > 0;
            const canPreview = hasKey;
            let statusMsg = '';
            if (!hasKey) statusMsg = 'Enter your API key above to preview';
            return (
              <div className="space-y-2">
                <button
                  onClick={handlePreview}
                  disabled={!canPreview || previewing}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                    canPreview
                      ? 'border-[#76b900] text-[#76b900] hover:bg-[#76b900]/10 disabled:opacity-60'
                      : 'border-gray-600 text-gray-500 opacity-50'
                  }`}
                >
                  {previewing ? 'Playing...' : 'PREVIEW'}
                </button>
                {previewError ? (
                  <p className="text-xs text-red-400">{previewError}</p>
                ) : statusMsg ? (
                  <p className="text-xs text-gray-500">{statusMsg}</p>
                ) : null}
              </div>
            );
          })()}

          {/* Speed Slider — OpenAI only (ElevenLabs doesn't support speed adjustment) */}
          {voice.provider === 'openai' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-300">Speed</label>
                  <Tip text="0.5x sounds slow and deliberate — good for instructions or accessibility. 1.0x is natural speech. 1.5-2.0x sounds faster — use for quick notifications only." />
                </div>
                <span className="text-sm text-[#76b900] font-mono">{voice.speed.toFixed(1)}x</span>
              </div>
              <Slider
                min={0.5}
                max={2.0}
                step={0.1}
                value={[voice.speed]}
                onValueChange={(val) => setVoice({ speed: Array.isArray(val) ? (val as number[])[0] : (val as number) })}
                className="w-full"
              />
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">0.5x (Slow)</span>
                <span className="text-xs text-gray-500">2.0x (Fast)</span>
              </div>
            </div>
          ) : (
            <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '10px 14px' }}>
              <p className="text-xs text-gray-500">
                💡 ElevenLabs doesn&apos;t support speed adjustment. Speaking pace is controlled by the voice and style you choose above.
              </p>
            </div>
          )}

          {/* Speaking Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Speaking Style</label>
              <Tip text="Changes the vocal energy and delivery. Newscast is clear and authoritative. Conversational is relaxed and natural. Empathetic is warmer and slower. Cheerful adds energy. Default is neutral." />
            </div>
            <select
              value={voice.style}
              onChange={(e) => setVoice({ style: e.target.value })}
              className={selectClass}
            >
              {SPEAKING_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
