'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/accounts/platform-icon'

const AGENT_STATS: Record<string, { sessions: number; workflows: number; rating: string; status: 'connected' | 'disconnected' }> = {
  twitter:   { sessions: 24, workflows: 8, rating: '4.9', status: 'connected' },
  instagram: { sessions: 42, workflows: 6, rating: '5.0', status: 'connected' },
  linkedin:  { sessions: 31, workflows: 5, rating: '4.8', status: 'connected' },
  facebook:  { sessions: 9,  workflows: 2, rating: '4.7', status: 'disconnected' },
  tiktok:    { sessions: 18, workflows: 11, rating: '4.9', status: 'connected' },
  gmail:     { sessions: 12, workflows: 4, rating: '4.9', status: 'connected' },
  outlook:   { sessions: 9,  workflows: 3, rating: '4.8', status: 'disconnected' },
}

export default function AgentsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="AI Agents"
        description="One agent per integration. Each one is named after the platform it operates — customize the role, persona, and responsibilities after activating."
      />

      {/* Team intro banner */}
      <div className="px-6 pt-6">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{ background: 'oklch(0.135 0.018 48)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.15), transparent 60%)' }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your Agents</p>
              <h2 className="mt-1 text-lg font-bold text-white">{AGENTS.length} integration agents · One per channel</h2>
              <p className="mt-1 text-sm text-white/60">
                Each agent is tied to a single integration. Connect the channel, then teach the agent its role.
              </p>
            </div>
            <div className="flex -space-x-3 shrink-0">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white border-2 shadow-sm"
                  style={{
                    background: agent.gradient,
                    borderColor: 'oklch(0.135 0.018 48)',
                  }}
                  title={agent.name}
                >
                  {agent.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="p-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const agentStats = AGENT_STATS[agent.id]
          const isConnected = agentStats?.status === 'connected'

          return (
            <Card
              key={agent.id}
              className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border-border/60"
            >
              {/* Card top gradient band — uses platform brand */}
              <div className="h-1.5 w-full" style={{ background: agent.gradient }} />

              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between">
                  <PlatformIcon platform={agent.platform} size="md" />
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={
                        isConnected
                          ? { background: '#10B98115', color: '#059669', border: '1px solid #10B98133' }
                          : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
                      }
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: isConnected ? '#10B981' : 'var(--muted-foreground)' }}
                      />
                      {isConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-0.5">
                  <h3 className="font-bold text-base">{agent.name} Agent</h3>
                  <p className="text-xs font-semibold" style={{ color: agent.color === '#000000' ? '#EA580C' : agent.color }}>
                    {agent.role}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/40 bg-muted/20 p-2.5">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{agentStats?.sessions ?? 0}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Chats</p>
                  </div>
                  <div className="text-center border-x border-border/40">
                    <p className="text-sm font-bold text-foreground">{agentStats?.workflows ?? 0}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Flows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">★{agentStats?.rating ?? '—'}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/20 p-4 gap-2">
                <Button
                  asChild
                  className="flex-1 font-semibold text-white"
                  style={{ background: agent.gradient, border: 'none' }}
                >
                  <Link href={`/dashboard/agents/${agent.id}`}>
                    {isConnected ? `Open ${agent.name} Agent` : `Activate ${agent.name} Agent`}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="icon" className="shrink-0 border-border/60" title="Customize persona">
                  <Link href={`/dashboard/agents/${agent.id}?tab=Settings`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Customization CTA */}
      <div
        className="mx-6 mb-10 rounded-2xl p-8"
        style={{ background: 'oklch(0.135 0.018 48)' }}
      >
        <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-start sm:text-left sm:gap-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Make every agent yours</h3>
            <p className="mt-1 text-sm text-white/60 max-w-lg">
              Open any agent to set its role, responsibilities, brand voice, and operating rules. Customizations apply to every chat, draft, and scheduled run.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Custom role', 'Brand voice', 'Operating rules', 'Long-term memory'].map((feat) => (
                <span
                  key={feat}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
          <Button asChild variant="link" className="shrink-0 text-orange-400 hover:text-orange-300 font-semibold">
            <Link href="/dashboard/accounts">Manage integrations →</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
