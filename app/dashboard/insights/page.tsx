'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'
type InsightKind = 'win' | 'anomaly' | 'risk' | 'opportunity' | 'experiment'

interface Insight {
  id: string
  kind: InsightKind
  platform?: Platform
  emoji: string
  title: string
  body: string
  metric?: { value: string; vs: string; direction: 'up' | 'down' | 'flat' }
  evidence: string[]
  action: { label: string; href?: string; onClick?: () => void }
  detectedAt: string
}

const INSIGHTS_SEED: Insight[] = [
  {
    id: 'i1',
    kind: 'win',
    platform: 'linkedin',
    emoji: '🚀',
    title: 'Personal-story posts are crushing',
    body:
      'Your LinkedIn posts that lead with a first-person story are pulling 7.4× the reach of your average. The pattern is consistent across the last 6 weeks.',
    metric: { value: '+312%', vs: 'vs your LinkedIn avg', direction: 'up' },
    evidence: [
      '“10k customers” — 3.4× avg, 92 reposts',
      '“The hire that didn’t work out” — 2.1× avg',
      '“What I miss about being broke” — 1.9× avg',
    ],
    action: { label: 'Draft another in this style', href: '/dashboard/create?topic=personal%20story&tone=storytelling' },
    detectedAt: '8m ago',
  },
  {
    id: 'i2',
    kind: 'anomaly',
    platform: 'tiktok',
    emoji: '⚠️',
    title: 'TikTok engagement dropped 18%',
    body:
      'Engagement is down 18% week-over-week on TikTok despite your post volume staying flat. Three of last week\'s videos missed the 1–3 sec hook standard.',
    metric: { value: '−18%', vs: 'vs last week', direction: 'down' },
    evidence: [
      'Avg watch time fell from 11s → 7s',
      'No trending sound used in 4/5 posts',
      'On-screen text missing on 3/5 posts',
    ],
    action: { label: 'Open TikTok Agent →', href: '/dashboard/agents/tiktok' },
    detectedAt: '24m ago',
  },
  {
    id: 'i3',
    kind: 'opportunity',
    platform: 'twitter',
    emoji: '🔥',
    title: 'Trend match — 96% relevance',
    body:
      '"AI agents replacing SaaS" is at 94 velocity on X with strong audience overlap. Your launch story is on-topic and you have the proof.',
    metric: { value: '94', vs: 'velocity / 100', direction: 'up' },
    evidence: [
      '12.4k posts in the last 24h',
      'Audience match: 96%',
      'Top sub-angle: working agent products vs. chatbots',
    ],
    action: { label: 'Draft a take', href: '/dashboard/create?topic=AI%20agents%20replacing%20SaaS' },
    detectedAt: '1h ago',
  },
  {
    id: 'i4',
    kind: 'risk',
    emoji: '🛑',
    title: 'TikTok token expires in 3 days',
    body:
      'Your TikTok OAuth token expires Sat May 10 at 3:42 AM UTC. Auto-Pilot has 4 scheduled posts that would fail silently.',
    evidence: ['Connected: Apr 11', 'Refresh window: 60 days', '4 scheduled posts at risk'],
    action: { label: 'Reconnect TikTok →', href: '/dashboard/accounts' },
    detectedAt: '2h ago',
  },
  {
    id: 'i5',
    kind: 'experiment',
    platform: 'instagram',
    emoji: '🧪',
    title: 'Try carousels — your saves rate beats your likes rate',
    body:
      'On Instagram you\'re saved at a 3.1% rate (vs 1.4% industry) but you\'ve only published 2 carousels this month. Saves correlate strongly with reach via the Explore page.',
    evidence: [
      'Save-to-impression: 3.1% (industry: 1.4%)',
      'Carousels saved 2.6× as often as single images',
      'Top saves: tactical posts, behind-the-scenes',
    ],
    action: { label: 'Draft a carousel', href: '/dashboard/create?topic=behind%20the%20scenes' },
    detectedAt: '3h ago',
  },
  {
    id: 'i6',
    kind: 'win',
    platform: 'linkedin',
    emoji: '⏰',
    title: 'Wed 9 AM is a hidden goldmine',
    body:
      'Your Wednesday 9 AM LinkedIn slot has 2.4× the reach of any other window — but you only post there 1 in 4 weeks.',
    metric: { value: '+140%', vs: 'vs your avg slot', direction: 'up' },
    evidence: ['6 of 6 Wed 9 AM posts beat average', 'Other slots: 38% above avg'],
    action: { label: 'Lock the Wed 9 AM slot', href: '/dashboard/calendar' },
    detectedAt: '5h ago',
  },
  {
    id: 'i7',
    kind: 'opportunity',
    platform: 'gmail',
    emoji: '✉️',
    title: 'Stale Gmail follow-ups',
    body:
      '7 cold emails got opened but no reply, all > 4 business days old. A short, no-pressure follow-up typically converts ~24% of these.',
    evidence: ['7 threads idle', 'Avg open rate so far: 71%', 'Window: April 28 — May 4'],
    action: { label: 'Open Gmail Agent →', href: '/dashboard/agents/gmail' },
    detectedAt: '1d ago',
  },
]

