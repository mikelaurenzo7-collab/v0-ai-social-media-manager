'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  desc: string
  href: string
  cta: string
  isDone: () => boolean
}

const STEPS_BUILDER = (drafts: number, threads: number, brandKit: boolean): Step[] => [
  {
    id: 'connect',
    title: 'Connect a channel',
    desc: 'OAuth into X, Meta, LinkedIn, TikTok, Gmail, or Outlook so your agents can post.',
    href: '/dashboard/accounts',
    cta: 'Connect →',
    isDone: () => false, // hard to detect from client; left manual until backend reports it
  },
  {
    id: 'brand',
    title: 'Train your Brand Kit',
    desc: 'Paste a sample of your voice. Every agent uses it on every request.',
    href: '/dashboard/brand',
    cta: 'Train voice →',
    isDone: () => brandKit,
  },
  {
    id: 'first-draft',
    title: 'Draft your first post',
    desc: 'Run the composer once. AI variations show up in seconds.',
    href: '/dashboard/create',
    cta: 'Open composer →',
    isDone: () => drafts > 0 || threads > 0,
  },
  {
    id: 'agent',
    title: 'Customize an agent',
    desc: 'Open any channel agent and rewrite its persona to fit your brand.',
    href: '/dashboard/agents',
    cta: 'Open agents →',
    isDone: () => false,
  },
  {
    id: 'invite',
    title: 'Invite your team',
    desc: 'Add an approver, editor, or viewer. Roles and audit log included.',
    href: '/dashboard/team',
    cta: 'Invite →',
    isDone: () => false,
  },
]

export function OnboardingChecklist() {
  const [mounted, setMounted] = useState(false)
  const [drafts, setDrafts] = useState(0)
  const [threads, setThreads] = useState(0)
  const [brandKit, setBrandKit] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const d = JSON.parse(localStorage.getItem('postpilot_drafts') ?? '[]')
      setDrafts(Array.isArray(d) ? d.length : 0)
    } catch {
      setDrafts(0)
    }
    try {
      const t = JSON.parse(localStorage.getItem('postpilot_threads') ?? '[]')
      setThreads(Array.isArray(t) ? t.length : 0)
    } catch {
      setThreads(0)
    }
    try {
      const raw = localStorage.getItem('postpilot_brand_kit_v1')
      if (!raw) {
        setBrandKit(false)
      } else {
        const parsed = JSON.parse(raw) as { voiceSamples?: string }
        setBrandKit(typeof parsed?.voiceSamples === 'string' && parsed.voiceSamples.trim().length > 0)
      }
    } catch {
      setBrandKit(false)
    }
    setDismissed(localStorage.getItem('postpilot_onboarding_dismissed') === '1')
  }, [])

  const steps = useMemo(() => STEPS_BUILDER(drafts, threads, brandKit), [drafts, threads, brandKit])
  const done = steps.filter((s) => s.isDone()).length
  const total = steps.length
  const pct = Math.round((done / total) * 100)
  const allDone = done === total

  function dismiss() {
    try {
      localStorage.setItem('postpilot_onboarding_dismissed', '1')
    } catch {
      // ignore
    }
    setDismissed(true)
  }

  if (!mounted || dismissed || allDone) return null

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div
        className="px-5 pt-5 pb-3"
        style={{
          background: 'linear-gradient(135deg, oklch(0.652 0.214 36 / 0.06), oklch(0.588 0.238 352 / 0.04))',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">
              Get started
            </p>
            <h2 className="mt-1 text-lg font-bold leading-tight">
              You&apos;re {pct}% set up
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {done} of {total} steps done. Knock these out and your agents are off to the races.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            aria-label="Dismiss onboarding checklist"
          >
            Dismiss
          </button>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #EA580C, #DB2777)',
            }}
          />
        </div>
      </div>
      <CardContent className="p-2">
        {steps.map((s) => {
          const isDone = s.isDone()
          return (
            <Link
              key={s.id}
              href={s.href}
              className={cn(
                'flex items-start gap-3 rounded-xl px-3 py-3 transition-colors group',
                isDone ? 'opacity-60' : 'hover:bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-border bg-background',
                )}
              >
                {isDone && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn('text-sm font-semibold', isDone && 'line-through')}>{s.title}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              {!isDone && (
                <span
                  className="shrink-0 self-center text-[11px] font-bold whitespace-nowrap text-orange-600 group-hover:text-orange-700"
                >
                  {s.cta}
                </span>
              )}
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
