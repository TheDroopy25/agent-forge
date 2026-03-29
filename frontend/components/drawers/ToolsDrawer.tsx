'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';
import type { AgentState } from '@/store/agentStore';

type ToolKey = keyof Omit<AgentState['tools'], 'customMcpUrl'>;

interface ToolDefinition {
  key: ToolKey;
  label: string;
  description: string;
}

const TOOLS: ToolDefinition[] = [
  { key: 'webSearch',      label: 'Web Search',       description: 'Search the internet' },
  { key: 'codeExecution',  label: 'Code Execution',   description: 'Run Python/JS sandboxed' },
  { key: 'fileSystem',     label: 'File System',      description: 'Read/write local files' },
  { key: 'browserControl', label: 'Browser Control',  description: 'Control a browser' },
  { key: 'terminal',       label: 'Terminal/CLI',     description: 'Execute shell commands' },
  { key: 'imageAnalysis',  label: 'Image Analysis',   description: 'Analyze images with vision' },
  { key: 'pdfReader',      label: 'PDF Reader',       description: 'Extract text from PDFs' },
  { key: 'calendar',       label: 'Calendar',         description: 'Read/write calendar events' },
  { key: 'email',          label: 'Email',            description: 'Send and read emails' },
  { key: 'customMcp',      label: 'Custom MCP',       description: 'Custom MCP server' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ToolsDrawer({ open, onClose }: Props) {
  const tools = useAgentStore((s) => s.tools);
  const setTools = useAgentStore((s) => s.setTools);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] text-white border-[#1e2d3d] overflow-y-auto p-6 space-y-4"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Tools</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(({ key, label, description }) => (
            <div
              key={key}
              className={`border rounded-lg p-3 transition-all ${
                tools[key]
                  ? 'border-[#76b900]/60 bg-[#76b900]/5'
                  : 'border-[#1e2d3d] bg-[#1a1a2e]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white leading-tight">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{description}</p>
                </div>
                <Switch
                  checked={tools[key]}
                  onCheckedChange={(checked) => setTools({ [key]: checked })}
                  className="flex-shrink-0 mt-0.5"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom MCP URL — full width below grid when enabled */}
        {tools.customMcp && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              MCP Server URL
            </label>
            <input
              type="url"
              value={tools.customMcpUrl}
              onChange={(e) => setTools({ customMcpUrl: e.target.value })}
              placeholder="https://your-mcp-server.com"
              className="w-full bg-[#1a1a2e] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
