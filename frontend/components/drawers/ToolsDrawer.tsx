import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';
import type { AgentState } from '@/store/agentStore';

type ToolKey = keyof Omit<AgentState['tools'], 'customMcpUrl'>;

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

interface ToolDefinition {
  key: ToolKey;
  label: string;
  description: string;
  tooltip: string;
}

const TOOLS: ToolDefinition[] = [
  { key: 'webSearch',      label: 'Web Search',       description: 'Search the internet',          tooltip: 'Agent can search the internet in real-time. Adds 1-3 seconds per search. Costs vary by search API (Brave: $3/1000 searches free tier). Essential for up-to-date information.' },
  { key: 'codeExecution',  label: 'Code Execution',   description: 'Run Python/JS sandboxed',       tooltip: 'Agent can write and run Python or JavaScript code in a sandbox. Adds 2-10 seconds per execution. Requires a sandboxed runtime. High utility, moderate security risk if not sandboxed properly.' },
  { key: 'fileSystem',     label: 'File System',      description: 'Read/write local files',        tooltip: 'Agent can read and write files on your machine. No latency cost. High power — be careful with write access on sensitive directories.' },
  { key: 'browserControl', label: 'Browser Control',  description: 'Control a browser',             tooltip: 'Agent can automate web browsers (Playwright). Very slow — 5-30 seconds per page. High resource use: ~200MB RAM per browser session. Use only when no API exists.' },
  { key: 'terminal',       label: 'Terminal/CLI',     description: 'Execute shell commands',        tooltip: 'Agent can run shell commands. Instant execution. Highest risk tool — only enable if you trust the agent and have guardrails set. No API cost.' },
  { key: 'imageAnalysis',  label: 'Image Analysis',   description: 'Analyze images with vision',    tooltip: 'Agent can describe and analyze images using a vision model. Adds ~1 second per image. Costs ~2-5x a text request depending on model. Required for any visual task.' },
  { key: 'pdfReader',      label: 'PDF Reader',       description: 'Extract text from PDFs',        tooltip: 'Agent can extract and read text from PDF files. Fast (1-2 seconds). Free — processed locally. Essential for document workflows.' },
  { key: 'calendar',       label: 'Calendar',         description: 'Read/write calendar events',    tooltip: 'Agent can read and create calendar events. Requires Google/Outlook OAuth. Near-instant for reads. Enable only if you want the agent managing your schedule.' },
  { key: 'email',          label: 'Email',            description: 'Send and read emails',          tooltip: 'Agent can send and read emails. Requires OAuth or SMTP credentials. Sending is instant; reading inbox adds ~0.5 seconds. High impact capability — use guardrails.' },
  { key: 'customMcp',      label: 'Custom MCP',       description: 'Custom MCP server',             tooltip: 'Connect any MCP (Model Context Protocol) server to add custom tools. Performance depends entirely on the MCP server. Supports any tool that follows the open MCP standard.' },
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

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Tools are actions your agent can take — like searching the web, reading files, or sending emails. Toggle on what you want it to be able to do. More tools = more powerful, but also more to manage.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(({ key, label, description, tooltip }) => (
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
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white leading-tight">{label}</p>
                    <Tip text={tooltip} />
                  </div>
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
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
