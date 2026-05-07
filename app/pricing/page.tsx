'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PlanId = 'free' | 'pro' | 'business' | 'enterprise'
type Cycle = 'monthly' | 'yearly'

interface Plan {
  id: PlanId
  name: string
  blurb: string
  monthly: number | null
  yearly: number | null
  highlighted?: boolean
  features: string[]
  cta: string
  ctaHref: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Try every agent. One channel each.',
    monthly: 0,
    yearly: 0,
    features: [
      'All 6 agents · 25 generations / mo',
      '1 connected account per channel',
      'Brand Kit (1 voice sample)',
      'Drafts only — no publishing',
      'Community support',
    ],
    cta: 'Start free',
    ctaHref: '/signup',
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'Solo founders + creators shipping daily.',
    monthly: 29,
    yearly: 24,
    highlighted: true,
    features: [
      'Unlimited generations',
      'All 6 agents fully customizable',
      'Unlimited connected accounts',
      'Auto-Pilot + Approvals',
      'Studio (multi-format remix)',
      'Brand Kit voice fingerprint',
      'Inbox triage with AI replies',
      'Insights + Trends',
      'Priority email support',
    ],
    cta: 'Start Pro',
    ctaHref: '/signup?plan=pro',
  },
  {
    id: 'business',
    name: 'Business',
    blurb: 'Teams and small agencies. Roles + audit + scale.',
    monthly: 99,
    yearly: 79,
    features: [
      'Everything in Pro',
      '10 team members included',
      'Roles: Owner / Admin / Editor / Approver / Viewer',
      'Workspace audit log',
      'Public REST API + webhooks',
      'SSO (Google + Microsoft)',
      '99.9% uptime SLA',
      'Priority support · 2h response',
    ],
    cta: 'Start Business',
    ctaHref: '/signup?plan=business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    blurb: 'Agencies > 10 clients, regulated industries, custom needs.',
    monthly: null,
    yearly: null,
    features: [
      'Everything in Business',
      'Unlimited team members',
      'Multi-workspace operator console',
      'SOC 2 Type 2 + DPA + custom MSA',
      'Audit log SIEM stream',
      'Custom data residency',
      'Dedicated CSM + onboarding',
      'Custom rate limits + volume pricing',
    ],
    cta: 'Talk to sales',
    ctaHref: 'mailto:sales@postpilot.app?subject=Enterprise%20plan',
  },
]

type Cell = boolean | string

interface CompareRow {
  feature: string
  free: Cell
  pro: Cell
  business: Cell
  enterprise: Cell
}

interface CompareSection {
  heading: string
  rows: CompareRow[]
}

