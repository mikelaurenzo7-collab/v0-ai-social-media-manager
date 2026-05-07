'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getAgentById } from '@/lib/agents'
import { cn } from '@/lib/utils'
import { AgentChat } from '@/components/agents/agent-chat'
import { WorkflowComposer } from '@/components/agents/workflow-composer'
import { AgentSettings } from '@/components/agents/agent-settings'
import { AgentPlatformConfig } from '@/components/agents/platform-config'
import { AgentCustomize } from '@/components/agents/agent-customize'
import { AgentPermissions } from '@/components/agents/agent-permissions'
import { PremiumGate } from '@/components/agents/premium-gate'

// ── AutoPilot mini-status widget ─────────────────────────────────────────────

const AUTOPILOT_DEFAULTS: Record<string, { platform: string; schedule: string; postsWeek: number; active: boolean }> = {
  x:        { platform: 'X (Twitter)', schedule: 'Mon–Fri · 8:30 AM', postsWeek: 5, active: true },
  meta:     { platform: 'Instagram & Facebook', schedule: 'Mon, Wed, Fri · 12 PM', postsWeek: 6, active: true },
  linkedin: { platform: 'LinkedIn', schedule: 'Tue–Thu · 9 AM', postsWeek: 3, active: true },
  tiktok:   { platform: 'TikTok', schedule: 'Mon, Wed, Fri · 5 PM', postsWeek: 4, active: false },
  gmail:    { platform: 'Gmail', schedule: 'On demand · approval-gated', postsWeek: 0, active: false },
  outlook:  { platform: 'Outlook', schedule: 'On demand · approval-gated', postsWeek: 0, active: false },
}

function AutoPilotMiniStatus({ agentId }: { agentId: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const cfg = AUTOPILOT_DEFAULTS[agentId]
  if (!cfg) {
    return (
      <Link
        href="/dashboard/autopilot"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-white/70 transition-colors hover:text-white"
        style={{ background: 'oklch(0.185 0.016 48)', border: '1px dashed oklch(0.3 0.012 48)' }}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Automation
      </Link>
    )
  }

  return (
    <div className="rounded-lg p-2.5 space-y-2" style={{ background: 'oklch(0.185 0.016 48)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {mounted && cfg.active ? (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-white/20" />
          )}
          <span className="text-[10px] font-semibold" style={{ color: cfg.active ? '#4ADE80' : 'oklch(0.45 0.010 52)' }}>
            {cfg.active ? 'Running' : 'Paused'}
          </span>
        </div>
        <span className="text-[9px] text-white/40">{cfg.postsWeek}/wk</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-white/80">{cfg.platform}</p>
        <p className="text-[9px] text-white/40 mt-0.5">{cfg.schedule}</p>
      </div>
      <Link
        href="/dashboard/autopilot"
        className="flex w-full items-center justify-center gap-1 rounded-md py-1 text-[10px] font-bold transition-opacity hover:opacity-80"
        style={{ background: 'linear-gradient(135deg, #EA580C22 0%, #DB277722 100%)', color: '#EA580C', border: '1px solid oklch(0.652 0.214 36 / 0.25)' }}
      >
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        View Auto-Pilot
      </Link>
    </div>
  )
}

const TABS = ['Chat', 'Workflows', 'Customize', 'Permissions', 'Memory', 'Platform'] as const
type Tab = (typeof TABS)[number]

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  Chat: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  Workflows: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  ),
  Customize: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 14.25v4.875A2.625 2.625 0 0116.875 21.75H5.625A2.625 2.625 0 013 19.125V7.875a2.625 2.625 0 012.625-2.625H10.5" />
    </svg>
  ),
  Permissions: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  Memory: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  Platform: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
}

const QUICK_ACTIONS: { label: string; tab: Tab; icon: React.ReactNode }[] = [
  {
    label: 'New Chat',
    tab: 'Chat',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: 'Customize',
    tab: 'Customize',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
  },
  {
    label: 'Permissions',
    tab: 'Permissions',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M3.75 12a8.25 8.25 0 1116.5 0 8.25 8.25 0 01-16.5 0z" />
      </svg>
    ),
  },
  {
    label: 'Workflows',
    tab: 'Workflows',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
]

