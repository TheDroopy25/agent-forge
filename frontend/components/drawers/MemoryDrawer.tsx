import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';

const VECTOR_STORES = ['chromadb', 'pinecone', 'weaviate', 'pgvector'];

const VECTOR_STORE_TOOLTIPS: Record<string, string> = {
  chromadb: 'Free, runs locally on your machine. Zero cost, some setup. Best for personal use or small teams.',
  pinecone: 'Cloud-hosted vector DB. Free tier: 1 index, 100K vectors. Scales well. Requires API key. Best for production deployments.',
  weaviate: 'Open-source, can self-host or use cloud. Supports multi-modal (text + images). More complex setup than ChromaDB.',
  pgvector: 'PostgreSQL extension — store vectors in your existing Postgres DB. Best if you already run Postgres. Requires database admin access.',
};

const inputClass =
  'w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors';

function Tip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
      <div className="absolute right-0 bottom-full z-50 hidden group-hover:block w-72 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MemoryDrawer({ open, onClose }: Props) {
  const memory = useAgentStore((s) => s.memory);
  const setMemory = useAgentStore((s) => s.setMemory);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-2"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Memory</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Memory lets your agent remember things between conversations. Short-term memory keeps recent messages in context. Long-term memory stores facts forever. Without memory, every chat starts fresh.
          </p>
        </div>

        {/* Short-term Memory */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Short-term Memory</p>
                <Tip text="Keeps the last N conversation turns in context. More turns = better continuity but higher token usage per request. Each turn costs ~200-500 tokens. Performance: minimal. Resource: +tokens per request. Recommended: 10-20 turns." />
              </div>
              <p className="text-xs text-gray-500">Last N turns in context</p>
            </div>
            <Switch
              checked={memory.shortTerm.enabled}
              onCheckedChange={(checked) =>
                setMemory({ shortTerm: { ...memory.shortTerm, enabled: checked } })
              }
            />
          </div>
          {memory.shortTerm.enabled && (
            <div className="px-4 pb-4 space-y-2 border-t border-[#1e2d3d]">
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Turn window</span>
                  <Tip text="Number of previous messages included in every request. At 50 turns, you may hit context limits on smaller models. Start at 10 and increase if conversations feel disjointed." />
                </div>
                <span className="text-sm text-[#76b900] font-mono">{memory.shortTerm.turns} turns</span>
              </div>
              <Slider
                min={1}
                max={50}
                step={1}
                value={[memory.shortTerm.turns]}
                onValueChange={(val) =>
                  setMemory({ shortTerm: { ...memory.shortTerm, turns: Array.isArray(val) ? (val as number[])[0] : (val as number) } })
                }
                className="w-full"
              />
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">1 turn</span>
                <span className="text-xs text-gray-500">50 turns</span>
              </div>
            </div>
          )}
        </div>

        {/* Long-term Memory */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Long-term Memory</p>
                <Tip text="Semantic search over past conversations and documents. Agent can recall relevant info from months ago. Requires a vector database (ChromaDB is free/local). Performance: adds 100-300ms per query for retrieval. Resource: moderate CPU + disk for embeddings." />
              </div>
              <p className="text-xs text-gray-500">Persistent vector storage</p>
            </div>
            <Switch
              checked={memory.longTerm.enabled}
              onCheckedChange={(checked) =>
                setMemory({ longTerm: { ...memory.longTerm, enabled: checked } })
              }
            />
          </div>
          {memory.longTerm.enabled && (
            <div className="px-4 pb-4 border-t border-[#1e2d3d]">
              <p className="text-xs text-gray-400 pt-3 mb-2">Vector Store</p>
              <div className="grid grid-cols-2 gap-2">
                {VECTOR_STORES.map((store) => (
                  <button
                    key={store}
                    onClick={() =>
                      setMemory({ longTerm: { ...memory.longTerm, vectorStore: store } })
                    }
                    className={`px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                      memory.longTerm.vectorStore === store
                        ? 'border-[#76b900] bg-[#76b900]/10 text-[#76b900]'
                        : 'border-[#1e2d3d] bg-[#1a1a2e] text-gray-300 hover:border-[#76b900]/40'
                    }`}
                  >
                    <span className="flex items-center justify-between w-full gap-1">
                      <span>{store}</span>
                      <div className="group relative" onClick={(e) => e.stopPropagation()}>
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#1e2d3d] text-gray-400 text-xs cursor-help select-none">?</span>
                        <div className="absolute right-0 top-5 z-50 hidden group-hover:block w-64 rounded-lg bg-[#0e0e1a] border border-[#1e2d3d] p-3 shadow-xl">
                          <p className="text-xs text-gray-300 leading-relaxed">{VECTOR_STORE_TOOLTIPS[store]}</p>
                        </div>
                      </div>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Episodic Memory */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Episodic Memory</p>
                <Tip text="Agent writes daily markdown journals — exactly like a human keeping notes. Low overhead, very readable. Zero API cost. Best for long-running personal assistants. Performance: negligible. Resource: minimal disk space." />
              </div>
              <p className="text-xs text-gray-500">Log of past interactions</p>
            </div>
            <Switch
              checked={memory.episodic.enabled}
              onCheckedChange={(checked) =>
                setMemory({ episodic: { ...memory.episodic, enabled: checked } })
              }
            />
          </div>
          {memory.episodic.enabled && (
            <div className="px-4 pb-4 border-t border-[#1e2d3d] pt-3">
              <input
                type="text"
                value={memory.episodic.filePath}
                onChange={(e) =>
                  setMemory({ episodic: { ...memory.episodic, filePath: e.target.value } })
                }
                placeholder="~/.openclaw/memory/episodic.json"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Working Memory */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Working Memory</p>
                <Tip text="A scratch file the agent writes to during tasks. Survives context resets — agent can pick up where it left off. Critical for multi-step tasks. Performance: negligible. Resource: minimal disk." />
              </div>
              <p className="text-xs text-gray-500">Scratchpad for current task</p>
            </div>
            <Switch
              checked={memory.workingMemory.enabled}
              onCheckedChange={(checked) =>
                setMemory({ workingMemory: { ...memory.workingMemory, enabled: checked } })
              }
            />
          </div>
          {memory.workingMemory.enabled && (
            <div className="px-4 pb-4 border-t border-[#1e2d3d] pt-3">
              <input
                type="text"
                value={memory.workingMemory.filePath}
                onChange={(e) =>
                  setMemory({ workingMemory: { ...memory.workingMemory, filePath: e.target.value } })
                }
                placeholder="~/.openclaw/memory/working.json"
                className={inputClass}
              />
            </div>
          )}
        </div>


      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