const SECTIONS: CompareSection[] = [
  {
    heading: 'Agents',
    rows: [
      { feature: 'Channel agents', free: 'All 6', pro: 'All 6', business: 'All 6', enterprise: 'All 6' },
      { feature: 'AI generations / month', free: '25', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Per-agent customization', free: false, pro: true, business: true, enterprise: true },
      { feature: 'Adaptive memory', free: 'Limited', pro: true, business: true, enterprise: true },
      { feature: 'Per-agent permissions', free: false, pro: true, business: true, enterprise: true },
      { feature: 'Studio (multi-format remix)', free: false, pro: true, business: true, enterprise: true },
    ],
  },
  {
    heading: 'Publishing',
    rows: [
      { feature: 'Connected accounts', free: '1 per channel', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
      { feature: 'Manual publish', free: false, pro: true, business: true, enterprise: true },
      { feature: 'Auto-Pilot', free: false, pro: true, business: true, enterprise: true },
      { feature: 'Approvals queue', free: false, pro: 'Single approver', business: 'Multi-stage', enterprise: 'Multi-stage' },
      { feature: 'Crisis Mode', free: true, pro: true, business: true, enterprise: true },
      { feature: 'Scheduled posts', free: '5 / mo', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
    ],
  },
  {
    heading: 'Workspace',
    rows: [
      { feature: 'Team members', free: '1', pro: '1', business: '10 included', enterprise: 'Unlimited' },
      { feature: 'Roles + agent access matrix', free: false, pro: false, business: true, enterprise: true },
      { feature: 'Workspace audit log', free: false, pro: false, business: '13 months', enterprise: '7 years + custom' },
      { feature: 'SSO (Google + Microsoft)', free: false, pro: false, business: true, enterprise: true },
      { feature: 'Multi-workspace operator console', free: false, pro: false, business: false, enterprise: true },
    ],
  },
  {
    heading: 'Developer',
    rows: [
      { feature: 'REST API', free: false, pro: false, business: true, enterprise: true },
      { feature: 'Webhooks (HMAC-signed)', free: false, pro: false, business: true, enterprise: true },
      { feature: 'API rate limit', free: '—', pro: '—', business: '600 req / min', enterprise: 'Custom' },
      { feature: 'SIEM stream', free: false, pro: false, business: false, enterprise: true },
    ],
  },
  {
    heading: 'Trust + support',
    rows: [
      { feature: 'Token encryption (AES-256-GCM)', free: true, pro: true, business: true, enterprise: true },
      { feature: 'SOC 2 Type 1', free: true, pro: true, business: true, enterprise: true },
      { feature: 'SOC 2 Type 2', free: 'Q4 2026', pro: 'Q4 2026', business: 'Q4 2026', enterprise: 'Q4 2026' },
      { feature: 'Custom data residency', free: false, pro: false, business: false, enterprise: true },
      { feature: 'DPA on request', free: true, pro: true, business: true, enterprise: true },
      { feature: 'Support', free: 'Community', pro: 'Email · 24h', business: 'Priority · 2h', enterprise: 'Dedicated CSM' },
      { feature: '99.9% uptime SLA', free: false, pro: false, business: true, enterprise: true },
    ],
  },
]

const FAQ = [
  {
    q: 'Can I switch plans any time?',
    a: 'Yes — pro-rated to the day. Upgrades take effect immediately; downgrades happen at the end of the current period so you don\'t lose what you paid for.',
  },
  {
    q: 'Do you charge per seat or per workspace?',
    a: 'Pro is per user. Business is per workspace and includes 10 seats. Enterprise pricing is custom — usually based on workspaces and total volume.',
  },
  {
    q: 'Is there a yearly discount?',
    a: 'Yes — about 17% off when paid yearly. The toggle on this page shows the effective monthly price either way.',
  },
  {
    q: 'What\'s your refund policy?',
    a: '30-day no-questions-asked refund from your first payment. After that, cancel any time and your plan stays active until the end of the period — no pro-rated refunds, no cancellation fees, no exit surveys.',
  },
  {
    q: 'Do you train models on my content?',
    a: 'No. Your content travels to model providers (Anthropic Claude is our primary) only to fulfill your immediate request. We have signed DPAs with each provider explicitly forbidding training on your inputs.',
  },
  {
    q: 'How do generations get counted on Free?',
    a: 'Each agent response that produces text or a tool call counts as one generation. Edits and re-runs of the same prompt are separate generations. Free plans get 25 / month; Pro and above are unlimited.',
  },
  {
    q: 'Can I bring my own LLM API key?',
    a: 'Not yet — Enterprise plans can request it. We\'re weighing it carefully because key management is the kind of thing that breaks quietly at 3 AM if it\'s not done right.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'You can export everything (drafts, posts, brand kits, agents, audit log) before you cancel. We purge production within 7 days of deletion and backups within 30. We retain financial records (invoices) where required by law.',
  },
]

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>('yearly')

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
          <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Pricing</p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-balance">
              Honest pricing.
              <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                No surprise seats. No annual lock-ins.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
              Same six channel agents on every plan. Free is real (try the agents, draft for keeps, no
              publish). Pro removes every limit for solo. Business adds the team layer. Enterprise adds
              the compliance layer.
            </p>
            <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-border/60 p-1 bg-card">
              {(['monthly', 'yearly'] as Cycle[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cycle === c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors',
                    cycle === c
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c === 'yearly' ? 'Yearly · 17% off' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Plan cards */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => {
              const price = cycle === 'monthly' ? p.monthly : p.yearly
              return (
                <Card
                  key={p.id}
                  className={cn(
                    'flex flex-col relative overflow-hidden transition-shadow hover:shadow-md',
                    p.highlighted && 'ring-2 ring-orange-500/40 shadow-md',
                  )}
                >
                  {p.highlighted && <div className="absolute top-0 inset-x-0 h-1 bg-brand" aria-hidden />}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{p.name}</h3>
                      {p.highlighted && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-orange-500/15 text-orange-700 border-orange-200">
                          Most popular
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.blurb}</p>
                    <div className="mt-4">
                      {price !== null ? (
                        <>
                          <span className="text-4xl font-black tabular-nums">${price}</span>
                          <span className="text-[12px] text-muted-foreground"> /mo</span>
                          {cycle === 'yearly' && p.monthly && p.monthly > 0 && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              <span className="line-through tabular-nums">${p.monthly}</span> billed yearly
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-3xl font-black">Custom</span>
                      )}
                    </div>
                    <Button
                      asChild
                      className={cn('mt-5 text-xs', p.highlighted && 'bg-brand text-white shadow-brand')}
                      variant={p.highlighted ? 'default' : 'outline'}
                      style={p.highlighted ? { background: 'var(--brand-gradient)' } : undefined}
                    >
                      <Link href={p.ctaHref}>{p.cta}</Link>
                    </Button>
                    <ul className="mt-6 space-y-2 text-[12.5px]">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-6xl px-6 py-12 border-t border-border/60">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Compare every plan</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every feature, every plan. No asterisks, no &quot;contact us for details.&quot;
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Feature
                    </th>
                    {PLANS.map((p) => (
                      <th
                        key={p.id}
                        className={cn(
                          'text-center px-5 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap',
                          p.highlighted ? 'text-orange-700' : 'text-muted-foreground',
                        )}
                      >
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SECTIONS.map((section) => (
                    <FeatureSection key={section.heading} section={section} />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20 border-t border-border/60">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing questions, answered</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border/60 bg-card transition-colors hover:bg-muted/30"
              >
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none px-5 py-4">
                  <span className="text-sm font-bold leading-snug">{item.q}</span>
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-[13px] leading-relaxed text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}

function FeatureSection({ section }: { section: CompareSection }) {
  return (
    <>
      <tr className="bg-muted/20">
        <td colSpan={5} className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {section.heading}
        </td>
      </tr>
      {section.rows.map((row, i) => (
        <tr key={row.feature} className={i % 2 === 0 ? '' : 'bg-muted/10'}>
          <td className="px-5 py-3 text-[13px]">{row.feature}</td>
          <td className="text-center px-5 py-3"><CompareCell value={row.free} /></td>
          <td className="text-center px-5 py-3 bg-orange-500/5"><CompareCell value={row.pro} highlight /></td>
          <td className="text-center px-5 py-3"><CompareCell value={row.business} /></td>
          <td className="text-center px-5 py-3"><CompareCell value={row.enterprise} /></td>
        </tr>
      ))}
    </>
  )
}

function CompareCell({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === false) return <span className="text-rose-400/70" aria-label="Not included">—</span>
  if (value === true) {
    return (
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-full',
          highlight ? 'bg-emerald-500 text-white' : 'bg-emerald-500/15 text-emerald-700',
        )}
        aria-label="Included"
      >
        ✓
      </span>
    )
  }
  return <span className="text-[12px] font-semibold">{value}</span>
}
