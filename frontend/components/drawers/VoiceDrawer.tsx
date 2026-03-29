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
  { id: 'azure',      name: 'Azure TTS',  description: 'Microsoft voices — requires Azure account',       color: '#0078d4' },
  { id: 'openai',     name: 'OpenAI TTS', description: 'Clean voices — requires OpenAI account',          color: '#10a37f' },
  { id: 'kokoro',     name: 'Kokoro',     description: 'Free voices — no account, runs on your computer', color: '#8b5cf6', badge: 'FREE • No account needed', recommend: true },
];

const PROVIDER_TOOLTIPS: Record<string, string> = {
  elevenlabs: 'Highest quality voices — most natural, expressive, and human-sounding. Latency: ~500ms. Cost: ~$0.30/1000 chars (free tier: 10K chars/month). Best for production voice agents.',
  azure: 'Microsoft neural voices. Very high quality, slightly lower than ElevenLabs. Latency: ~300ms. Cost: ~$16/1M chars (free tier: 500K chars/month). Good balance of quality and cost.',
  openai: '6 built-in voices. Good quality, simple setup. Latency: ~400ms. Cost: ~$15/1M chars. Best if you are already using OpenAI for LLM — one API key.',
  kokoro: 'Runs entirely on your machine — zero cost, zero latency added by API calls. Requires ~500MB disk. Quality is good but not as natural as cloud options. Best for privacy or offline use.',
};

const VOICES: Record<string, string[]> = {
  elevenlabs: ['Rachel', 'Domi', 'Bella', 'Josh', 'Adam'],
  openai:     ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  azure:      ['GuyNeural', 'JennyNeural'],
  kokoro:     ['af_heart', 'am_adam'],
};

const SPEAKING_STYLES = [
  { value: 'conversational',   label: 'Conversational (natural, relaxed)' },
  { value: 'narrative',        label: 'Narrative (storytelling)' },
  { value: 'newscast',         label: 'Newscast (clear, authoritative)' },
  { value: 'customerservice',  label: 'Customer Service (helpful, patient)' },
  { value: 'cheerful',         label: 'Cheerful (upbeat, energetic)' },
  { value: 'empathetic',       label: 'Empathetic (warm, understanding)' },
];

const selectClass =
  'w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors';

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
      <div className="absolute left-0 top-full z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl" style={{ marginTop: 4 }}>
        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
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
  const [apiKey, setApiKey] = useState('');

  const currentVoices = VOICES[voice.provider] ?? [];

  function handleProviderSelect(id: string) {
    const firstVoice = VOICES[id]?.[0] ?? '';
    setVoice({ provider: id, voiceId: firstVoice });
    setApiKey('');
  }

  function handlePreview() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setPreviewing(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Hi, I'm ${agentName || 'your agent'}. I'm ready to help you with anything you need.`
    );
    utterance.rate = voice.speed;
    utterance.onstart = () => setPreviewing(true);
    utterance.onend = () => setPreviewing(false);
    utterance.onerror = () => setPreviewing(false);
    window.speechSynthesis.speak(utterance);
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
            <div className="space-y-2 rounded-lg border border-[#1e2d3d] bg-[#0d1929] p-4">
              <p className="text-sm font-medium text-white">ElevenLabs API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <p className="text-xs text-gray-500">
                Don&apos;t have one? Get a free key at elevenlabs.io — free tier includes 10,000 characters per month.
              </p>
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#76b900] hover:underline"
              >
                Get a free ElevenLabs key →
              </a>
            </div>
          )}

          {voice.provider === 'azure' && (
            <div className="space-y-2 rounded-lg border border-[#1e2d3d] bg-[#0d1929] p-4">
              <p className="text-sm font-medium text-white">Azure Speech API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <p className="text-xs text-gray-500">
                Get your key from the Azure portal under &quot;Speech Services&quot;. Free tier includes 500,000 characters per month.
              </p>
              <a
                href="https://azure.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#76b900] hover:underline"
              >
                Get an Azure Speech key →
              </a>
            </div>
          )}

          {voice.provider === 'openai' && (
            <div className="space-y-2 rounded-lg border border-[#1e2d3d] bg-[#0d1929] p-4">
              <p className="text-sm font-medium text-white">OpenAI API Key</p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#76b900] transition-colors"
              />
              <p className="text-xs text-gray-500">
                Same key you use for the ChatGPT API. Get one at platform.openai.com.
              </p>
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#76b900] hover:underline"
              >
                Get an OpenAI API key →
              </a>
            </div>
          )}

          {voice.provider === 'kokoro' && (
            <div className="rounded-lg border p-4" style={{ background: '#052e16', borderColor: '#166534' }}>
              <p className="text-sm text-green-400">
                ✅ No API key needed. Kokoro runs locally on your computer — completely free, completely private.
              </p>
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
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreview}
                disabled={previewing}
                className="px-4 py-2 rounded-md border border-[#76b900] text-[#76b900] text-sm font-medium hover:bg-[#76b900]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                PREVIEW
              </button>
              {previewing && (
                <span className="text-sm text-[#76b900]">🎵 Speaking...</span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Preview uses your browser&apos;s built-in voice. Your actual agent will use the provider you selected above.
            </p>
          </div>

          {/* Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Speed</label>
                <Tip text="0.5x sounds slow and deliberate — good for instructions or accessibility. 1.0x is natural speech. 1.5-2.0x sounds rushed — use for quick notifications only." />
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
