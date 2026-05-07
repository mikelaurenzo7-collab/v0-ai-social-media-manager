'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/dashboard/header'

const AGENT_STATS = {
  strategist: { sessions: 24, workflows: 8, rating: '4.9', specialty: 'Brand Growth' },
  viral: { sessions: 31, workflows: 5, rating: '4.8', specialty: 'Viral Reach' },
  voice: { sessions: 18, workflows: 11, rating: '4.9', specialty: 'Tone & Voice' },
  community: { sessions: 42, workflows: 6, rating: '5.0', specialty: 'Engagement' },
}

const AGENT_GRADIENT: Record<string, string> = {
  strategist: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  viral: 'linear-gradient(135deg, #EA580C 0%, #EAB308 100%)',
  voice: 'linear-gradient(135deg, #A855F7 0%, #DB2777 100%)',
  community: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)',
}

export default function AgentsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="AI Agents"
        description="Your dedicated team of social media experts, ready to scale your presence."
      />

      {/* Team intro banner */}
      <div className="px-6 pt-6">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{ background: 'oklch(0.135 0.018 48)' }}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.15), transparent 60%)' }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your AI Team</p>
              <h2 className="mt-1 text-lg font-bold text-white">4 specialists · Always available</h2>
              <p className="mt-1 text-sm text-white/60">
                Each agent has a unique role. Use them together for a complete social media strategy.
              </p>
            </div>
            <div className="flex -space-x-3 shrink-0">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white border-2 shadow-sm"
                  style={{
                    background: AGENT_GRADIENT[agent.id] ?? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
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
      <div className="p-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((agent) => {
          const agentStats = AGENT_STATS[agent.id as keyof typeof AGENT_STATS]
          const gradient = AGENT_GRADIENT[agent.id] ?? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)'

          return (
            <Card
              key={agent.id}
              className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border-border/60"
            >
              {/* Card top gradient band */}
              <div
                className="h-1.5 w-full"
                style={{ background: gradient }}
              />

              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                    style={{ background: gradient }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {agent.premium && (
                      <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        Premium
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-0.5">
                  <h3 className="font-bold text-base">{agent.name}</h3>
                  <p className="text-xs font-semibold" style={{ color: '#EA580C' }}>{agent.role}</p>
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
                    <p className="text-sm font-bold text-foreground">{agentStats.sessions}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Chats</p>
                  </div>
                  <div className="text-center border-x border-border/40">
                    <p className="text-sm font-bold text-foreground">{agentStats.workflows}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Flows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">★{agentStats.rating}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/20 p-4 gap-2">
                <Button
                  asChild
                  className="flex-1 font-semibold text-white"
                  style={{ background: gradient, border: 'none' }}
                >
                  <Link href={`/dashboard/agents/${agent.id}`}>
                    {agent.premium ? '🔓 Unlock Agent' : `Chat with ${agent.name}`}
                  </Link>
                </Button>
                {!agent.premium && (
                  <Button asChild variant="outline" size="icon" className="shrink-0 border-border/60">
                    <Link href={`/dashboard/agents/${agent.id}?tab=Platform`} title="Platform Config">
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
        className="mx-6 mb-10 rounded-2xl p-8"
        style={{ background: 'oklch(0.135 0.018 48)' }}
      >
        <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-start sm:text-left sm:gap-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
          >
            ✨
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Need a custom agent?</h3>
            <p className="mt-1 text-sm text-white/60 max-w-lg">
              Enterprise plans let you build AI agents trained entirely on your brand voice, industry knowledge, and historical performance data.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Custom system prompts', 'Brand data fine-tuning', 'Unlimited agents', 'API access'].map((feat) => (
                <span
                  key={feat}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>
          <Button asChild variant="link" className="shrink-0 text-orange-400 hover:text-orange-300 font-semibold">
            <Link href="mailto:sales@postpilot.ai">Contact Sales →</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
