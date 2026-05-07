'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PlanId = 'free' | 'pro' | 'business' | 'enterprise'
type BillingCycle = 'monthly' | 'yearly'

interface Plan {
  id: PlanId
  name: string
  blurb: string
  monthly: number | null
  yearly: number | null
  highlighted?: boolean
  features: string[]
  notIncluded?: string[]
  cta: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Try every agent. One channel each.',
    monthly: 0,
    yearly: 0,
    features: [
      'All 6 agents · 25 generations/month',
      '1 connected account per channel',
      'Brand Kit (1 voice sample)',
      'Drafts only — no publishing',
    ],
    notIncluded: ['Auto-Pilot', 'Approvals queue', 'Team members', 'API + webhooks'],
    cta: 'Stay on Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'Solo creators and founders shipping daily.',
    monthly: 29,
    yearly: 24,
    highlighted: true,
    features: [
      'Unlimited generations',
      'All 6 agents, fully customizable',
      'Unlimited connected accounts',
      'Auto-Pilot + Approvals',
      'Studio (multi-format remix)',
      'Brand Kit voice fingerprint',
      'Inbox triage with AI replies',
      'Insights + Trends',
    ],
    notIncluded: ['Team members', 'API + webhooks', 'SSO', 'Audit log SIEM stream'],
    cta: 'Upgrade to Pro',
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
      'Approvals + roles (Editor / Approver / Viewer)',
      'Workspace audit log',
      'Public REST API + webhooks',
      'SSO (Google + Microsoft)',
      '99.9% uptime SLA',
      'Priority support · 2h response',
    ],
    notIncluded: ['Custom data residency', 'Dedicated CSM', 'Volume discounts'],
    cta: 'Upgrade to Business',
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
  },
]

const INVOICES = [
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: 29, status: 'paid', plan: 'Pro · monthly' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: 29, status: 'paid', plan: 'Pro · monthly' },
  { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: 29, status: 'paid', plan: 'Pro · monthly' },
  { id: 'INV-2026-02', date: 'Feb 1, 2026', amount: 29, status: 'paid', plan: 'Pro · monthly' },
  { id: 'INV-2026-01', date: 'Jan 1, 2026', amount: 29, status: 'paid', plan: 'Pro · monthly' },
] as const

