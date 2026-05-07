'use client'

import Link from 'next/link'
import { PLATFORMS } from '@/lib/constants/platforms'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import type { Agent } from '@/lib/agents'
import { useConnections } from '@/lib/hooks/use-connections'

interface AgentPlatformConfigProps {
  agent: Agent
}

export function AgentPlatformConfig({ agent }: AgentPlatformConfigProps) {
  const platform = PLATFORMS[agent.platform]
  const { connections, isLoading } = useConnections()
  const isConnected = !isLoading && connections.some((c) => c.platform === agent.platform)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{agent.name} Agent · Platform</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This agent is bound to one integration: {platform.name}. Manage the connection and review the playbook the agent uses by default.
        </p>
      </div>

      {/* Connection status card */}
      <div
        className="relative overflow-hidden rounded-2xl border p-5"
        style={{
          background: 'var(--card)',
          borderColor: isConnected ? '#10B98155' : 'var(--border)',
        }}
      >
        <div className="flex items-center gap-4">
          <PlatformIcon platform={agent.platform} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">{platform.name}</p>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? `${agent.name} Agent is live and can publish through your account.`
                : `Connect ${platform.name} to let this agent publish on your behalf.`}
            </p>
          </div>
          <Link
            href="/dashboard/accounts"
            className="rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: agent.gradient }}
          >
            {isConnected ? 'Manage' : 'Connect'}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
          <Stat label="Char limit" value={platform.maxLength.toLocaleString()} />
          <Stat label="Optimal length" value={platform.optimalLength.toLocaleString()} />
          <Stat
            label="Hashtags"
            value={platform.hashtagLimit === 0 ? 'n/a' : `≤ ${platform.hashtagLimit}`}
          />
        </div>
      </div>

      {/* Default playbook */}
      <Section title="Default Playbook" subtitle="What this agent does out of the box. Override anything in Settings.">
        <ul className="space-y-2">
          {agent.capabilities.map((cap) => (
            <li
              key={cap}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5"
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: agent.color === '#000000' ? '#EA580C' : agent.color }}
              />
              <span className="text-sm text-foreground/85">{cap}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Algorithm tips */}
      <Section title={`${platform.shortName} Algorithm Tips`} subtitle="Default rules of thumb the agent applies when drafting.">
        <div className="space-y-2">
          {platform.algorithmTips.map((tip, i) => (
            <div
              key={i}
              className="flex gap-2.5 rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2.5"
            >
              <span className="text-sm shrink-0">⚡</span>
              <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Supported formats */}
      <Section title="Supported Content Formats">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {platform.contentFormats.map((fmt) => (
            <div
              key={fmt}
              className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2"
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: agent.color === '#000000' ? '#EA580C' : agent.color }}
              />
              <span className="text-xs text-foreground/80">{fmt}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