const MOCK_STATS: Record<string, { chats: number; workflows: number; memories: number; rating: string }> = {
  x:        { chats: 31, workflows: 5,  memories: 12, rating: '4.8' },
  meta:     { chats: 27, workflows: 6,  memories: 18, rating: '4.9' },
  linkedin: { chats: 24, workflows: 8,  memories: 14, rating: '4.9' },
  tiktok:   { chats: 18, workflows: 4,  memories: 9,  rating: '4.8' },
  gmail:    { chats: 12, workflows: 4,  memories: 7,  rating: '4.9' },
  outlook:  { chats: 9,  workflows: 3,  memories: 5,  rating: '4.8' },
}
const DEFAULT_STATS = { chats: 0, workflows: 0, memories: 0, rating: '—' }

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentById(id)
  const searchParams = useSearchParams()

  // Honor ?tab=Platform / ?tab=Customize / etc. from inbound deep-links so
  // shortcuts like the gear icon on /dashboard/agents land users on the
  // right tab instead of always defaulting to Chat.
  const initialTab: Tab = (() => {
    const fromQuery = searchParams.get('tab')
    if (!fromQuery) return 'Chat'
    const match = TABS.find((t) => t.toLowerCase() === fromQuery.toLowerCase())
    return match ?? 'Chat'
  })()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const stats = MOCK_STATS[agent.id] ?? DEFAULT_STATS

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left identity rail ─────────────────────────────────────── */}
      <div
        className="flex w-64 shrink-0 flex-col overflow-y-auto"
        style={{ background: 'oklch(0.135 0.018 48)', borderRight: '1px solid oklch(0.22 0.016 48)' }}
      >
        {/* Back button */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/dashboard/agents"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/90 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            All Agents
          </Link>
        </div>

        {/* Agent identity */}
        <div className="px-5 pb-5 pt-3">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                {agent.avatar}
              </div>
              {/* Online indicator */}
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
                style={{ background: '#22C55E', borderColor: 'oklch(0.135 0.018 48)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-base font-bold text-white">{agent.name}</h2>
                {agent.premium && (
                  <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                    Pro
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs" style={{ color: '#EA580C' }}>{agent.role}</p>
              <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-white/40">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                Online · Ready
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/50 leading-relaxed">{agent.description}</p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }} />

        {/* Capabilities */}
        <div className="px-4 py-4">
          <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.4 0.010 52)' }}>
            Specialties
          </p>
          <div className="flex flex-col gap-1.5">
            {agent.capabilities.map((cap) => (
              <div
                key={cap}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                style={{ background: 'oklch(0.185 0.016 48)' }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: '#EA580C' }}
                />
                <span className="text-xs font-medium text-white/70">{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }} />

        {/* Quick stats */}
        <div className="px-4 py-4">
          <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.4 0.010 52)' }}>
            Stats
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Chats', value: stats.chats },
              { label: 'Workflows', value: stats.workflows },
              { label: 'Memories', value: stats.memories },
              { label: 'Rating', value: stats.rating },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg px-2.5 py-2 text-center"
                style={{ background: 'oklch(0.185 0.016 48)' }}
              >
                <p className="text-base font-black text-white">{stat.value}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }} />

        {/* Quick actions */}
        <div className="px-4 py-4 flex-1">
          <p className="mb-2.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.4 0.010 52)' }}>
            Quick Actions
          </p>
          <div className="space-y-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => setActiveTab(action.tab)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all duration-150',
                  activeTab === action.tab
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                )}
                style={
                  activeTab === action.tab
                    ? { background: 'oklch(0.652 0.214 36 / 0.2)' }
                    : undefined
                }
              >
                <span className={activeTab === action.tab ? 'text-orange-400' : 'text-white/40'}>
                  {action.icon}
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-Pilot section */}
        <div style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.4 0.010 52)' }}>
                Auto-Pilot
              </p>
              <Link
                href="/dashboard/autopilot"
                className="text-[9px] font-semibold transition-colors hover:opacity-80"
                style={{ color: '#EA580C' }}
              >
                Manage →
              </Link>
            </div>
            <AutoPilotMiniStatus agentId={id} />
          </div>
        </div>

        {/* Bottom: Settings shortcut */}
        <div className="p-4" style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('Customize')}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
            style={{ background: 'oklch(0.185 0.016 48)' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Customize this agent
          </button>
        </div>
      </div>

      {/* ── Right content panel ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        {/* Tab bar */}
        <div
          className="flex h-12 shrink-0 items-center gap-1 px-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                activeTab === tab
                  ? 'text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
              style={
                activeTab === tab
                  ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                  : undefined
              }
            >
              <span>{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'Chat' && (
            <div className="h-full">
              <PremiumGate agentPremium={agent.premium}>
                <AgentChat agent={agent} />
              </PremiumGate>
            </div>
          )}

          {activeTab === 'Workflows' && (
            <div className="h-full overflow-y-auto p-6">
              <PremiumGate agentPremium={agent.premium}>
                <WorkflowComposer agent={agent} />
              </PremiumGate>
            </div>
          )}

          {activeTab === 'Customize' && (
            <div className="h-full overflow-y-auto p-6">
              <AgentCustomize agent={agent} />
            </div>
          )}

          {activeTab === 'Permissions' && (
            <div className="h-full overflow-y-auto p-6">
              <AgentPermissions agent={agent} />
            </div>
          )}

          {activeTab === 'Memory' && (
            <div className="h-full overflow-y-auto p-6">
              <AgentSettings agent={agent} mode="memory" />
            </div>
          )}

          {activeTab === 'Platform' && (
            <div className="h-full overflow-y-auto p-6">
              <AgentPlatformConfig agent={agent} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
