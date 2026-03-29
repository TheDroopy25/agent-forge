'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';

const VECTOR_STORES = ['chromadb', 'pinecone', 'weaviate', 'pgvector'];

const inputClass =
  'w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors';

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

        {/* Short-term Memory */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Short-term Memory</p>
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
                <span className="text-xs text-gray-400">Turn window</span>
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
              <p className="text-sm font-medium text-white">Long-term Memory</p>
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
                    {store}
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
              <p className="text-sm font-medium text-white">Episodic Memory</p>
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
              <p className="text-sm font-medium text-white">Working Memory</p>
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

        {/* External Database */}
        <div className="border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">External Database</p>
              <p className="text-xs text-gray-500">Connect external DB</p>
            </div>
            <Switch
              checked={memory.externalDb.enabled}
              onCheckedChange={(checked) =>
                setMemory({ externalDb: { ...memory.externalDb, enabled: checked } })
              }
            />
          </div>
          {memory.externalDb.enabled && (
            <div className="px-4 pb-4 border-t border-[#1e2d3d] pt-3">
              <input
                type="password"
                value={memory.externalDb.connectionString}
                onChange={(e) =>
                  setMemory({ externalDb: { ...memory.externalDb, connectionString: e.target.value } })
                }
                placeholder="postgresql://user:pass@host:5432/db"
                className={inputClass}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
