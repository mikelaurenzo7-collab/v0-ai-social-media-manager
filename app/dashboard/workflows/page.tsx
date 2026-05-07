'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type TriggerKind = 'schedule' | 'event' | 'manual'

interface RecipeTemplate {
  id: string
  title: string
  desc: string
  emoji: string
  category: 'growth' | 'engagement' | 'reporting' | 'cross-channel'
  triggerKind: TriggerKind
  trigger: string
  steps: { agent: string; action: string }[]
  premium?: boolean
}

interface ActiveWorkflow {
  id: string
  title: string
  triggerKind: TriggerKind
  trigger: string
  agents: string[]
  enabled: boolean
  runs: number
  lastRan: string
  successRate: number
}

const TEMPLATES: RecipeTemplate[] = [
  {
    id: 'tpl-weekly-thread',
    title: 'Weekly thread on launch lessons',
    desc: 'Every Friday, the X Agent drafts a thread, asks for approval, and publishes once approved.',
    emoji: '🧵',
    category: 'growth',
    triggerKind: 'schedule',
    trigger: 'Every Friday · 4:30 PM',
    steps: [
      { agent: 'X Agent', action: 'Draft a 5-tweet thread on this week\'s lessons' },
      { agent: 'Approval', action: 'Send to approvers · 1h SLA' },
      { agent: 'X Agent', action: 'Publish once approved · pin for 48h' },
    ],
  },
  {
    id: 'tpl-trend-jump',
    title: 'Pounce on hot trends',
    desc: 'When a trend hits 90+ velocity and 80+ audience match, draft a take and notify you.',
    emoji: '🔥',
    category: 'growth',
    triggerKind: 'event',
    trigger: 'Trend velocity ≥ 90 AND match ≥ 80',
    steps: [
      { agent: 'Trends watcher', action: 'Detect qualifying trend' },
      { agent: 'X Agent', action: 'Draft hot-take with your angle' },
      { agent: 'Notify', action: 'Slack + push notification' },
    ],
  },
  {
    id: 'tpl-cross-post',
    title: 'Cross-post launch announcements',
    desc: 'When a post is published on LinkedIn, adapt for X and Meta and submit for approval.',
    emoji: '🔗',
    category: 'cross-channel',
    triggerKind: 'event',
    trigger: 'When LinkedIn Agent publishes',
    steps: [
      { agent: 'X Agent', action: 'Adapt to a thread for X' },
      { agent: 'Meta Agent', action: 'Adapt to a 5-slide carousel' },
      { agent: 'Approval', action: 'Send both to approvers' },
    ],
  },
  {
    id: 'tpl-inbox-triage',
    title: 'Inbox triage with AI replies',
    desc: 'For every reply or DM, draft a brand-voice response and surface with a 1-click approve.',
    emoji: '📬',
    category: 'engagement',
    triggerKind: 'event',
    trigger: 'New reply, mention, or DM',
    steps: [
      { agent: 'Inbox watcher', action: 'Classify sentiment + intent' },
      { agent: 'Channel agent', action: 'Draft reply matching brand voice' },
      { agent: 'Approval', action: 'Push to inbox card with one-tap approve' },
    ],
  },
  {
    id: 'tpl-weekly-recap',
    title: 'Weekly performance recap',
    desc: 'Every Monday at 8 AM, email the team a recap of last week\'s top posts and learnings.',
    emoji: '📊',
    category: 'reporting',
    triggerKind: 'schedule',
    trigger: 'Every Monday · 8:00 AM',
    steps: [
      { agent: 'Analytics', action: 'Roll up the week\'s metrics' },
      { agent: 'Outlook Agent', action: 'Draft executive summary email' },
      { agent: 'Send', action: 'Email to team@workspace' },
    ],
  },
  {
    id: 'tpl-cold-followup',
    title: 'Smart Gmail follow-ups',
    desc: 'If a cold email gets no reply in 4 business days, draft a value-add follow-up.',
    emoji: '✉️',
    category: 'engagement',
    triggerKind: 'event',
    trigger: 'Gmail thread with no reply · 4 business days',
    steps: [
      { agent: 'Gmail Agent', action: 'Draft follow-up with new angle' },
      { agent: 'Approval', action: 'Push to your morning queue' },
      { agent: 'Gmail Agent', action: 'Send once approved' },
    ],
  },
  {
    id: 'tpl-content-recycle',
    title: 'Recycle top-performing content',
    desc: 'Every 90 days, surface posts that performed 2× over average for re-use as fresh angles.',
    emoji: '♻️',
    category: 'growth',
    triggerKind: 'schedule',
    trigger: 'Every quarter · first Monday',
    steps: [
      { agent: 'Analytics', action: 'Find posts ≥ 2× engagement avg' },
      { agent: 'Channel agent', action: 'Draft fresh take in the same brand voice' },
      { agent: 'Approval', action: 'Submit for review' },
    ],
    premium: true,
  },
  {
    id: 'tpl-competitor-watch',
    title: 'Competitor breakout watcher',
    desc: 'When a competitor post goes 5× their average, summarize the angle and what they did right.',
    emoji: '👀',
    category: 'reporting',
    triggerKind: 'event',
    trigger: 'Competitor post ≥ 5× their avg',
    steps: [
      { agent: 'Trends watcher', action: 'Detect breakout post' },
      { agent: 'Analytics', action: 'Extract angle, hook, format' },
      { agent: 'Notify', action: 'Send recap to your inbox' },
    ],
    premium: true,
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'growth', label: 'Growth' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'cross-channel', label: 'Cross-channel' },
  { id: 'reporting', label: 'Reporting' },
] as const

