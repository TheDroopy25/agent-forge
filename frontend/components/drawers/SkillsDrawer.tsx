import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';
import type { AgentState } from '@/store/agentStore';

type SkillKey = keyof AgentState['skills'];

interface SkillDefinition {
  key: SkillKey;
  label: string;
  icon: string;
}

import Tip from "@/components/Tip";

const SKILL_TOOLTIPS: Record<string, string> = {
  discord: 'Connects to Discord — read/send messages, manage channels, react, create threads. Requires a bot token. Resource: persistent WebSocket connection (~5MB RAM).',
  github: 'Read issues, PRs, CI status, and commit code. Requires a GitHub token. Great for dev workflow agents. No significant resource impact.',
  googleWorkspace: 'Access Gmail, Calendar, Drive, Docs, Sheets. Requires Google OAuth. High utility for personal/business assistant agents. API rate limits apply.',
  weather: 'Fetch current conditions and forecasts via wttr.in or Open-Meteo. Free, no API key needed. Minimal resource use.',
  summarize: 'Extract and summarize text from URLs, PDFs, and local files. Adds 1-5 seconds per document. Token cost scales with document length.',
  figma: 'Access Figma design files, export assets, read design tokens. Requires Figma API key. Read-only by default.',
  clawHub: 'Browse and install agent skill packs from ClawHub.com. Extends what your agent can do without writing code. Minimal overhead.',
  webScraper: 'Scrape and extract content from any website. Uses Playwright — ~200MB RAM per session, 5-30 seconds per page. Use sparingly.',
  cronScheduler: 'Schedule recurring tasks (send reports, check inboxes, post content). Runs in background — minimal resource use when idle.',
  notion: 'Read and write Notion pages, databases, and blocks. Requires Notion integration token. Useful for knowledge base agents.',
  slack: 'Send and receive Slack messages, manage channels. Requires a Slack app token. ~5MB RAM for WebSocket connection.',
  airtable: 'Query and update Airtable bases and tables. Requires Airtable API key. Good for structured data workflows.',
};

const SKILLS: SkillDefinition[] = [
  { key: 'discord',         label: 'Discord',          icon: '💬' },
  { key: 'github',          label: 'GitHub',            icon: '🐙' },
  { key: 'googleWorkspace', label: 'Google Workspace',  icon: '📊' },
  { key: 'weather',         label: 'Weather',           icon: '🌤️' },
  { key: 'summarize',       label: 'Summarize',         icon: '📝' },
  { key: 'figma',           label: 'Figma',             icon: '🎨' },
  { key: 'clawHub',         label: 'ClawHub',           icon: '🐾' },
  { key: 'webScraper',      label: 'Web Scraper',       icon: '🕷️' },
  { key: 'cronScheduler',   label: 'Cron/Scheduler',    icon: '⏰' },
  { key: 'notion',          label: 'Notion',            icon: '📋' },
  { key: 'slack',           label: 'Slack',             icon: '💼' },
  { key: 'airtable',        label: 'Airtable',          icon: '🗃️' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SkillsDrawer({ open, onClose }: Props) {
  const skills = useAgentStore((s) => s.skills);
  const setSkills = useAgentStore((s) => s.setSkills);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-4"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Skills ⚡</SheetTitle>
          <p className="text-sm text-gray-400">Specialized capabilities for your agent</p>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Skills are pre-built integrations for popular apps. Toggle on Discord if your agent will live in Discord, GitHub for code work, Google Workspace for email and calendar, and so on.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SKILLS.map(({ key, label, icon }) => (
            <div
              key={key}
              className={`border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${
                skills[key]
                  ? 'border-[#76b900] bg-[#76b900]/5'
                  : 'border-[#1e2d3d] bg-[#1a1a2e]'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs font-medium text-white text-center leading-tight">{label}</p>
                <Tip text={SKILL_TOOLTIPS[key]} />
              </div>
              <Switch
                checked={skills[key]}
                onCheckedChange={(checked) => setSkills({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
