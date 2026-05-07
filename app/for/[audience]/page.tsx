import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { AGENTS, getAgentById } from '@/lib/agents'
import { AUDIENCES } from '@/lib/audiences'

export function generateStaticParams() {
  return Object.keys(AUDIENCES).map((audience) => ({ audience }))
}

interface Params { audience: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { audience } = await params
  const cfg = AUDIENCES[audience as keyof typeof AUDIENCES]
  if (!cfg) return { title: 'PostPilot' }
  return {
    title: `${cfg.title} ${cfg.titleAccent}`,
    description: cfg.subhead,
  }
}

export default async function AudiencePage({ params }: { params: Promise<Params> }) {
  const { audience } = await params
  const cfg = AUDIENCES[audience as keyof typeof AUDIENCES]
  if (!cfg) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-60"
            style={{
              background:
                'radial-gradient(35% 35% at 30% 30%, oklch(0.652 0.214 36 / 0.16), transparent 60%),' +
                'radial-gradient(35% 35% at 70% 25%, oklch(0.588 0.238 352 / 0.14), transparent 60%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[400px] bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
              {cfg.eyebrow}
            </p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight max-w-3xl text-balance">
              {cfg.title}
              <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                {cfg.titleAccent}.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {cfg.subhead}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="text-sm font-semibold" style={{ background: 'var(--brand-gradient)' }}>
                <Link href="/signup">Start free →</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/agents">Meet the agents</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pains → fixes */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-2xl">
            Three things that break first.{' '}
            <span className="text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
              Three things we fix.
            </span>
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cfg.pains.map((p) => (
              <Card key={p.pain} className="flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="text-3xl mb-3">{p.emoji}</div>
                  <p className="text-sm font-bold leading-snug">{p.pain}</p>
                  <div className="my-3 h-px bg-border/50" />
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{p.fix}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Spotlight agents */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20 border-t border-border/60">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The agents you&apos;ll lean on most
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/agents">All six →</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {cfg.spotlightAgents.map(({ id, reason }) => {
              const agent = getAgentById(id)
              const platform = agent.platforms[0]
              return (
                <Link
                  key={id}
                  href={`/agents#${id}`}
                  className="group rounded-2xl border border-border/60 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-sm bg-brand-warm"
                    >
                      {agent.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{agent.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <PlatformIcon platform={platform} size="sm" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {agent.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{reason}</p>
                  <p className="mt-3 text-[11px] font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                    See how it works →
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Killer features */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20 border-t border-border/60">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why this beats stitching tools together</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cfg.killerFeatures.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{f.emoji}</div>
                  <h3 className="text-base font-bold leading-tight">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20 border-t border-border/60">
          <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
            <p className="text-2xl sm:text-3xl leading-snug font-display italic text-foreground/90">
              &ldquo;{cfg.testimonial.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="bg-brand h-10 w-10 rounded-full flex items-center justify-center text-sm font-black text-white">
                {cfg.testimonial.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <p className="text-sm font-bold">{cfg.testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{cfg.testimonial.role}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Other audiences */}
        <section className="mx-auto max-w-5xl px-6 py-12 border-t border-border/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Built for someone different?
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(AUDIENCES)
              .filter((a) => a.slug !== cfg.slug)
              .map((a) => (
                <Link
                  key={a.slug}
                  href={`/for/${a.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-orange-500/40 hover:text-orange-600"
                >
                  {a.navLabel} →
                </Link>
              ))}
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
