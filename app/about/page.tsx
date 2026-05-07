import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'About',
  description:
    'PostPilot is a small team building specialist AI agents for social and email. We ship every week, in the open, and we don\'t train shared models on your content.',
}

const VALUES = [
  {
    emoji: '🪞',
    title: 'Voice over volume',
    body: "More posts is not the win. The right posts in your voice, on the right channel, at the right moment is. We build for that — not for content factories.",
  },
  {
    emoji: '🛡',
    title: 'Earn the trust, every day',
    body: "OAuth tokens encrypted at rest with per-user keys. Audit log on everything that moves. We never train shared models on your content. We say what's enforced server-side and what's not.",
  },
  {
    emoji: '🎚',
    title: 'You stay in control',
    body: "Default mode is approval-required. Crisis Mode pauses every agent in one tap, server-side. Every memory the agent learns is editable, explainable, and yours.",
  },
  {
    emoji: '🛠',
    title: 'Ship like you mean it',
    body: "We ship weekly. We change our minds in public. The roadmap is open. The changelog is honest about what landed and what didn't. The status page tells the truth.",
  },
  {
    emoji: '🌍',
    title: 'Small team, big leverage',
    body: "We're a tiny team using the same agents we sell. If we can run a company on it, we know it actually works. If it breaks for us, we feel it before you do.",
  },
  {
    emoji: '👤',
    title: 'No personalities — only platforms',
    body: "Our agents are named for the channel they own. X Agent, Meta Agent, LinkedIn Agent. You name them whatever you want. Persona is yours to define, not ours to impose.",
  },
]

const TEAM = [
  {
    initials: 'DL',
    name: 'Demi Laurence',
    role: 'Founder & CEO',
    blurb: 'Previously growth lead at a fintech with a content-team-of-one. Now obsessed with making that team-of-one actually scale.',
    hue: 'from-orange-500 to-pink-600',
  },
  {
    initials: 'PM',
    name: 'Priya Menon',
    role: 'Head of Engineering',
    blurb: 'Built realtime systems at scale. Cares about audit logs, encryption, and the right error message at 3am.',
    hue: 'from-violet-500 to-purple-600',
  },
  {
    initials: 'TW',
    name: 'Theo Williams',
    role: 'Head of Design',
    blurb: 'Comes from agencies running 30+ clients. Designed PostPilot the way he wishes the tools at his last shop had been designed.',
    hue: 'from-sky-500 to-blue-600',
  },
  {
    initials: 'OP',
    name: 'Olivia Park',
    role: 'Head of AI',
    blurb: 'Spent years on prompt evaluation and tool-use systems. Designs the agent personalities that ship as defaults.',
    hue: 'from-emerald-500 to-teal-600',
  },
]

const NUMBERS = [
  { value: '2024', label: 'Founded' },
  { value: '6', label: 'People shipping' },
  { value: '99.97%', label: '90-day uptime' },
  { value: '0', label: 'Models trained on your content' },
]

export default function AboutPage() {
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
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[480px] bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">About</p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-balance">
              Software that does the boring part.
              <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                So you can do the part that matters.
              </span>
            </h1>
            <p className="mt-7 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              PostPilot is six specialist AI agents — one per channel — that draft, design, schedule,
              and publish through real OAuth. They learn your voice, your audience, and what actually
              works on each platform. You stay in control of every word.
            </p>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              We&apos;re a small team using the same agents we sell. If they work for us, we know
              they work for you. If they don&apos;t, we&apos;re the first ones to feel it.
            </p>
          </div>
        </section>

        {/* Numbers */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {NUMBERS.map((n) => (
              <div
                key={n.label}
                className="rounded-2xl border border-border/60 bg-card p-4 text-center"
              >
                <p className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight">{n.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {n.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Manifesto / values */}
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border/60">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Manifesto</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              How we build, in six lines.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <Card key={v.title}>
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{v.emoji}</div>
                  <h3 className="text-base font-bold leading-tight">{v.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{v.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border/60">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">The team</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Six people, six agents.{' '}
              <span className="text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                Same ratio.
              </span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              We don&apos;t need a marketing department. The agents are it. They post for us across the
              same six channels. The team you see below is who ships everything else.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {TEAM.map((p) => (
              <Card key={p.name}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-sm bg-gradient-to-br ${p.hue}`}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[11px] font-semibold text-orange-600">{p.role}</p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{p.blurb}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trust links */}
        <section className="mx-auto max-w-5xl px-6 py-12 border-t border-border/60">
          <div
            className="rounded-3xl p-8 sm:p-10 text-white"
            style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48), oklch(0.21 0.05 30))' }}
          >
            <h3 className="text-2xl font-bold tracking-tight">The receipts</h3>
            <p className="mt-2 text-sm text-white/75 max-w-xl leading-relaxed">
              Trust is a verb. Here&apos;s where we keep ours honest:
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { href: '/changelog', label: 'Changelog' },
                { href: '/roadmap', label: 'Public roadmap' },
                { href: '/security', label: 'Security' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/status', label: 'System status' },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
