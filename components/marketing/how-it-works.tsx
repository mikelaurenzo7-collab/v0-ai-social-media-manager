import { Plug, BookOpen, ShieldCheck, Send } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: Plug,
    title: 'Connect your channels',
    body:
      'Real OAuth into X, Meta, LinkedIn, TikTok, Gmail, and Outlook. Tokens encrypted at rest, scoped per workspace, revocable in one click.',
    detail: 'Median connect time: 47 seconds.',
  },
  {
    n: '02',
    icon: BookOpen,
    title: 'Train your brand kit',
    body:
      'Paste five posts you’d be proud to ship. Agents fingerprint your voice across formality, energy, confidence, humor, and technicality — then tailor every draft.',
    detail: 'Voice accuracy improves with every approval.',
  },
  {
    n: '03',
    icon: ShieldCheck,
    title: 'Set permissions per agent',
    body:
      'Pick posting authority (draft / approve / autopilot), per-channel scopes, and which tools each agent can touch. Crisis Mode kills publishing instantly.',
    detail: 'Granular enough for Fortune 500. Simple enough for a solo founder.',
  },
  {
    n: '04',
    icon: Send,
    title: 'Approve, schedule, ship',
    body:
      'Agents draft, you approve. Or set autopilot for routine cadence. Calendar, pipeline, and inbox all roll up to one workspace — across every channel.',
    detail: 'Average user ships 8x more content in month one.',
  },
] as const

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            How it works
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            From zero to <span className="gradient-text">shipping</span> in four steps.
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Most teams onboard in under fifteen minutes. The hardest part is picking which channel
            to post to first.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-6 lg:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li
                key={step.n}
                className="relative rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                    style={{ background: 'var(--brand-gradient)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground/60">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <p className="mt-4 border-t border-border/50 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  {step.detail}
                </p>
              </li>
            )
          })}
        </ol>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="btn-gradient inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
          >
            Start onboarding
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/examples"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-card px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            See real examples
          </Link>
        </div>
      </div>
    </section>
  )
}
