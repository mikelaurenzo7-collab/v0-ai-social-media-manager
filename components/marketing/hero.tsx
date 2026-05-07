'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Play, ShieldCheck } from 'lucide-react'

const ROTATION = [
  {
    agent: 'X Agent',
    slug: 'x',
    role: 'X Specialist',
    hue: 'from-zinc-700 to-zinc-900',
    prompt: 'Write a thread on the launch lessons from this week',
    out: '5 lessons from launch week. A thread. \n\n1/ Ship before you are ready. We were not. It still worked.\n2/ The first hour matters more than the first day.\n3/ Pin the demo, not the announcement.\n4/ Reply to every comment for 48h. Velocity beats volume.\n5/ Day-2 silence kills momentum. Have a follow-up ready.',
  },
  {
    agent: 'Meta Agent',
    slug: 'meta',
    role: 'Instagram & Facebook',
    hue: 'from-pink-500 to-rose-500',
    prompt: 'Carousel idea for our small studio behind the scenes',
    out: 'Slide 1: "Inside the studio at 7am." (hero shot)\nSlide 2 to 3: the actual workbench, no stylists.\nSlide 4: the rejected version we almost shipped.\nSlide 5: the version we sent.\nSlide 6: "Save this if you have ever wondered what crafted actually looks like."',
  },
  {
    agent: 'LinkedIn Agent',
    slug: 'linkedin',
    role: 'LinkedIn Specialist',
    hue: 'from-sky-500 to-blue-700',
    prompt: 'Make this post sound less corporate',
    out: 'We hit 10k customers.\n\nI still cry-laughed in the car after the call with #6,142.\n\nBuilding means caring about every single one. If you are early, that is the bar.',
  },
  {
    agent: 'TikTok Agent',
    slug: 'tiktok',
    role: 'TikTok Specialist',
    hue: 'from-fuchsia-500 to-rose-600',
    prompt: 'Hook for: 5 productivity rules I broke',
    out: 'On-screen: "I broke every productivity rule for 30 days."\nVO: "Rule #4 made me 3x more focused. Do not skip — wait for the green sticky note."\nCaption: do not try this if you have meetings before 10am.',
  },
  {
    agent: 'Gmail Agent',
    slug: 'gmail',
    role: 'Gmail Specialist',
    hue: 'from-red-500 to-orange-500',
    prompt: 'Cold email to a founder I admire about partnership',
    out: 'subject: small idea, big fan\n\nshort version —\nlove what you are building. one specific way we could collab in 15 min. happy to send the deck if it is a fit.',
  },
  {
    agent: 'Outlook Agent',
    slug: 'outlook',
    role: 'Outlook Specialist',
    hue: 'from-blue-600 to-indigo-700',
    prompt: 'Update the board on Q3 revenue',
    out: 'Subject: [Update] Q3 revenue + commentary\n\nHeadline: $4.2M (+38% YoY).\nThree drivers below, two risks I am watching, one ask.',
  },
]

