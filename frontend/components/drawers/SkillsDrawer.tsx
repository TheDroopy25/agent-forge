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
              <p className="text-xs font-medium text-white text-center leading-tight">{label}</p>
              <Switch
                checked={skills[key]}
                onCheckedChange={(checked) => setSkills({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
