import { Star } from 'lucide-react'

type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  initials: string
  metric?: string
}

const QUOTES: Testimonial[] = [
  {
    quote:
      'The voice fingerprint is uncanny. I paste five LinkedIn posts and the LinkedIn Agent writes the next ten in a way my team can’t tell apart from mine.',
    name: 'Mara Tan',
    role: 'Founder',
    company: 'Loop Studio',
    initials: 'MT',
    metric: '12× posting cadence',
  },
  {
    quote:
      'Crisis Mode alone justifies the price. We had a brand-safety incident at 11pm on a Saturday and one toggle paused every channel across every workspace.',
    name: 'Dev Patel',
    role: 'Head of Social',
    company: 'Northwind Agency',
    initials: 'DP',
    metric: '0 unscheduled posts',
  },
  {
    quote:
      'Approvals + audit log + per-agent permissions is what finally got our legal team to greenlight an AI system writing customer-facing copy.',
    name: 'Jules Rivera',
    role: 'VP Marketing',
    company: 'Helix Labs',
    initials: 'JR',
    metric: '94% approval rate',
  },
  {
    quote:
      'I run a four-person agency. We service eighteen clients now with the same headcount we had when we serviced six. The Meta and TikTok agents do the heavy lifting.',
    name: 'Sam Okafor',
    role: 'Owner',
    company: 'Quietfire Social',
    initials: 'SO',
    metric: '3× client roster',
  },
  {
    quote:
      'I came from Buffer expecting a familiar scheduler with AI bolted on. PostPilot is the inverse — the AI is the product, the scheduler is the thin layer over it.',
    name: 'Priya Krishnan',
    role: 'Creator',
    company: 'thirtyminutemarketer',
    initials: 'PK',
    metric: '2.4M monthly reach',
  },
  {
    quote:
      'The Gmail Agent rewrote a campaign that was getting 1.2% CTR. Same list, same offer, new copy — 4.7% CTR. That’s the entire ROI of the year in one week.',
    name: 'Alex Chen',
    role: 'Growth Lead',
    company: 'Northbeam',
    initials: 'AC',
    metric: '+292% email CTR',
  },
] as const

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            What teams say
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            Trusted by founders, <span className="gradient-text">agencies</span>, and creators.
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            We&apos;re early. These are real beta customers who let us print their words.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
            >
              <div className="flex items-center gap-1.5 text-amber-500">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>

              <blockquote className="mt-5 flex-1 text-pretty text-[15px] leading-relaxed text-foreground/90">
                &ldquo;{q.quote}&rdquo;
              </blockquote>

              {q.metric && (
                <p className="mt-5 inline-flex w-fit items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {q.metric}
                </p>
              )}

              <figcaption className="mt-5 flex items-center gap-3 border-t border-border/50 pt-5">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  {q.initials}
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{q.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.role} · {q.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground/80">
          Want to be quoted here? Email{' '}
          <a className="underline underline-offset-2 hover:text-foreground" href="mailto:hello@postpilot.app">
            hello@postpilot.app
          </a>{' '}
          and tell us what shipped.
        </p>
      </div>
    </section>
  )
}
