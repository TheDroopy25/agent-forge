'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useAgentStore } from '@/store/agentStore';

interface Provider {
  id: string;
  name: string;
  icon: string;
  description: string;
  dotColor: string;
}

const PROVIDERS: Provider[] = [
  { id: 'openai',    name: 'OpenAI',     icon: '🟢', description: 'GPT-4o and beyond',        dotColor: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic',  icon: '🟣', description: 'Claude model family',       dotColor: '#b07fea' },
  { id: 'google',    name: 'Google',     icon: '🔵', description: 'Gemini model family',       dotColor: '#4285f4' },
  { id: 'mistral',   name: 'Mistral',    icon: '🟠', description: 'Open-weight models',        dotColor: '#ff6b35' },
  { id: 'ollama',    name: 'Ollama',     icon: '⚫', description: 'Local model inference',     dotColor: '#555' },
  { id: 'nvidia',    name: 'NVIDIA NIM', icon: '🟩', description: 'Accelerated inference',     dotColor: '#76b900' },
];

const MODELS: Record<string, string[]> = {
  openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5'],
  google:    ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  mistral:   ['mistral-large-latest', 'mistral-medium', 'mistral-small'],
  ollama:    ['llama3.2', 'mistral', 'codellama', 'phi3', 'gemma2'],
  nvidia:    ['meta/llama-3.1-405b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'mistralai/mixtral-8x7b-instruct-v0.1'],
};

const TRIGGER_OPTIONS = [
  { value: 'rate_limit',    label: 'Rate Limit' },
  { value: 'error',         label: 'Error' },
  { value: 'cost_exceeded', label: 'Cost Exceeded' },
  { value: 'latency',       label: 'Latency' },
];

const selectClass =
  'bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#76b900] transition-colors';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LLMDrawer({ open, onClose }: Props) {
  const llm = useAgentStore((s) => s.llm);
  const setLLM = useAgentStore((s) => s.setLLM);

  const currentModels = MODELS[llm.provider] ?? [];

  function handleProviderSelect(id: string) {
    const firstModel = MODELS[id]?.[0] ?? '';
    setLLM({ provider: id, model: firstModel });
    // Sync first fallback row with main selection
    const chain = [...llm.fallbackChain];
    if (chain.length > 0) {
      chain[0] = { ...chain[0], provider: id, model: firstModel };
    } else {
      chain[0] = { provider: id, model: firstModel, trigger: 'rate_limit' };
    }
    setLLM({ fallbackChain: chain });
  }

  function handleFallbackChange(index: number, field: 'provider' | 'model' | 'trigger', value: string) {
    const chain = llm.fallbackChain.length >= 3
      ? [...llm.fallbackChain]
      : [
          llm.fallbackChain[0] ?? { provider: llm.provider, model: llm.model, trigger: 'rate_limit' },
          llm.fallbackChain[1] ?? { provider: '', model: '', trigger: 'rate_limit' },
          llm.fallbackChain[2] ?? { provider: '', model: '', trigger: 'rate_limit' },
        ];
    chain[index] = { ...chain[index], [field]: value };
    setLLM({ fallbackChain: chain });
  }

  const fallbackRows = [
    llm.fallbackChain[0] ?? { provider: llm.provider, model: llm.model, trigger: 'rate_limit' },
    llm.fallbackChain[1] ?? { provider: '', model: '', trigger: 'rate_limit' },
    llm.fallbackChain[2] ?? { provider: '', model: '', trigger: 'rate_limit' },
  ];

  const rowLabels = ['Primary', 'Fallback 1', 'Fallback 2'];

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-6"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">LLM / Brain</SheetTitle>
        </SheetHeader>

        {/* Provider Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((p) => {
              const selected = llm.provider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProviderSelect(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-[#76b900] bg-[#76b900]/10'
                      : 'border-[#1e2d3d] bg-[#1a1a2e] hover:border-[#76b900]/40'
                  }`}
                >
                  <span className="text-xl leading-none">{p.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Model</label>
          <select
            value={llm.model}
            onChange={(e) => setLLM({ model: e.target.value })}
            disabled={!llm.provider}
            className={`w-full ${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {!llm.provider && <option value="">Select a provider first</option>}
            {currentModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Temperature</label>
            <span className="text-sm text-[#76b900] font-mono">{llm.temperature.toFixed(2)}</span>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.01}
            value={[llm.temperature]}
            onValueChange={(val) => setLLM({ temperature: Array.isArray(val) ? (val as number[])[0] : (val as number) })}
            className="w-full"
          />
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Deterministic</span>
            <span className="text-xs text-gray-500">Creative</span>
          </div>
        </div>

        {/* Fallback Chain */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Fallback Chain</h3>
          {fallbackRows.map((row, i) => (
            <div key={i} className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{rowLabels[i]}</span>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={row.provider}
                  onChange={(e) => handleFallbackChange(i, 'provider', e.target.value)}
                  className={selectClass}
                >
                  <option value="">Provider</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={row.model}
                  onChange={(e) => handleFallbackChange(i, 'model', e.target.value)}
                  placeholder="Model"
                  className="bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                <select
                  value={row.trigger}
                  onChange={(e) => handleFallbackChange(i, 'trigger', e.target.value)}
                  className={selectClass}
                >
                  {TRIGGER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
