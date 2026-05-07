import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-border/40 bg-[oklch(0.135_0.018_48)] px-6 py-14 text-center sm:px-12 sm:py-20">
        {/* Aurora */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 20% 100%, rgba(234,88,12,0.55), transparent 60%),' +
              'radial-gradient(ellipse 60% 60% at 80% 0%, rgba(219,39,119,0.45), transparent 60%),' +
              'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(245,158,11,0.18), transparent 70%)',
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            <Sparkles className="h-3 w-3 text-orange-300" />
            Free to try · upgrade when you ship more
          </p>
          <h2 className="mt-5 text-balance font-display text-4xl text-white tracking-tight sm:text-6xl">
            Hire your AI <span className="gradient-text-warm">growth team</span>.
            <br className="hidden sm:block" />
            Ship the first post in 60 seconds.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
            All six agents. Real OAuth posting. Tokens encrypted at rest. A free plan that&apos;s
            actually free. No credit card.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-foreground shadow-xl transition-transform hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/create"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur hover:bg-white/10 transition-colors"
            >
              See the demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
