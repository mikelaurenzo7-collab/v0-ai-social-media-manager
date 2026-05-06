'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    features: [
      '25 AI generations per month',
      'All 3 platforms (X, Instagram, Facebook)',
      '3 content variations per prompt',
      'Save up to 10 drafts',
      'Basic tone options',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For creators who post regularly',
    price: '$19',
    period: 'per month',
    features: [
      'Unlimited AI generations',
      'All 3 platforms',
      '5 content variations per prompt',
      'Unlimited drafts',
      'Advanced tone & style options',
      'Hashtag optimization',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Team',
    description: 'For agencies and businesses',
    price: '$49',
    period: 'per month',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Multiple brand profiles',
      'Content approval workflow',
      'Analytics dashboard',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-6 w-11 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-muted'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                annual ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Annual
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mt-2 mb-6">
                  <span className="text-4xl font-bold">
                    {annual && plan.price !== '$0' 
                      ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` 
                      : plan.price}
                  </span>
                  {plan.price !== '$0' && (
                    <span className="text-muted-foreground">/{annual ? 'month, billed annually' : plan.period}</span>
                  )}
                  {plan.price === '$0' && (
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
