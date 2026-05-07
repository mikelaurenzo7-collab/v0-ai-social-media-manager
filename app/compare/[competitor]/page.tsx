import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { COMPETITORS } from '@/lib/competitors'
import { cn } from '@/lib/utils'

export function generateStaticParams() {
  return Object.keys(COMPETITORS).map((competitor) => ({ competitor }))
}

interface Params { competitor: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { competitor } = await params
  const cfg = COMPETITORS[competitor as keyof typeof COMPETITORS]
  if (!cfg) return { title: 'Compare' }
  return {
    title: `PostPilot vs. ${cfg.name}`,
    description: `${cfg.tagline} — an honest comparison of where ${cfg.name} wins, where PostPilot wins, and who should pick which.`,
  }
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { competitor } = await params
  const cfg = COMPETITORS[competitor as keyof typeof COMPETITORS]
  if (!cfg) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-50"
            style={{
              background:
                'radial-gradient(35% 35% at 30% 30%, oklch(0.652 0.214 36 / 0.16), transparent 60%),' +
                'radial-gradient(35% 35% at 70% 25%, oklch(0.588 0.238 352 / 0.14), transparent 60%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[400px] bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
              {cfg.navLabel}
            </p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-balance">
              {cfg.tagline}
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {cfg.shortIntro}
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

        {/* Where they win — honest */}
        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Where {cfg.name} is great
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Honesty before pitch — these are the things they earned, and we&apos;re not pretending otherwise.
          </p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {cfg.theyDoWell.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 text-[13px] leading-relaxed"
              >
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Where we differ */}
        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 border-t border-border/60">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Where we differ</h2>
          <div className="mt-8 space-y-4">
            {cfg.whereWeDiffer.map((row) => (
              <Card key={row.dim}>
                <CardContent className="p-5 grid gap-4 sm:grid-cols-[1fr_2fr]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Dimension
                    </p>
                    <p className="mt-1 text-sm font-bold">{row.dim}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {cfg.name}
                      </p>
                      <p className="text-[13px] leading-relaxed">{row.them}</p>
                    </div>
                    <div className="rounded-lg border border-orange-300/50 bg-orange-50/40 dark:bg-orange-500/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-1">
                        PostPilot
                      </p>
                      <p className="text-[13px] leading-relaxed">{row.us}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature matrix */}
        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 border-t border-border/60">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Side by side</h2>
          <Card className="mt-6 overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Feature
                    </th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      {cfg.name}
                    </th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-orange-700 whitespace-nowrap">
                      PostPilot
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.features.map((f, i) => (
                    <tr key={f.feature} className={i % 2 === 0 ? '' : 'bg-muted/15'}>
                      <td className="px-5 py-3">{f.feature}</td>
                      <td className="text-center px-5 py-3"><Mark val={f.them} /></td>
                      <td className="text-center px-5 py-3"><Mark val={f.us} highlight /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <p className="mt-3 text-[11px] text-muted-foreground italic">
            Built from public docs + first-hand use. If we got something wrong, email{' '}
            <a className="text-orange-600 hover:underline" href="mailto:hello@postpilot.app?subject=Comparison%20correction">
              hello@postpilot.app
            </a>{' '}
            and we&apos;ll fix it the same day.
          </p>
        </section>

        {/* Who should stay vs. switch */}
        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 border-t border-border/60">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Who should pick which</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Badge className="mb-3 text-[10px] bg-muted text-muted-foreground border border-border/60">
                  Stay with {cfg.name}
                </Badge>
                <p className="text-sm leading-relaxed text-foreground/85">{cfg.whoShouldStay}</p>
              </CardContent>
            </Card>
            <Card className="border-orange-300/50">
              <CardContent className="p-6">
                <Badge className="mb-3 text-[10px] bg-orange-500/15 text-orange-700 border border-orange-300/60">
                  Switch to PostPilot
                </Badge>
                <p className="text-sm leading-relaxed text-foreground/85">{cfg.whoShouldSwitch}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Other comparisons */}
        <section className="mx-auto max-w-4xl px-6 py-12 border-t border-border/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Compare with others
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(COMPETITORS)
              .filter((c) => c.slug !== cfg.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-orange-500/40 hover:text-orange-600"
                >
                  vs. {c.name} →
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

function Mark({ val, highlight }: { val: 'yes' | 'no' | 'limited' | string; highlight?: boolean }) {
  if (val === 'no') {
    return <span className="inline-block text-rose-500" aria-label="No">✕</span>
  }
  if (val === 'limited') {
    return (
      <span className={cn('inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest', highlight ? 'border-amber-300 text-amber-700 bg-amber-500/10' : 'border-amber-300/60 text-amber-700 bg-amber-500/5')}>
        Limited
      </span>
    )
  }
  if (val === 'yes') {
    return (
      <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full', highlight ? 'bg-emerald-500 text-white' : 'bg-emerald-500/15 text-emerald-600')} aria-label="Yes">
        ✓
      </span>
    )
  }
  return <span className="text-[11px] text-emerald-700 font-semibold">{val}</span>
}