export default function BillingPage() {
  const [currentPlan] = useState<PlanId>('pro')
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  const usage = useMemo(
    () => ({
      generations: { used: 1284, cap: null }, // null = unlimited on Pro
      connections: 7,
      members: 4,
      apiCalls: { used: 18420, cap: 600 * 60 * 24 * 30 }, // 600 req/min on Pro
    }),
    [],
  )

  const current = PLANS.find((p) => p.id === currentPlan)!
  const renewsAt = 'Jun 1, 2026'

  function changePlan(id: PlanId) {
    if (id === currentPlan) return
    if (id === 'enterprise') {
      window.location.href = 'mailto:sales@postpilot.app?subject=Enterprise%20plan'
      return
    }
    toast.success(`Switching to ${PLANS.find((p) => p.id === id)?.name}…`, {
      description: 'Stripe checkout would open in production.',
    })
  }

  function downloadInvoice(id: string) {
    toast.success(`Downloading ${id}.pdf`)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Billing"
        description="Plan, invoices, payment, and usage. Switch plans any time — pro-rated to the day."
        action={
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
            {current.name} · renews {renewsAt}
          </Badge>
        }
      />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Current plan + usage */}
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Current plan
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{current.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{current.blurb}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {current.monthly !== null
                    ? `$${current.monthly}/month — renews ${renewsAt}`
                    : 'Custom pricing'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.message('Manage payment method')}>
                  Manage payment
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-600" onClick={() => toast.message('Cancel plan flow')}>
                  Cancel plan
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <UsageCard label="AI generations" used={usage.generations.used} cap={usage.generations.cap} />
              <UsageCard label="Connections" used={usage.connections} cap={null} note="across all channels" />
              <UsageCard label="Team members" used={usage.members} cap={10} note="Business: 10" />
              <UsageCard label="API requests" used={usage.apiCalls.used} cap={usage.apiCalls.cap} note="this month" />
            </div>
          </CardContent>
        </Card>

        {/* Plan comparison */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Plans</h2>
              <p className="text-xs text-muted-foreground">Switch any time. Yearly saves about 17%.</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-border/60 p-1">
              {(['monthly', 'yearly'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  aria-pressed={cycle === c}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest transition-colors',
                    cycle === c
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c === 'yearly' ? 'Yearly · 17% off' : c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => {
              const isCurrent = p.id === currentPlan
              const price = cycle === 'monthly' ? p.monthly : p.yearly
              return (
                <Card
                  key={p.id}
                  className={cn(
                    'flex flex-col relative overflow-hidden transition-shadow',
                    p.highlighted && 'ring-2 ring-orange-500/40 shadow-md',
                    isCurrent && 'border-emerald-300',
                  )}
                >
                  {p.highlighted && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-brand" aria-hidden />
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      {isCurrent && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 border-emerald-200">
                          Current
                        </Badge>
                      )}
                      {p.highlighted && !isCurrent && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-orange-500/15 text-orange-700 border-orange-200">
                          Most popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[12px]">{p.blurb}</CardDescription>
                    <div className="mt-3">
                      {price !== null ? (
                        <>
                          <span className="text-3xl font-black tabular-nums">${price}</span>
                          <span className="text-[11px] text-muted-foreground"> /mo</span>
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
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-1.5 text-[12.5px]">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                      {p.notIncluded?.map((f) => (
                        <li key={f} className="flex items-start gap-2 opacity-50">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="line-through">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'mt-4 w-full text-xs',
                        p.highlighted && !isCurrent && 'bg-brand text-white shadow-brand hover:opacity-90',
                      )}
                      variant={isCurrent ? 'outline' : p.highlighted ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => changePlan(p.id)}
                      style={p.highlighted && !isCurrent ? { background: 'var(--brand-gradient)' } : undefined}
                    >
                      {isCurrent ? 'Your plan' : p.cta}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
            <CardDescription>Card on file. We process payments via Stripe.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-foreground text-[10px] font-black text-background">
                  VISA
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Visa ending in 4242</p>
                  <p className="text-[11px] text-muted-foreground">Expires 04 / 28 · added Jan 2026</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.message('Update card flow')}>
                  Update
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-rose-600" onClick={() => toast.message('Remove card flow')}>
                  Remove
                </Button>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Receipts are emailed to <strong>billing@yourbrand.app</strong>. Update billing email in Settings.
            </p>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Invoices</CardTitle>
              <CardDescription>The last 12 months. Older invoices on request.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Download all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoice</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv, i) => (
                  <tr key={inv.id} className={i % 2 === 0 ? '' : 'bg-muted/15'}>
                    <td className="px-5 py-3 font-mono text-[11px]">{inv.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{inv.date}</td>
                    <td className="px-5 py-3 text-muted-foreground">{inv.plan}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">${inv.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge className="text-[9px] bg-emerald-500/10 text-emerald-700 border-emerald-200 capitalize">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => downloadInvoice(inv.id)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Refund + cancel */}
        <Card className="border-rose-200/60">
          <CardContent className="p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold">Refunds &amp; cancellation</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                30-day no-questions-asked refund window from your first payment. After that, cancel any time and your
                plan stays active until the end of the period — no pro-rated refunds, no cancellation fees, no exit
                surveys you need to fill out.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <a href="mailto:billing@postpilot.app?subject=Refund%20request">Request refund</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Link href="/terms">Read billing terms →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsageCard({
  label,
  used,
  cap,
  note,
}: {
  label: string
  used: number
  cap: number | null
  note?: string
}) {
  const pct = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums">
        {used.toLocaleString()}
        {cap !== null && (
          <span className="text-[11px] font-normal text-muted-foreground">
            {' '}
            / {cap.toLocaleString()}
          </span>
        )}
        {cap === null && <span className="text-[11px] font-normal text-muted-foreground"> · unlimited</span>}
      </p>
      {cap !== null && (
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background:
                pct > 90 ? '#F43F5E' : pct > 70 ? '#F59E0B' : 'var(--brand-gradient)',
            }}
          />
        </div>
      )}
      {note && <p className="mt-1.5 text-[10px] text-muted-foreground">{note}</p>}
    </div>
  )
}
