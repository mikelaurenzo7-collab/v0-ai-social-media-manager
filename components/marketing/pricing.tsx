'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Plan {
  name: string
  description: string
  price: number
  features: string[]
  cta: string
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: 'For testing the waters',
    price: 0,
    features: [
      '25 generations / month',
      '1 connected account per platform',
      'All 7 platform agents',
      '3 variations per prompt',
      '10 saved drafts',
    ],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    description: 'For creators &amp; founders',
    price: 19,
    features: [
      'Unlimited generations',
      'All 8 channels (incl. Gmail + Outlook)',
      '5 variations per prompt',
      'Smart scheduling + Auto-Pilot',
      'Honest analytics',
      'Priority email support',
    ],
    cta: 'Start 7-day Pro trial',
    highlight: true,
  },
  {
    name: 'Team',
    description: 'For agencies &amp; teams',
    price: 49,
    features: [
      'Everything in Pro',
      'Up to 5 seats',
      'Multiple brand profiles',
      'Approval workflows',
      'Shared draft library',
      'Dedicated support',
    ],
    cta: 'Talk to sales',
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            Pricing
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            Simple. Honest. <span className="gradient-text">Worth it.</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Start free, upgrade when you&apos;re shipping daily. No surprise overages.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 backdrop-blur">
            <button
              onClick={() => setAnnual(false)}
              className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                !annual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                annual ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                –20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const monthly = annual ? Math.round(plan.price * 0.8) : plan.price
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-7 ${
                  plan.highlight
                    ? 'border-gradient'
                    : 'border border-border/70 bg-card'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                )}
                <div className="relative">
                  <h3 className="font-display text-3xl tracking-tight">{plan.name}</h3>
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: plan.description }}
                  />
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-5xl tabular tracking-tight">${monthly}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.price === 0 ? '/forever' : annual ? '/mo · billed annually' : '/mo'}
                    </span>
                  </div>

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      plan.highlight
                        ? 'btn-gradient'
                        : 'border border-border bg-card text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {plan.highlight && (
                    <div className="mt-4 flex items-center justify-center">
                      <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-emerald-500/20">
                        Cancel anytime
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prices in USD. Annual plans billed yearly. Need an enterprise SLA?{' '}
          <Link href="#contact" className="font-medium text-foreground underline-offset-4 hover:underline">
            Talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
