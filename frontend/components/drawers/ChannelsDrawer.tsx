'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAgentStore } from '@/store/agentStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChannelsDrawer({ open, onClose }: Props) {
  const channels = useAgentStore((s) => s.channels);
  const setChannels = useAgentStore((s) => s.setChannels);

  const enabledChannelOptions: Array<{ value: string; label: string }> = [
    ...(channels.discord.enabled ? [{ value: 'discord', label: 'Discord' }] : []),
    ...(channels.telegram.enabled ? [{ value: 'telegram', label: 'Telegram' }] : []),
    ...(channels.restApi.enabled ? [{ value: 'restapi', label: 'REST API' }] : []),
    ...(channels.sms.enabled ? [{ value: 'sms', label: 'SMS/Twilio' }] : []),
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

        <div className="space-y-3">

          {/* Discord */}
          <div className={`border rounded-lg p-4 space-y-3 transition-all ${channels.discord.enabled ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Discord</span>
              <Switch
                checked={channels.discord.enabled}
                onCheckedChange={(checked) =>
                  setChannels({ discord: { ...channels.discord, enabled: checked } })
                }
              />
            </div>
            {channels.discord.enabled && (
              <div className="space-y-2">
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
              </div>
            )}
          </div>

          {/* Telegram */}
          <div className={`border rounded-lg p-4 space-y-3 transition-all ${channels.telegram.enabled ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Telegram</span>
              <Switch
                checked={channels.telegram.enabled}
                onCheckedChange={(checked) =>
                  setChannels({ telegram: { ...channels.telegram, enabled: checked } })
                }
              />
            </div>
            {channels.telegram.enabled && (
              <input
                type="password"
                value={channels.telegram.botToken}
                onChange={(e) =>
                  setChannels({ telegram: { ...channels.telegram, botToken: e.target.value } })
                }
                placeholder="Bot Token"
                className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
              />
            )}
          </div>

          {/* WhatsApp — disabled, coming soon */}
          <div className="border border-[#1e2d3d] bg-[#1a1a2e] rounded-lg p-4 opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">WhatsApp</span>
                <span className="text-xs bg-amber-900/40 border border-amber-500 text-amber-300 rounded px-2 py-0.5">
                  Coming Soon
                </span>
              </div>
              <Switch checked={false} disabled onCheckedChange={() => {}} />
            </div>
          </div>

          {/* REST API */}
          <div className={`border rounded-lg p-4 space-y-3 transition-all ${channels.restApi.enabled ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">REST API</span>
              <Switch
                checked={channels.restApi.enabled}
                onCheckedChange={(checked) =>
                  setChannels({ restApi: { ...channels.restApi, enabled: checked } })
                }
              />
            </div>
            {channels.restApi.enabled && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={channels.restApi.webhookUrl}
                  onChange={(e) =>
                    setChannels({ restApi: { ...channels.restApi, webhookUrl: e.target.value } })
                  }
                  placeholder="Webhook URL"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                <input
                  type="password"
                  value={channels.restApi.secret}
                  onChange={(e) =>
                    setChannels({ restApi: { ...channels.restApi, secret: e.target.value } })
                  }
                  placeholder="Secret"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
              </div>
            )}
          </div>

          {/* SMS/Twilio */}
          <div className={`border rounded-lg p-4 space-y-3 transition-all ${channels.sms.enabled ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">SMS / Twilio</span>
              <Switch
                checked={channels.sms.enabled}
                onCheckedChange={(checked) =>
                  setChannels({ sms: { ...channels.sms, enabled: checked } })
                }
              />
            </div>
            {channels.sms.enabled && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={channels.sms.accountSid}
                  onChange={(e) =>
                    setChannels({ sms: { ...channels.sms, accountSid: e.target.value } })
                  }
                  placeholder="Account SID"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
                <input
                  type="password"
                  value={channels.sms.authToken}
                  onChange={(e) =>
                    setChannels({ sms: { ...channels.sms, authToken: e.target.value } })
                  }
                  placeholder="Auth Token"
                  className="w-full bg-[#12121a] border border-[#1e2d3d] rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#76b900] transition-colors"
                />
              </div>
            )}
          </div>

          {/* CLI Only */}
          <div className={`border rounded-lg p-4 transition-all ${channels.cliOnly ? 'border-[#76b900]/60 bg-[#76b900]/5' : 'border-[#1e2d3d] bg-[#1a1a2e]'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white">CLI Only</span>
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Primary Channel
            </p>
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
      </SheetContent>
    </Sheet>
  );
}
