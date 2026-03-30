import DrawerNextButton from '@/components/DrawerNextButton';
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';
import Tip from "@/components/Tip";
import { ChevronDown, ChevronUp } from 'lucide-react';

const DISCORD_STEPS = [
  {
    title: 'Create a Discord account',
    body: <>Go to <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76b900' }}>discord.com</span> and sign up if you do not have an account.</>,
  },
  {
    title: 'Create a server',
    body: <>In Discord, click the <strong style={{ color: '#fff' }}>"+"</strong> icon in the left sidebar → <strong style={{ color: '#fff' }}>"Create My Own"</strong> → give it a name.</>,
  },
  {
    title: 'Enable Developer Mode',
    body: <>Go to <strong style={{ color: '#fff' }}>Settings</strong> (bottom-left gear) → <strong style={{ color: '#fff' }}>App Settings → Advanced → Developer Mode ON</strong>. You&apos;ll need this to copy IDs.</>,
  },
  {
    title: 'Create an Application',
    body: <>Go to <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76b900' }}>discord.com/developers/applications</span> → click <strong style={{ color: '#fff' }}>"New Application"</strong> → name it.</>,
  },
  {
    title: 'Create a Bot & copy the Token',
    body: <><strong style={{ color: '#fff' }}>Bot</strong> tab → <strong style={{ color: '#fff' }}>"Add Bot"</strong> → confirm → <strong style={{ color: '#fff' }}>"Reset Token"</strong> → copy it → paste as Bot Token.</>,
  },
  {
    title: 'Add the bot to your server',
    body: <><strong style={{ color: '#fff' }}>OAuth2 → URL Generator</strong> → check <strong style={{ color: '#fff' }}>"bot"</strong> scope + <strong style={{ color: '#fff' }}>"Send Messages"</strong> permission → copy URL → open in browser → pick your server → Authorize.</>,
  },
  {
    title: 'Create or pick a text channel',
    body: <>In your server, click <strong style={{ color: '#fff' }}>"+"</strong> next to Text Channels to create one (e.g. <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76b900' }}>#agent-chat</span>), or use an existing one.</>,
  },
  {
    title: 'Copy the Channel ID',
    body: <>Right-click the channel name → <strong style={{ color: '#fff' }}>"Copy Channel ID"</strong> → paste as Channel ID below.</>,
  },
  {
    title: 'Copy your Server (Guild) ID',
    body: <>Right-click your server name in the sidebar → <strong style={{ color: '#fff' }}>"Copy Server ID"</strong> → paste as Guild ID below.</>,
  },
  {
    title: 'Copy your User ID',
    body: <>Right-click your own username anywhere in Discord → <strong style={{ color: '#fff' }}>"Copy User ID"</strong> → paste as Owner User ID below. The agent uses this to know who the owner is.</>,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChannelsDrawer({ open, onClose }: Props) {
  const channels = useAgentStore((s) => s.channels);
  const setChannels = useAgentStore((s) => s.setChannels);
  const [guideOpen, setGuideOpen] = useState(false);

  const enabledChannelOptions: Array<{ value: string; label: string }> = [
    ...(channels.discord.enabled ? [{ value: 'discord', label: 'Discord' }] : []),
    { value: 'cli', label: 'CLI Only' },
  ];

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] bg-[#12121a] border-[#1e2d3d] text-white overflow-y-auto p-6 space-y-4"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg font-semibold">Channels</SheetTitle>
        </SheetHeader>

        {/* InfoBox */}
        <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>💡</span>
          <p style={{ color: '#8b9cb3', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
            Channels are how people talk to your agent. Discord is great for communities. REST API works if you&apos;re embedding it in a website or app. Enable at least one channel so people can reach it.
          </p>
        </div>

        <div className="space-y-3">

          {/* Discord */}
          <div className={`border rounded-lg p-4 space-y-3 transition-all ${channels.discord.enabled ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">Discord</span>
                <Tip text="Connect to Discord as a bot. Persistent WebSocket connection — always listening. ~5-10MB RAM. Users interact via @mention or DM. Requires creating a Discord application and bot token." />
              </div>
              <Switch
                checked={channels.discord.enabled}
                onCheckedChange={(checked) =>
                  setChannels({ discord: { ...channels.discord, enabled: checked } })
                }
              />
            </div>
            {channels.discord.enabled && (
              <div className="space-y-2">
                {/* Discord setup guide */}
                <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setGuideOpen((v) => !v)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b9cb3', letterSpacing: '0.02em' }}>New to Discord? Setup guide</span>
                    {guideOpen
                      ? <ChevronUp size={14} style={{ color: '#8b9cb3', flexShrink: 0 }} />
                      : <ChevronDown size={14} style={{ color: '#8b9cb3', flexShrink: 0 }} />}
                  </button>
                  {guideOpen && (
                    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {DISCORD_STEPS.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#76b900', color: '#000', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>{i + 1}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#fff', lineHeight: '1.4' }}>{step.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#8b9cb3', lineHeight: '1.5' }}>{step.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Channel ID</label>
                  <input
                    type="text"
                    value={channels.discord.channelId}
                    onChange={(e) =>
                      setChannels({ discord: { ...channels.discord, channelId: e.target.value } })
                    }
                    placeholder="Channel ID (e.g. 123456789012345678)"
                    className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Owner User ID</label>
                  <input
                    type="text"
                    value={channels.discord.ownerId}
                    onChange={(e) =>
                      setChannels({ discord: { ...channels.discord, ownerId: e.target.value } })
                    }
                    placeholder="Your Discord User ID"
                    className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                  />
                </div>
                <input
                  type="password"
                  value={channels.discord.token}
                  onChange={(e) =>
                    setChannels({ discord: { ...channels.discord, token: e.target.value } })
                  }
                  placeholder="Bot Token"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                <input
                  type="text"
                  value={channels.discord.guildId}
                  onChange={(e) =>
                    setChannels({ discord: { ...channels.discord, guildId: e.target.value } })
                  }
                  placeholder="Guild ID"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                {/* Talking to your agent info box */}
                <div style={{ background: '#0d1929', border: '1px solid #1e2d3d', borderRadius: '8px', padding: '12px', color: '#8b9cb3', fontSize: '13px', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#8b9cb3' }}>💬 Talking to your agent</p>
                  <p style={{ margin: '0 0 4px' }}><strong style={{ color: '#c8d8e8' }}>DM the bot:</strong> Search the bot&apos;s name in Discord&apos;s search bar → open a DM → type your message. Best for private 1-on-1 interaction.</p>
                  <p style={{ margin: '0 0 4px' }}><strong style={{ color: '#c8d8e8' }}>Channel:</strong> Type <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76b900' }}>@BotName</span> in your <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#76b900' }}>#agent-chat</span> channel to mention it. Anyone in the channel can interact.</p>
                  <p style={{ margin: 0 }}><strong style={{ color: '#c8d8e8' }}>Who can talk to it:</strong> By default, anyone who can see the channel. Set guardrails if you want to restrict access.</p>
                </div>
              </div>
            )}
          </div>

          {/* CLI Only */}
          <div className={`border rounded-lg p-4 transition-all ${channels.cliOnly ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">CLI Only</span>
                  <Tip text="Agent runs in a terminal only — no external connections. Zero overhead. Best for local productivity tools and testing." />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Terminal interface only</p>
              </div>
              <Switch
                checked={channels.cliOnly}
                onCheckedChange={(checked) => setChannels({ cliOnly: checked })}
              />
            </div>
          </div>
        </div>

        {/* Primary Channel */}
        <div className="space-y-3">
          <div className="border-t border-[#1e2d3d] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Primary Channel
              </p>
              <Tip text="Where the agent defaults to for proactive messages and alerts. Other channels still work but this is the main surface." />
            </div>
            <div className="space-y-2">
              {enabledChannelOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                      channels.primaryChannel === value
                        ? 'border-[#76b900] bg-[#76b900]'
                        : 'border-[#1e2d3d] bg-transparent group-hover:border-[#76b900]/50'
                    }`}
                    onClick={() => setChannels({ primaryChannel: value })}
                  />
                  <span
                    className="text-sm text-gray-300"
                    onClick={() => setChannels({ primaryChannel: value })}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      <DrawerNextButton />
      </SheetContent>
    </Sheet>
  );
}