const FILTERS: { id: InsightKind | 'all'; label: string; tint: string }[] = [
  { id: 'all', label: 'All', tint: '' },
  { id: 'win', label: 'Wins', tint: 'text-emerald-700' },
  { id: 'anomaly', label: 'Anomalies', tint: 'text-amber-700' },
  { id: 'risk', label: 'Risks', tint: 'text-rose-700' },
  { id: 'opportunity', label: 'Opportunities', tint: 'text-orange-700' },
  { id: 'experiment', label: 'Experiments', tint: 'text-violet-700' },
]

const KIND_BADGE: Record<InsightKind, { label: string; cls: string }> = {
  win: { label: 'WIN', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  anomaly: { label: 'ANOMALY', cls: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  risk: { label: 'RISK', cls: 'bg-rose-500/10 text-rose-700 border-rose-200' },
  opportunity: { label: 'OPPORTUNITY', cls: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  experiment: { label: 'EXPERIMENT', cls: 'bg-violet-500/10 text-violet-700 border-violet-200' },
}

export default function InsightsPage() {
  const [filter, setFilter] = useState<InsightKind | 'all'>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = useMemo(
    () => INSIGHTS_SEED.filter((i) => !dismissed.has(i.id) && (filter === 'all' || i.kind === filter)),
    [filter, dismissed],
  )

  const counts = useMemo(() => {
    const c: Record<InsightKind | 'all', number> = {
      all: 0, win: 0, anomaly: 0, risk: 0, opportunity: 0, experiment: 0,
    }
    for (const i of INSIGHTS_SEED) {
      if (dismissed.has(i.id)) continue
      c.all++
      c[i.kind]++
    }
    return c
  }, [dismissed])

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
    toast.message('Insight dismissed', { description: 'It won\'t resurface unless the underlying signal changes.' })
  }

  function snooze(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
    toast.success('Snoozed for 7 days')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Insights"
        description="What your data is trying to tell you. Each card has a one-click action — close the loop in seconds."
        action={
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
            {counts.all} active
          </Badge>
        }
      />

      <div className="border-b border-border/60 bg-card/30 px-6 py-3 flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              filter === f.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            {f.label}
            <span className={cn('ml-1.5 text-[10px] tabular-nums', filter === f.id ? 'opacity-80' : 'opacity-60')}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {visible.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl">
                ✨
              </div>
              <p className="text-sm font-semibold">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We watch for new patterns continuously. Fresh insights show up here as they happen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {visible.map((i) => (
              <InsightCard key={i.id} insight={i} onDismiss={() => dismiss(i.id)} onSnooze={() => snooze(i.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({
  insight,
  onDismiss,
  onSnooze,
}: {
  insight: Insight
  onDismiss: () => void
  onSnooze: () => void
}) {
  const directionStyle =
    insight.metric?.direction === 'up'
      ? 'text-emerald-600'
      : insight.metric?.direction === 'down'
        ? 'text-rose-600'
        : 'text-muted-foreground'

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow overflow-hidden group">
      <div
        className="h-1.5 w-full"
        style={{
          background:
            insight.kind === 'win'
              ? 'linear-gradient(90deg, #10B981, #14B8A6)'
              : insight.kind === 'anomaly'
                ? 'linear-gradient(90deg, #F59E0B, #EA580C)'
                : insight.kind === 'risk'
                  ? 'linear-gradient(90deg, #F43F5E, #BE123C)'
                  : insight.kind === 'opportunity'
                    ? 'linear-gradient(90deg, #EA580C, #DB2777)'
                    : 'linear-gradient(90deg, #8B5CF6, #6366F1)',
        }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="text-3xl shrink-0 leading-none">{insight.emoji}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className={cn('text-[9px] px-1.5 py-0 border', KIND_BADGE[insight.kind].cls)}>
                  {KIND_BADGE[insight.kind].label}
                </Badge>
                {insight.platform && <PlatformIcon platform={insight.platform} size="sm" />}
                <span className="text-[10px] text-muted-foreground">{insight.detectedAt}</span>
              </div>
              <CardTitle className="mt-1.5 text-base leading-tight">{insight.title}</CardTitle>
            </div>
          </div>
        </div>
        {insight.metric && (
          <div className={cn('mt-3 flex items-baseline gap-2', directionStyle)}>
            <span className="text-2xl font-black tabular-nums tracking-tight">{insight.metric.value}</span>
            <span className="text-[11px] text-muted-foreground">{insight.metric.vs}</span>
          </div>
        )}
        <CardDescription className="mt-2 text-[13px] leading-relaxed text-foreground/80">
          {insight.body}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-3">
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Evidence</p>
          <ul className="space-y-1">
            {insight.evidence.map((e, i) => (
              <li key={i} className="text-[12px] leading-relaxed text-foreground/85 flex gap-1.5">
                <span className="text-muted-foreground/70">·</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          {insight.action.href ? (
            <Button
              asChild
              size="sm"
              className="flex-1 text-xs"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <Link href={insight.action.href}>{insight.action.label} →</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 text-xs"
              style={{ background: 'var(--brand-gradient)' }}
              onClick={insight.action.onClick}
            >
              {insight.action.label}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onSnooze}>
            Snooze
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
