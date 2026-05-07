import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'

export const metadata = {
  title: 'Press kit',
  description:
    'Logos, colors, screenshots, and the one-line pitch. Everything press, partners, and reviewers need.',
}

const QUICK_FACTS = [
  { label: 'Founded', value: '2024' },
  { label: 'HQ', value: 'San Francisco · Lisbon · Toronto' },
  { label: 'Team', value: '6 humans + 6 agents' },
  { label: 'Funding', value: 'Bootstrapped' },
  { label: 'Status', value: 'Public beta' },
  { label: 'Customers', value: 'Thousands of solo founders, agencies, and creators' },
]

const COLORS = [
  { name: 'Brand orange', hex: '#EA580C', use: 'Primary CTA, key affordances' },
  { name: 'Brand pink', hex: '#DB2777', use: 'Gradient end, accents' },
  { name: 'Amber', hex: '#F59E0B', use: 'Warm gradient start' },
  { name: 'Coral', hex: '#FB7185', use: 'Soft highlights' },
  { name: 'Espresso', hex: '#1A120E', use: 'Sidebar, dark surfaces' },
  { name: 'Cream', hex: '#FFF8F2', use: 'Light background' },
]

const PITCHES = [
  {
    label: 'One-liner',
    body:
      'PostPilot is six specialist AI agents — one per channel — that draft, design, and publish through real OAuth.',
  },
  {
    label: 'Two-liner',
    body:
      'PostPilot gives every brand six AI agents — one specialized for X, Meta, LinkedIn, TikTok, Gmail, and Outlook. They learn your voice from a Brand Kit, propose drafts, and (with your approval) publish through real OAuth.',
  },
  {
    label: 'Paragraph',
    body:
      'PostPilot is the AI co-pilot for social and email. Six channel-specialist agents — one each for X, Meta, LinkedIn, TikTok, Gmail, and Outlook — draft, design, schedule, and engage on your behalf, learning your voice from a Brand Kit and adapting from your approvals + edits. Everything is permission-gated and audit-logged. Approval is on by default; Crisis Mode pauses every agent server-side with one tap. Built for solo founders shipping daily, agencies running ten clients, and creators tired of being a one-person production team.',
  },
]

export default function PressPage() {
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
          <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Press kit</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              Everything you need.{' '}
              <span className="text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                In one place.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
              For journalists, partners, and creators reviewing or talking about PostPilot. Pull a quote,
              grab a logo, send the right person an email — same page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" style={{ background: 'var(--brand-gradient)' }}>
                <a href="mailto:press@postpilot.app">Email press@postpilot.app</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">Read the manifesto →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="text-2xl font-bold tracking-tight">Quick facts</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_FACTS.map((f) => (
              <div key={f.label} className="rounded-2xl border border-border/60 bg-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</p>
                <p className="mt-1 text-sm font-bold">{f.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pitches — copy-ready */}
        <section className="mx-auto max-w-4xl px-6 py-14 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Copy-ready pitches</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The version you need at the length you need. Lift verbatim — that&apos;s the point.
          </p>
          <div className="mt-6 space-y-3">
            {PITCHES.map((p) => (
              <Card key={p.label}>
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {p.label}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed">{p.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Logos */}
        <section className="mx-auto max-w-4xl px-6 py-14 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Logo + wordmark</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use whichever fits the surface. Do leave at least the logo&apos;s height of clear space around it.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <LogoSwatch label="On light" backgroundClass="bg-card" textWhite={false} />
            <LogoSwatch label="On dark" backgroundClass="bg-[oklch(0.135_0.018_48)]" textWhite={true} />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            High-resolution SVG + PNG bundles available — email{' '}
            <a className="text-orange-600 hover:underline" href="mailto:press@postpilot.app?subject=Press%20kit%20assets">
              press@postpilot.app
            </a>
            .
          </p>
        </section>

        {/* Colors */}
        <section className="mx-auto max-w-4xl px-6 py-14 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Brand colors</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div
                  className="h-24 w-full"
                  style={{ background: c.hex }}
                  aria-label={`${c.name} swatch ${c.hex}`}
                />
                <div className="p-3">
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">{c.hex}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{c.use}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pronunciation + style */}
        <section className="mx-auto max-w-4xl px-6 py-14 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Style notes</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Naming
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  <strong>PostPilot</strong> — one word, two capitals. Not &quot;Post Pilot&quot; or
                  &quot;Postpilot&quot;.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  How to say it
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  &quot;post-PIE-lit&quot; — like a pilot of posts, not the pilot of a post.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Agents are platforms
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Our agents are named for the channel they own — <strong>X Agent</strong>,{' '}
                  <strong>Meta Agent</strong>, <strong>LinkedIn Agent</strong>, etc. No personal names.
                  Customers rename them whatever they want.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Voice
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Direct, grounded, no hype. Specific over vague. Numbers over adjectives. We avoid
                  &quot;leverage&quot;, &quot;synergy&quot;, &quot;unlock&quot;.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contacts */}
        <section className="mx-auto max-w-4xl px-6 py-14 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Reach the right person</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { who: 'Press', email: 'press@postpilot.app', sla: '24h response' },
              { who: 'Partnerships', email: 'partners@postpilot.app', sla: '48h response' },
              { who: 'Security', email: 'security@postpilot.app', sla: '1h response' },
              { who: 'Anything else', email: 'hello@postpilot.app', sla: '48h response' },
            ].map((c) => (
              <a
                key={c.email}
                href={`mailto:${c.email}`}
                className="group rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-bold">{c.who}</p>
                <p className="mt-1 text-xs font-mono text-orange-600 group-hover:underline">{c.email}</p>
                <p className="mt-2 text-[10px] text-muted-foreground">{c.sla}</p>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function LogoSwatch({
  label,
  backgroundClass,
  textWhite,
}: {
  label: string
  backgroundClass: string
  textWhite: boolean
}) {
  return (
    <div className={`rounded-2xl border border-border/60 ${backgroundClass} overflow-hidden`}>
      <div className="flex h-32 items-center justify-center">
        <Logo size={36} wordmark wordmarkClassName={`text-[1.55rem] ${textWhite ? 'text-white' : ''}`} />
      </div>
      <div className="border-t border-border/30 px-4 py-2 flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${textWhite ? 'text-white/70' : 'text-muted-foreground'}`}>
          {label}
        </span>
        <span className={`text-[10px] ${textWhite ? 'text-white/45' : 'text-muted-foreground'}`}>
          Email for SVG + PNG
        </span>
      </div>
    </div>
  )
}
