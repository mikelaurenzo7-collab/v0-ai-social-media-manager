import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    title: 'Connect your accounts',
    description:
      'One-click OAuth for X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook. Tokens are AES-256-GCM encrypted at rest and auto-refreshed. We never see your password.',
    detail: 'Takes 30 seconds per platform',
    color: '#EA580C',
    bg: 'from-orange-500/10 to-amber-500/5',
    visual: <ConnectVisual />,
  },
  {
    number: '02',
    title: 'Pick an agent and prompt',
    description:
      'Choose your specialist: Sarah for strategy, Leo for viral hooks, Aria for voice, Marcus for community, Gina for Gmail, Oliver for Outlook. Just describe what you want.',
    detail: '6 specialists, 1 command',
    color: '#8B5CF6',
    bg: 'from-violet-500/10 to-purple-500/5',
    visual: <AgentVisual />,
  },
  {
    number: '03',
    title: 'Get 3 AI variations instantly',
    description:
      'Claude streams 3 platform-optimized takes. Each with a virality score, hook type analysis, and a pro tip for maximizing reach. Pick, tweak, ship.',
    detail: 'Average: 8 seconds to generate',
    color: '#DB2777',
    bg: 'from-pink-500/10 to-rose-500/5',
    visual: <VariationsVisual />,
  },
  {
    number: '04',
    title: 'Schedule or publish live',
    description:
      'Hit publish and your agent posts directly to the platform. Or schedule to your golden hour. Auto-Pilot recipes can run the whole thing on a repeating cadence.',
    detail: 'Real posting via official APIs',
    color: '#10B981',
    bg: 'from-emerald-500/10 to-teal-500/5',
    visual: <PublishVisual />,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      {/* Subtle grid background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            How it works
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            From idea to published
            <br />
            <span className="gradient-text">in under 60 seconds.</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            No complicated workflows. No onboarding calls. Just pick an agent, describe your goal,
            and PostPilot handles the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 space-y-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`group relative overflow-hidden rounded-3xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:border-border ${i % 2 === 0 ? '' : ''}`}
            >
              <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
                {/* Text side */}
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm"
                      style={{ background: step.color }}
                    >
                      {step.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {step.detail}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-lg">
                    {step.description}
                  </p>
                </div>

                {/* Visual side */}
                <div
                  className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${step.bg} border-l border-border/40 p-6 sm:p-8 min-h-[200px] lg:min-h-0`}
                >
                  {step.visual}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA below steps */}
        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Ready to see it in action?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn-gradient inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/create"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
            >
              Try the demo
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

/* ── Step visuals ──────────────────────────────────────────────────────────── */

function ConnectVisual() {
  const platforms = [
    { label: 'X', color: '#000', connected: true },
    { label: 'IG', color: '#E1306C', connected: true },
    { label: 'LI', color: '#0A66C2', connected: true },
    { label: 'TT', color: '#6366F1', connected: false },
    { label: 'FB', color: '#1877F2', connected: false },
    { label: 'GM', color: '#EA4335', connected: false },
    { label: 'OL', color: '#0078D4', connected: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Connected accounts</p>
        <div className="grid grid-cols-4 gap-2">
          {platforms.map((p) => (
            <div
              key={p.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card p-2.5 text-center"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black text-white"
                style={{ background: p.color === '#000' ? '#374151' : p.color }}
              >
                {p.label}
              </div>
              {p.connected ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5">
          <svg className="h-3 w-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-[10px] font-semibold text-emerald-700">Tokens encrypted at rest</span>
        </div>
      </div>
    </div>
  )
}

function AgentVisual() {
  const agents = [
    { initial: 'S', name: 'Sarah', role: 'Strategist', hue: 'from-blue-500 to-indigo-500', active: false },
    { initial: 'L', name: 'Leo', role: 'Viral', hue: 'from-orange-500 to-amber-500', active: true },
    { initial: 'A', name: 'Aria', role: 'Voice', hue: 'from-purple-500 to-pink-500', active: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-2">
      {agents.map((a) => (
        <div
          key={a.name}
          className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
            a.active
              ? 'border-orange-300/60 bg-orange-50/60 shadow-sm'
              : 'border-border/60 bg-card/60'
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.hue} text-sm font-bold text-white shadow-sm`}
          >
            {a.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{a.name}</p>
            <p className="text-[10px] text-muted-foreground">{a.role}</p>
          </div>
          {a.active && (
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200/60 px-2 py-0.5 text-[9px] font-bold text-orange-600 uppercase tracking-wide">
              Selected
            </span>
          )}
        </div>
      ))}
      <div className="rounded-xl border border-border/50 bg-card/80 p-3">
        <p className="text-[10px] font-bold text-muted-foreground mb-1">Your prompt</p>
        <p className="text-xs leading-relaxed text-foreground/80 font-mono">
          Write a TikTok hook about my SaaS that just hit 1k users
          <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-orange-500 align-middle" />
        </p>
      </div>
    </div>
  )
}

function VariationsVisual() {
  const vars = [
    { label: 'A', score: 9.2, hook: 'Curiosity Gap', active: true },
    { label: 'B', score: 8.1, hook: 'Bold Claim', active: false },
    { label: 'C', score: 7.4, hook: 'Relatable Pain', active: false },
  ]
  return (
    <div className="w-full max-w-xs space-y-2">
      {vars.map((v) => (
        <div
          key={v.label}
          className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
            v.active
              ? 'border-pink-300/60 bg-pink-50/60 shadow-sm ring-1 ring-pink-200/60'
              : 'border-border/60 bg-card/60'
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              v.active
                ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-md'
                : 'bg-muted/60 text-foreground/60'
            }`}
          >
            {v.label}
          </span>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-1.5 rounded-full bg-foreground/15 w-full" />
            <div className="h-1.5 rounded-full bg-foreground/10 w-4/5" />
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-black tabular-nums" style={{ color: v.active ? '#DB2777' : undefined }}>{v.score}</p>
            <p className="text-[8px] text-muted-foreground">{v.hook}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-muted-foreground">Generated in 7s</span>
        <span className="text-[10px] font-bold text-emerald-600">Streaming done</span>
      </div>
    </div>
  )
}

function PublishVisual() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">Your Brand</p>
            <p className="text-[10px] text-muted-foreground">@yourbrand</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/10 border border-emerald-200/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            Published
          </span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-foreground/12 w-full" />
          <div className="h-1.5 rounded-full bg-foreground/8 w-5/6" />
          <div className="h-1.5 rounded-full bg-foreground/8 w-4/5" />
        </div>
        <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-2.5 text-[10px] text-muted-foreground">
          <span>♥ 1.2k</span>
          <span>↻ 312</span>
          <span>💬 84</span>
          <span className="ml-auto text-[9px]">2 sec ago via PostPilot</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { platform: 'X', color: '#374151', status: 'posted' },
          { platform: 'IG', color: '#E1306C', status: 'posted' },
          { platform: 'LI', color: '#0A66C2', status: 'scheduled' },
        ].map((p) => (
          <div key={p.platform} className="flex flex-col items-center gap-1.5 rounded-lg border border-border/50 bg-card/80 p-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold text-white"
              style={{ background: p.color }}
            >
              {p.platform}
            </div>
            <span className={`text-[8px] font-semibold ${p.status === 'posted' ? 'text-emerald-600' : 'text-orange-600'}`}>
              {p.status === 'posted' ? 'Posted' : 'Scheduled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