const ACTIVE: ActiveWorkflow[] = [
  {
    id: 'wf-1',
    title: 'Weekly thread on launch lessons',
    triggerKind: 'schedule',
    trigger: 'Every Friday · 4:30 PM',
    agents: ['X Agent', 'Approval'],
    enabled: true,
    runs: 6,
    lastRan: 'Last Fri',
    successRate: 100,
  },
  {
    id: 'wf-2',
    title: 'Inbox triage with AI replies',
    triggerKind: 'event',
    trigger: 'New reply, mention, or DM',
    agents: ['Channel agents', 'Approval'],
    enabled: true,
    runs: 412,
    lastRan: '8m ago',
    successRate: 98,
  },
  {
    id: 'wf-3',
    title: 'Cross-post launch announcements',
    triggerKind: 'event',
    trigger: 'When LinkedIn Agent publishes',
    agents: ['X Agent', 'Meta Agent'],
    enabled: false,
    runs: 14,
    lastRan: '5d ago',
    successRate: 93,
  },
]

const TRIGGER_LABEL: Record<TriggerKind, { icon: string; label: string }> = {
  schedule: { icon: '⏱', label: 'Schedule' },
  event: { icon: '⚡', label: 'Event' },
  manual: { icon: '👋', label: 'Manual' },
}

export default function WorkflowsPage() {
  const [tab, setTab] = useState<'active' | 'library'>('active')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const [q, setQ] = useState('')
  const [active, setActive] = useState(ACTIVE)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (!query) return true
      return (
        t.title.toLowerCase().includes(query) ||
        t.desc.toLowerCase().includes(query) ||
        t.steps.some((s) => `${s.agent} ${s.action}`.toLowerCase().includes(query))
      )
    })
  }, [category, q])

  function toggleActive(id: string) {
    setActive((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        const next = !w.enabled
        toast.success(next ? 'Workflow enabled' : 'Workflow paused', { description: w.title })
        return { ...w, enabled: next }
      }),
    )
  }

  function installTemplate(tpl: RecipeTemplate) {
    setActive((prev) => [
      {
        id: `wf-${Date.now()}`,
        title: tpl.title,
        triggerKind: tpl.triggerKind,
        trigger: tpl.trigger,
        agents: tpl.steps.map((s) => s.agent),
        enabled: true,
        runs: 0,
        lastRan: 'never',
        successRate: 100,
      },
      ...prev,
    ])
    setTab('active')
    toast.success('Workflow installed', { description: tpl.title })
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Workflows"
        description="Reusable recipes your agents follow on a schedule, on an event, or when you say go."
        action={
          <Button
            size="sm"
            style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
            onClick={() =>
              toast.message('Custom workflow builder', {
                description: 'Visual workflow editor lands in the next release.',
              })
            }
          >
            + New workflow
          </Button>
        }
      />

      <div className="border-b border-border/60 bg-card/30 px-6 flex items-center gap-1">
        {(['active', 'library'] as const).map((t) => {
          const isActive = tab === t
          const count = t === 'active' ? active.length : TEMPLATES.length
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={isActive}
              className={cn(
                'relative px-4 py-3 text-sm font-semibold transition-colors capitalize',
                isActive
                  ? 'text-foreground border-b-2 border-orange-500 -mb-px'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'active' ? 'Active' : 'Recipe library'}
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  isActive ? 'bg-orange-500/15 text-orange-700' : 'bg-muted text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p-6 space-y-5">
        {tab === 'active' ? (
          active.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                  ⚙️
                </div>
                <p className="text-sm font-semibold">No workflows yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Install one from the recipe library to get going.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setTab('library')}>
                  Browse recipes →
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {active.map((w) => (
                <Card key={w.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
                          w.enabled
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {w.enabled ? '▶' : '⏸'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold">{w.title}</p>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {TRIGGER_LABEL[w.triggerKind].icon} {TRIGGER_LABEL[w.triggerKind].label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{w.trigger}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span>{w.agents.length} step{w.agents.length === 1 ? '' : 's'} · {w.agents.join(' → ')}</span>
                          <span>·</span>
                          <span>{w.runs} runs</span>
                          <span>·</span>
                          <span>{w.successRate}% success</span>
                          <span>·</span>
                          <span>Last ran {w.lastRan}</span>
                        </div>
                      </div>
                      <Switch
                        checked={w.enabled}
                        onCheckedChange={() => toggleActive(w.id)}
                        aria-label={`Toggle ${w.title}`}
                        className="shrink-0 mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search recipes…"
                  aria-label="Search recipes"
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    aria-pressed={category === c.id}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                      category === c.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <p className="text-sm font-semibold">No recipes match.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try a different filter or search term.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((tpl) => (
                  <Card key={tpl.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{tpl.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base leading-tight">{tpl.title}</CardTitle>
                            {tpl.premium && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-700 border-amber-200">
                                Pro
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1 text-xs">{tpl.desc}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 space-y-3">
                      <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                          {TRIGGER_LABEL[tpl.triggerKind].icon} Trigger
                        </p>
                        <p className="text-xs font-semibold">{tpl.trigger}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Steps
                        </p>
                        {tpl.steps.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                            <p className="text-xs leading-snug">
                              <span className="font-semibold">{s.agent}</span>
                              <span className="text-muted-foreground"> · {s.action}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-2">
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                          onClick={() => installTemplate(tpl)}
                        >
                          Install workflow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
