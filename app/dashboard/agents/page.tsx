'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/dashboard/header'

const AGENT_STATS: Record<string, { sessions: number; workflows: number; rating: string; specialty: string }> = {
  strategist: { sessions: 24, workflows: 8, rating: '4.9', specialty: 'Brand Growth' },
  viral: { sessions: 31, workflows: 5, rating: '4.8', specialty: 'Viral Reach' },
  voice: { sessions: 18, workflows: 11, rating: '4.9', specialty: 'Tone & Voice' },
  community: { sessions: 42, workflows: 6, rating: '5.0', specialty: 'Engagement' },
  gmail: { sessions: 12, workflows: 4, rating: '4.9', specialty: 'Gmail Outreach' },
  outlook: { sessions: 9, workflows: 3, rating: '4.8', specialty: 'Business Email' },
}

const AGENT_GRADIENT: Record<string, string> = {
  strategist: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  viral: 'linear-gradient(135deg, #EA580C 0%, #EAB308 100%)',
  voice: 'linear-gradient(135deg, #A855F7 0%, #DB2777 100%)',
  community: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)',
  gmail: 'linear-gradient(135deg, #EA4335 0%, #FBBC04 100%)',
  outlook: 'linear-gradient(135deg, #0078D4 0%, #00BCF2 100%)',
}

export default function AgentsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header
        eyebrow="The Team"
        title="AI Agents"
        description="Your dedicated team of social media experts, ready to scale your presence."
      />

      <div className="px-6 pt-7 pb-14 md:px-10 space-y-7">
        {/* Team intro banner */}
        <div className="relative isolate overflow-hidden rounded-2xl border border-sidebar-border/60 px-6 py-6 text-sidebar-foreground shadow-[0_30px_60px_-20px_oklch(0.135_0.018_48_/_0.45)]"
          style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48) 0%, oklch(0.185 0.020 38) 100%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 -z-10 h-56 w-56 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #EA580C, transparent 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 left-32 -z-10 h-44 w-44 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #DB2777, transparent 70%)' }}
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/50">
                Your AI team
              </p>
              <h2 className="mt-1.5 font-display text-2xl leading-tight tracking-tight">
                {AGENTS.length} specialists. Always available.
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-sidebar-foreground/65">
                Each agent has a unique role across social and email. Use them together for a complete go-to-market strategy.
              </p>
            </div>
            <div className="flex shrink-0 -space-x-3">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ring-2 shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
                  style={{
                    background: AGENT_GRADIENT[agent.id] ?? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
                    // ring-color via inline style is not directly supported; rely on Tailwind ring colors via oklch
                    boxShadow: '0 0 0 2px oklch(0.135 0.018 48), 0 8px 16px -4px rgb(0 0 0 / 0.4)',
                  }}
                  title={agent.name}
                >
                  {agent.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => {
            const agentStats = AGENT_STATS[agent.id as keyof typeof AGENT_STATS]
            const gradient = AGENT_GRADIENT[agent.id] ?? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)'

            return (
              <Card
                key={agent.id}
                className="group relative flex flex-col overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_60px_-25px_rgb(0_0_0_/_0.25)]"
              >
                {/* Card top gradient band */}
                <div className="h-1.5 w-full" style={{ background: gradient }} />

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-[0_10px_24px_-8px_rgb(0_0_0_/_0.4)] ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: gradient }}
                    >
                      {agent.avatar}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {agent.premium ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" />
                          </svg>
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          Online
                        </span>
                      )}
                      <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {agentStats.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-display text-xl leading-tight tracking-tight text-foreground">
                      {agent.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {agent.role}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{agent.description}</p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Mini stats row */}
                  <div className="grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/60 bg-muted/30 py-2.5">
                    <div className="text-center">
                      <p className="font-display text-lg leading-none tabular-nums text-foreground">
                        {agentStats.sessions}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Chats
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-lg leading-none tabular-nums text-foreground">
                        {agentStats.workflows}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Flows
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="inline-flex items-baseline gap-0.5 font-display text-lg leading-none tabular-nums text-foreground">
                        <svg className="h-3 w-3 self-center text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" />
                        </svg>
                        {agentStats.rating}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Rating
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-2 border-t border-border/60 bg-muted/20 p-4">
                  <Button
                    asChild
                    className={
                      agent.premium
                        ? 'h-10 flex-1 rounded-full bg-foreground text-sm font-semibold text-background hover:bg-foreground/90'
                        : 'btn-gradient h-10 flex-1 rounded-full text-sm font-semibold text-white'
                    }
                  >
                    <Link href={`/dashboard/agents/${agent.id}`}>
                      {agent.premium ? (
                        <>
                          <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          Unlock agent
                        </>
                      ) : (
                        <>
                          Chat with {agent.name}
                          <svg className="ml-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </>
                      )}
                    </Link>
                  </Button>
                  {!agent.premium && (
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      aria-label="Platform config"
                      className="h-10 w-10 shrink-0 rounded-full border-border/70 text-muted-foreground hover:text-foreground"
                    >
                      <Link href={`/dashboard/agents/${agent.id}?tab=Platform`} title="Platform config">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Enterprise CTA */}
        <div
          className="relative isolate overflow-hidden rounded-2xl border border-sidebar-border/60 p-8 text-sidebar-foreground shadow-[0_30px_60px_-20px_oklch(0.135_0.018_48_/_0.45)]"
          style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48) 0%, oklch(0.185 0.020 38) 100%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-12 right-1/3 -z-10 h-44 w-44 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #EA580C, transparent 70%)' }}
          />

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_10px_24px_-6px_oklch(0.652_0.214_36_/_0.5)]">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-2xl leading-tight tracking-tight">Need a custom agent?</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-sidebar-foreground/65">
                Enterprise plans let you build AI agents trained entirely on your brand voice, industry knowledge, and historical performance data.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['Custom system prompts', 'Brand data fine-tuning', 'Unlimited agents', 'API access'].map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border/50 bg-sidebar-accent/30 px-2.5 py-1 text-[11px] font-medium text-sidebar-foreground/75"
                  >
                    <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feat}
                  </span>
                ))}
              </div>
            </div>
            <Button
              asChild
              className="btn-gradient h-10 shrink-0 rounded-full px-5 text-sm font-semibold text-white"
            >
              <Link href="mailto:sales@postpilot.ai">
                Contact sales
                <svg className="ml-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
