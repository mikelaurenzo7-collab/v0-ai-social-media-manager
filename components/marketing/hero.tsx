'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Play, ShieldCheck } from 'lucide-react'

const ROTATION = [
  { agent: 'X',         slug: 'twitter',   role: 'X Agent',         hue: 'from-neutral-700 to-black',
    prompt: 'Write a hook tweet for: 5 productivity rules I broke',
    out:    "I broke every productivity rule for 30 days.\nRule #4 made me 3\u00d7 more focused.\nDon\u2019t skip \u2014 wait for the green sticky note." },
  { agent: 'Instagram', slug: 'instagram', role: 'Instagram Agent', hue: 'from-purple-500 via-pink-500 to-orange-400',
    prompt: 'Caption for our 10,000-customer milestone Reel',
    out:    "10,000 customers later \u2014 I still cry-laughed in the car after the call with #6,142.\nBuilding means caring about every single one.\nSwipe to see the team that made it happen \u2192" },
  { agent: 'LinkedIn',  slug: 'linkedin',  role: 'LinkedIn Agent',  hue: 'from-sky-500 to-blue-700',
    prompt: 'Make this LinkedIn post sound less corporate',
    out:    "We hit 10k customers.\nI still cry-laughed in the car after the call with #6,142.\nBuilding means caring about every single one." },
  { agent: 'TikTok',    slug: 'tiktok',    role: 'TikTok Agent',    hue: 'from-cyan-400 via-black to-pink-500',
    prompt: 'Script: 3-second hook for: my morning routine flop',
    out:    "POV: you tried the 5 AM routine for 30 days.\nIt nearly broke you.\nThe one tweak that fixed everything \u2192" },
  { agent: 'Gmail',     slug: 'gmail',     role: 'Gmail Agent',     hue: 'from-red-500 to-amber-500',
    prompt: 'Cold email to a founder I admire about partnership',
    out:    "subject: small idea, big fan\u2014\nshort version: love what you\u2019re building. one specific way we could collab in 15 min\u2014happy to send the deck if it\u2019s a fit?" },
  { agent: 'Outlook',   slug: 'outlook',   role: 'Outlook Agent',   hue: 'from-sky-500 to-blue-600',
    prompt: 'Update the board on Q3 revenue',
    out:    "Subject: [Update] Q3 revenue + commentary\n\nHeadline: $4.2M (+38% YoY). Three drivers below, two risks I\u2019m watching, one ask." },
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
          <div className="h-full w-full opacity-70 [mask-image:radial-gradient(closest-side,white,transparent)]"
               style={{
                 background:
                   'radial-gradient(35% 35% at 30% 35%, rgba(234,88,12,0.32), transparent 60%),' +
                   'radial-gradient(35% 35% at 70% 30%, rgba(219,39,119,0.28), transparent 60%),' +
                   'radial-gradient(45% 45% at 50% 70%, rgba(245,158,11,0.18), transparent 65%)',
               }} />
        </div>
        <div className="absolute inset-x-0 top-0 h-[640px] bg-grid opacity-[0.5] [mask-image:linear-gradient(180deg,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow pill */}
          <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500 pulse-dot text-orange-500" />
            <span>Now with Gmail &amp; Outlook agents</span>
            <span className="text-muted-foreground/70">·</span>
            <span className="text-muted-foreground">v2026.05</span>
          </div>

          {/* Headline */}
          <h1 className="reveal-up mt-6 text-balance font-display text-[2.75rem] leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: '60ms' }}>
            Your AI co-pilot
            <br className="hidden sm:block" />
            <span className="gradient-text-animate">for social and email</span>
          </h1>

          {/* Subhead */}
          <p className="reveal-up mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
             style={{ animationDelay: '160ms' }}>
            One agent per integration — X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook.
            Each one is named after the channel it operates. Customize role, voice, and rules after
            you connect.
          </p>

          {/* CTAs */}
          <div className="reveal-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
               style={{ animationDelay: '240ms' }}>
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
          <div className="reveal-up mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground"
               style={{ animationDelay: '320ms' }}>
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

        {/* Hero demo — agent terminal */}
        <div className="reveal-up relative mx-auto mt-14 max-w-5xl" style={{ animationDelay: '420ms' }}>
          {/* Floating accent cards */}
          <FloatingChip
            label={`${current.agent} Agent`}
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
            {/* Window chrome */}
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
              {/* Left: prompt */}
              <div className="border-b lg:border-b-0 lg:border-r border-border/60 p-6 sm:p-7">
                <div className="flex items-center gap-2.5">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${current.hue} text-white text-[11px] font-bold shadow-md`}>
                    {current.agent.length <= 2 ? current.agent : current.agent.slice(0, 2)}
                    <span className="absolute -right-0.5 -bottom-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{current.agent} Agent</p>
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

              {/* Right: result feed */}
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

          {/* Rotation indicator */}
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
        {indicator && (
          <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-white" />
        )}
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