export function Hero() {
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [phase, setPhase] = useState<'typing' | 'thinking' | 'reveal'>('typing')

  useEffect(() => {
    const item = ROTATION[idx]
    let cancelled = false
    setTyped('')
    setPhase('typing')

    let i = 0
    const typeInterval = setInterval(() => {
      if (cancelled) return
      i++
      setTyped(item.prompt.slice(0, i))
      if (i >= item.prompt.length) {
        clearInterval(typeInterval)
        setPhase('thinking')
        setTimeout(() => !cancelled && setPhase('reveal'), 700)
        setTimeout(() => !cancelled && setIdx((p) => (p + 1) % ROTATION.length), 4800)
      }
    }, 36)

    return () => {
      cancelled = true
      clearInterval(typeInterval)
    }
  }, [idx])

  const current = ROTATION[idx]

  return (
    <section className="relative isolate overflow-hidden">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[680px] w-[1100px] -translate-x-1/2">
          <div
            className="h-full w-full opacity-70 [mask-image:radial-gradient(closest-side,white,transparent)]"
            style={{
              background:
                'radial-gradient(35% 35% at 30% 35%, rgba(234,88,12,0.32), transparent 60%),' +
                'radial-gradient(35% 35% at 70% 30%, rgba(219,39,119,0.28), transparent 60%),' +
                'radial-gradient(45% 45% at 50% 70%, rgba(245,158,11,0.18), transparent 65%)',
            }}
          />
        </div>
        <div className="absolute inset-x-0 top-0 h-[640px] bg-grid opacity-[0.5] [mask-image:linear-gradient(180deg,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow pill */}
          <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500 pulse-dot text-orange-500" />
            <span>One agent per channel — make each one yours</span>
            <span className="text-muted-foreground/70">·</span>
            <a href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
              v2026.05
            </a>
          </div>

          {/* Headline */}
          <h1
            className="reveal-up mt-6 text-balance font-display text-[2.75rem] leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '60ms' }}
          >
            Your AI co-pilot
            <br className="hidden sm:block" />
            <span className="gradient-text-animate">for social and email</span>
          </h1>

          {/* Subhead */}
          <p
            className="reveal-up mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            Six specialist agents — one per channel — draft, design, and publish across X, Meta,
            LinkedIn, TikTok, Gmail, and Outlook. They learn your voice, your audience, and what
            actually works. You stay in control of every word.
          </p>

          {/* CTAs */}
          <div
            className="reveal-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '240ms' }}
          >
            <Button size="lg" asChild className="btn-gradient h-12 rounded-full px-7 text-sm font-semibold">
              <Link href="/signup" className="inline-flex items-center gap-2">
                Start creating free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 rounded-full px-6 text-sm font-medium border-border/80">
              <Link href="/dashboard/create" className="inline-flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                See it in action
              </Link>
            </Button>
          </div>

          {/* Trust line */}
          <div
            className="reveal-up mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground"
            style={{ animationDelay: '320ms' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              SOC 2-ready · Tokens encrypted at rest
            </span>
            <span aria-hidden>·</span>
            <span>No credit card</span>
            <span aria-hidden>·</span>
            <span>7-day Pro trial</span>
          </div>
        </div>

        {/* Hero demo */}
        <div className="reveal-up relative mx-auto mt-14 max-w-5xl" style={{ animationDelay: '420ms' }}>
          <FloatingChip
            label={current.agent}
            sub={current.role}
            className="absolute -left-3 -top-3 hidden md:flex"
            hue={current.hue}
          />
          <FloatingChip
            label="Posted"
            sub="Just now · X · LinkedIn"
            className="absolute -right-2 top-12 hidden lg:flex"
            hue="from-emerald-500 to-teal-600"
            indicator
          />
          <FloatingChip
            label="92% engagement"
            sub="vs your last 30 days"
            className="absolute -right-4 -bottom-3 hidden md:flex"
            hue="from-amber-500 to-orange-600"
          />

          <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_30px_80px_-30px_rgba(234,88,12,0.35)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="ml-auto rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                postpilot.app/agents/{current.slug}
              </span>
              <Sparkles className="ml-2 h-3.5 w-3.5 text-orange-500" />
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
              <div className="border-b lg:border-b-0 lg:border-r border-border/60 p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${current.hue} text-white text-[11px] font-semibold shadow-md`}>
                    {current.agent.replace(/\s+/g, '').slice(0, 2)}
                    <span className="absolute -right-0.5 -bottom-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{current.agent}</p>
                    <p className="truncate text-xs text-muted-foreground">{current.role}</p>
                  </div>
                </div>

                <label className="mt-6 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Your prompt
                </label>
                <div className="mt-2 min-h-[88px] rounded-xl border border-border/70 bg-background/70 p-3.5 font-mono text-sm leading-relaxed text-foreground">
                  <span>{typed}</span>
                  {phase === 'typing' && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-orange-500 align-middle" />}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Chip>Casual</Chip>
                  <Chip>Witty</Chip>
                  <Chip variant="muted">Professional</Chip>
                  <Chip variant="muted">Inspiring</Chip>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button className={`btn-gradient inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold ${phase !== 'reveal' ? 'opacity-90' : ''}`}>
                    <Sparkles className="h-3 w-3" />
                    {phase === 'typing' ? 'Listening…' : phase === 'thinking' ? 'Thinking…' : 'Generated'}
                  </button>
                  <span className="text-[11px] text-muted-foreground">⌘ + Return</span>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-muted/30 to-background p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Live output
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot text-emerald-500 relative" />
                    <span className="text-[10px] font-medium text-emerald-700">Streaming</span>
                  </div>
                </div>

                <div
                  key={idx + '-' + phase}
                  className={`mt-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all ${
                    phase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'
                  }`}
                  style={{ transitionDuration: '450ms' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-pink-600" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Your Brand</span>
                        <span className="text-xs text-muted-foreground">@yourbrand · 2s</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                        {current.out}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                    <span>♥ 1.2k</span>
                    <span>↻ 312</span>
                    <span>💬 84</span>
                    <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700">
                      score 92
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <ResultCardMini label="Variation A" />
                  <ResultCardMini label="Variation B" muted />
                  <ResultCardMini label="Variation C" muted />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {ROTATION.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === idx ? 'w-8 bg-foreground' : 'w-1 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FloatingChip({
  label,
  sub,
  className = '',
  hue,
  indicator,
}: {
  label: string
  sub: string
  className?: string
  hue: string
  indicator?: boolean
}) {
  return (
    <div className={`z-10 inline-flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3 py-2 shadow-lg float-gentle ${className}`}>
      <span className={`relative h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br ${hue}`}>
        {indicator && <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white" />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground leading-none">{label}</p>
        <p className="mt-1 text-[10px] text-muted-foreground leading-none">{sub}</p>
      </div>
    </div>
  )
}

function Chip({ children, variant = 'active' }: { children: React.ReactNode; variant?: 'active' | 'muted' }) {
  return (
    <span
      className={
        variant === 'active'
          ? 'inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-medium text-orange-700'
          : 'inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground'
      }
    >
      {children}
    </span>
  )
}

function ResultCardMini({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card/80 p-2.5 ${muted ? 'opacity-60' : ''}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-2 space-y-1">
        <span className="block h-1.5 rounded-full bg-foreground/15" />
        <span className="block h-1.5 w-4/5 rounded-full bg-foreground/10" />
        <span className="block h-1.5 w-3/5 rounded-full bg-foreground/10" />
      </div>
    </div>
  )
}
