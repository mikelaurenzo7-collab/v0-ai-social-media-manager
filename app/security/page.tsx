import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Security',
  description: 'How PostPilot protects your accounts, content, and tokens.',
}

const PILLARS = [
  {
    icon: '🔐',
    title: 'Encryption everywhere',
    body: 'TLS 1.3 in transit. AES-256-GCM at rest. OAuth tokens encrypted with per-user keys derived via HKDF. Backups encrypted with separate keys, separately rotated.',
  },
  {
    icon: '🛡️',
    title: 'Least privilege by default',
    body: 'When you connect a platform, we ask for the minimum scope needed for each feature. Want to read DMs? You opt in. Want to post? You opt in. No surprise scopes.',
  },
  {
    icon: '🧱',
    title: 'Tenant isolation',
    body: 'Postgres row-level security on every multi-tenant table, plus a session-level tenant setter, plus audit triggers. Three layers, because one is brittle.',
  },
  {
    icon: '👀',
    title: 'Audit logs you control',
    body: 'Every authentication, OAuth flow, API call, and data export is logged. Business plan can stream the audit log to your SIEM via webhook.',
  },
  {
    icon: '🔄',
    title: 'Backup & recovery',
    body: 'Encrypted point-in-time backups every 5 minutes, replicated across 3 regions. Quarterly restore drills. RPO 5 min, RTO 1 hour.',
  },
  {
    icon: '🚨',
    title: 'Incident response',
    body: '24/7 on-call. We commit to acknowledging security incidents within 1 hour, posting to /status within 4 hours, and a public RCA within 72 hours (3 days).',
  },
]

const CERTIFICATIONS = [
  { label: 'SOC 2 Type 1', status: 'Audit complete · Q1 2026', color: 'emerald' },
  { label: 'SOC 2 Type 2', status: 'Audit window open · Q4 2026', color: 'amber' },
  { label: 'GDPR', status: 'Compliant · DPA on request', color: 'emerald' },
  { label: 'CCPA', status: 'Compliant', color: 'emerald' },
  { label: 'HIPAA', status: 'Available on Enterprise', color: 'amber' },
  { label: 'ISO 27001', status: 'Roadmap · 2027', color: 'slate' },
]

const SUBPROCESSORS = [
  { name: 'Amazon Web Services', purpose: 'Hosting, storage, networking', region: 'us-east-1, eu-west-1' },
  { name: 'Vercel', purpose: 'Edge delivery, build infrastructure', region: 'Global edge' },
  { name: 'Anthropic', purpose: 'Primary AI model provider', region: 'United States' },
  { name: 'Stripe', purpose: 'Payment processing', region: 'United States' },
  { name: 'Resend', purpose: 'Transactional email', region: 'United States' },
  { name: 'Sentry', purpose: 'Error monitoring (PII scrubbed)', region: 'United States' },
]

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background: 'radial-gradient(circle at top right, oklch(0.652 0.214 36 / 0.08), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Security at PostPilot</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight max-w-3xl">
              Engineered like the data is ours.
              <span className="block text-muted-foreground font-normal italic" style={{ fontFamily: 'var(--font-display)' }}>
                Because to us, it kind of is.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
              You&apos;re trusting us with the keys to your audience. We take that seriously. Here&apos;s what we do —
              and what we&apos;re honest about not doing yet.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs px-3 py-1.5">SOC 2 Type 1 ✓</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5">GDPR ✓</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5">CCPA ✓</Badge>
              <Badge variant="outline" className="text-xs px-3 py-1.5">99.9% uptime SLA</Badge>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">How we protect your data</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <Card key={p.title}>
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="font-bold text-base">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">Compliance &amp; certifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">Honest status. We&apos;ll never claim a cert we don&apos;t have.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      c.color === 'emerald' ? 'bg-emerald-500' : c.color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  />
                  <p className="font-bold text-sm">{c.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{c.status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Subprocessors */}
        <section id="subprocessors" className="mx-auto max-w-5xl px-6 py-16 border-t border-border/60 scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight">Sub-processors</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            The vendors we depend on, what they do, and where your data lives. We notify you 30 days
            before adding a new one. Subscribe to changes:
            <a href="mailto:trust@postpilot.app?subject=Subscribe%20to%20subprocessor%20changes" className="ml-1 text-orange-600 hover:underline">
              trust@postpilot.app
            </a>.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Vendor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Purpose</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Region</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s, i) => (
                  <tr key={s.name} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="px-5 py-3 font-semibold">{s.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.purpose}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Disclosure */}
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border/60">
          <div
            className="rounded-3xl p-8 sm:p-10 text-white"
            style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48), oklch(0.21 0.05 30))' }}
          >
            <h2 className="text-2xl font-bold tracking-tight">Found something?</h2>
            <p className="mt-2 text-sm text-white/75 max-w-2xl leading-relaxed">
              We run a responsible disclosure program. Bounties from $250 to $10,000 depending on severity. Encrypt with
              our PGP key. Median time to first response: 6 hours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:security@postpilot.app"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
              >
                Report a vulnerability
              </a>
              <a
                href="/status"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                View live status →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
