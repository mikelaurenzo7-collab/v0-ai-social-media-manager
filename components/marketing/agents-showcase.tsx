'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AGENTS } from '@/lib/agents'

export function AgentsShowcase() {
  const [active, setActive] = useState(AGENTS[0].id)
  const current = AGENTS.find((a) => a.id === active) ?? AGENTS[0]

  return (
    <section id="agents" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-orange-500" />
            Meet the agents
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            One agent per integration. <span className="gradient-text">Fully customizable.</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Each agent is named after its platform. After you connect, customize role, voice, and
            rules to make it work exactly how you need.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Picker */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {AGENTS.map((a) => {
              const isActive = a.id === active
              return (
                <button
                  key={a.id}
                  onClick={() => setActive(a.id)}
                  aria-pressed={isActive}
                  className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all lg:w-full ${
                    isActive
                      ? 'border-foreground/20 bg-card shadow-md'
                      : 'border-border/70 bg-card/40 hover:bg-card hover:border-border'
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
                    style={{ background: a.gradient }}
                  >
                    {a.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground">{a.name} Agent</span>
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">{a.role}</span>
                  </span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 shrink-0 transition-all ${
                      isActive ? 'translate-x-0 text-foreground' : '-translate-x-1 text-muted-foreground group-hover:translate-x-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Detail */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-7 sm:p-9 shadow-[0_30px_70px_-30px_rgba(234,88,12,0.25)]">
              {/* gradient halo */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
                style={{ background: current.gradient }}
              />

              <div className="flex items-center gap-4">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
                  style={{ background: current.gradient }}
                >
                  {current.avatar}
                </span>
                <div>
                  <h3 className="font-display text-3xl tracking-tight">{current.name} Agent</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{current.role}</p>
                </div>
                {current.category === 'email' && (
                  <span className="ml-auto rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </span>
                )}
              </div>

              <p className="mt-6 text-pretty text-base leading-relaxed text-foreground/80">
                {current.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {current.capabilities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-foreground/80"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-7 grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-3">
                <Stat label="Avg. session" value="9 min" />
                <Stat label="Replies / send" value="3.4×" />
                <Stat label="Approval rate" value="96%" />
              </div>

              <div className="mt-6 flex gap-2">
                <Link
                  href="/signup"
                  className="btn-gradient inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold"
                >
                  Get started with {current.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/dashboard/agents/${current.id}`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
                >
                  See sample work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card/80 p-3 ring-1 ring-border/60">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tracking-tight">{value}</p>
    </div>
  )
}
