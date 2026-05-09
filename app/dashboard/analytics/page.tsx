'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

const PERIODS = ['7D', '30D', '90D'] as const
type Period = (typeof PERIODS)[number]

const P: Record<string, string> = {
  twitter: '#1D9BF0',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  tiktok: '#6366F1',
}

// ── Time-series engagement data ────────────────────────────────────────────────

const DATA_7D = [
  { d: 'Mon', twitter: 3.2, instagram: 5.8, linkedin: 2.4, tiktok: 9.1, reach: 4820 },
  { d: 'Tue', twitter: 4.1, instagram: 6.2, linkedin: 3.1, tiktok: 8.7, reach: 5100 },
  { d: 'Wed', twitter: 5.3, instagram: 7.4, linkedin: 3.8, tiktok: 11.2, reach: 6240 },
  { d: 'Thu', twitter: 4.8, instagram: 6.9, linkedin: 2.9, tiktok: 10.1, reach: 5830 },
  { d: 'Fri', twitter: 6.2, instagram: 8.1, linkedin: 4.2, tiktok: 12.4, reach: 7120 },
  { d: 'Sat', twitter: 5.9, instagram: 9.3, linkedin: 2.1, tiktok: 14.8, reach: 8450 },
  { d: 'Sun', twitter: 4.7, instagram: 8.6, linkedin: 1.8, tiktok: 13.2, reach: 7280 },
]

const DATA_30D = [
  { d: 'Apr 7',  twitter: 2.8, instagram: 4.9, linkedin: 2.1, tiktok: 7.4,  reach: 3820 },
  { d: 'Apr 9',  twitter: 3.4, instagram: 5.6, linkedin: 2.8, tiktok: 8.2,  reach: 4500 },
  { d: 'Apr 11', twitter: 2.9, instagram: 5.1, linkedin: 2.3, tiktok: 7.8,  reach: 4100 },
  { d: 'Apr 13', twitter: 4.1, instagram: 6.3, linkedin: 3.2, tiktok: 9.4,  reach: 5200 },
  { d: 'Apr 15', twitter: 3.8, instagram: 5.9, linkedin: 2.9, tiktok: 8.9,  reach: 4900 },
  { d: 'Apr 17', twitter: 4.6, instagram: 7.1, linkedin: 3.5, tiktok: 10.2, reach: 5800 },
  { d: 'Apr 19', twitter: 4.2, instagram: 6.5, linkedin: 3.1, tiktok: 9.7,  reach: 5400 },
  { d: 'Apr 21', twitter: 5.1, instagram: 7.8, linkedin: 3.9, tiktok: 11.5, reach: 6300 },
  { d: 'Apr 23', twitter: 4.8, instagram: 7.2, linkedin: 3.4, tiktok: 10.8, reach: 5900 },
  { d: 'Apr 25', twitter: 5.6, instagram: 8.3, linkedin: 4.1, tiktok: 12.1, reach: 6800 },
  { d: 'Apr 27', twitter: 5.2, instagram: 7.9, linkedin: 3.8, tiktok: 11.8, reach: 6500 },
  { d: 'Apr 29', twitter: 6.1, instagram: 8.8, linkedin: 4.4, tiktok: 13.2, reach: 7400 },
  { d: 'May 1',  twitter: 5.8, instagram: 8.4, linkedin: 4.0, tiktok: 12.7, reach: 7100 },
  { d: 'May 3',  twitter: 6.4, instagram: 9.1, linkedin: 4.6, tiktok: 13.9, reach: 7800 },
  { d: 'May 5',  twitter: 6.0, instagram: 8.7, linkedin: 4.2, tiktok: 13.4, reach: 7500 },
]

const DATA_90D = [
  { d: 'Feb W1', twitter: 2.1, instagram: 3.8, linkedin: 1.8, tiktok: 5.2,  reach: 12400 },
  { d: 'Feb W2', twitter: 2.4, instagram: 4.1, linkedin: 2.0, tiktok: 6.1,  reach: 14100 },
  { d: 'Feb W3', twitter: 2.8, instagram: 4.5, linkedin: 2.2, tiktok: 6.8,  reach: 15800 },
  { d: 'Feb W4', twitter: 3.1, instagram: 4.9, linkedin: 2.4, tiktok: 7.4,  reach: 17200 },
  { d: 'Mar W1', twitter: 3.4, instagram: 5.2, linkedin: 2.6, tiktok: 8.0,  reach: 18900 },
  { d: 'Mar W2', twitter: 3.8, instagram: 5.7, linkedin: 2.9, tiktok: 8.7,  reach: 20400 },
  { d: 'Mar W3', twitter: 4.1, instagram: 6.1, linkedin: 3.1, tiktok: 9.4,  reach: 22100 },
  { d: 'Mar W4', twitter: 4.5, instagram: 6.6, linkedin: 3.4, tiktok: 10.2, reach: 24300 },
  { d: 'Apr W1', twitter: 4.8, instagram: 7.0, linkedin: 3.6, tiktok: 10.8, reach: 26800 },
  { d: 'Apr W2', twitter: 5.2, instagram: 7.5, linkedin: 3.9, tiktok: 11.5, reach: 29200 },
  { d: 'Apr W3', twitter: 5.6, instagram: 8.0, linkedin: 4.2, tiktok: 12.3, reach: 31800 },
  { d: 'Apr W4', twitter: 5.9, instagram: 8.5, linkedin: 4.4, tiktok: 13.1, reach: 34500 },
  { d: 'May W1', twitter: 6.2, instagram: 9.0, linkedin: 4.7, tiktok: 13.8, reach: 37200 },
]

const CHART_DATA: Record<Period, typeof DATA_7D> = {
  '7D': DATA_7D,
  '30D': DATA_30D,
  '90D': DATA_90D,
}

// ── KPIs ───────────────────────────────────────────────────────────────────────

const KPIS: Record<Period, {
  reach: number; reachDelta: number
  engagement: number; engDelta: number
  posts: number; postsDelta: number
  followers: number; followersDelta: number
}> = {
  '7D':  { reach: 44840,  reachDelta: 12, engagement: 5.3, engDelta: 0.8, posts: 12,  postsDelta: 4,  followers: 89,  followersDelta: 23 },
  '30D': { reach: 187400, reachDelta: 18, engagement: 5.8, engDelta: 1.1, posts: 43,  postsDelta: 11, followers: 312, followersDelta: 28 },
  '90D': { reach: 524000, reachDelta: 31, engagement: 5.2, engDelta: 2.4, posts: 118, postsDelta: 22, followers: 847, followersDelta: 41 },
}

// ── Platform bar data ──────────────────────────────────────────────────────────

const PLATFORM_BARS = [
  { label: 'TikTok',    engagement: 11.4, color: '#6366F1', posts: 18 },
  { label: 'Instagram', engagement: 7.4,  color: '#E1306C', posts: 24 },
  { label: 'X/Twitter', engagement: 5.1,  color: '#1D9BF0', posts: 31 },
  { label: 'LinkedIn',  engagement: 3.3,  color: '#0A66C2', posts: 14 },
  { label: 'Facebook',  engagement: 2.2,  color: '#1877F2', posts: 8  },
]

// ── Content type data ──────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { type: 'Thread / Long-form', pct: 34, color: '#EA580C', engAvg: 7.2 },
  { type: 'Single Post',        pct: 28, color: '#DB2777', engAvg: 5.8 },
  { type: 'Carousel',           pct: 22, color: '#8B5CF6', engAvg: 6.9 },
  { type: 'Video / Reel',       pct: 11, color: '#06B6D4', engAvg: 9.4 },
  { type: 'Poll / Question',    pct: 5,  color: '#10B981', engAvg: 4.1 },
]

// ── AI Insights ────────────────────────────────────────────────────────────────

const INSIGHTS = [
  {
    icon: '🔥',
    title: 'TikTok is your engine',
    body: 'Your TikTok content averages 11.4% engagement — 2.2× your next-best platform. Shifting 2 more posts/week there could unlock significant reach.',
    cta: 'Optimize for TikTok',
    href: '/dashboard/agents/viral',
    color: '#6366F1',
  },
  {
    icon: '⏰',
    title: 'Friday 6 PM is your golden hour',
    body: 'Posts published Friday between 5–7 PM earn 38% more reach than your average slot. Move your strongest content here every week.',
    cta: 'Plan the Schedule',
    href: '/dashboard/calendar',
    color: '#EA580C',
  },
  {
    icon: '🧵',
    title: 'Long-form beats short',
    body: 'Threads outperform single posts by 31% on engagement. Your audience are readers. Lean in — post one deep thread every 4 days.',
    cta: 'Write a Thread',
    href: '/dashboard/create',
    color: '#DB2777',
  },
]

// ── Top posts ──────────────────────────────────────────────────────────────────

const TOP_POSTS = [
  { content: 'The 5 writing frameworks that took my LinkedIn from 200 → 12k in 4 months...', platform: 'LinkedIn', eng: 8.4, reach: 24100, type: 'Thread' },
  { content: "Nobody talks about the 'plateau problem' in content creation. Here's what actually breaks it:", platform: 'X/Twitter', eng: 7.2, reach: 18400, type: 'Thread' },
  { content: 'POV: You spent 3 hours on a perfectly crafted post and got 12 likes. Then you posted this in 5 min 👇', platform: 'TikTok', eng: 14.8, reach: 31200, type: 'Video' },
  { content: "The algorithm doesn't reward consistency. It rewards frequency + quality. Here's the difference:", platform: 'Instagram', eng: 9.3, reach: 15600, type: 'Carousel' },
  { content: 'I analyzed 500 viral posts this month. These 7 hooks appear in 80% of them:', platform: 'X/Twitter', eng: 6.8, reach: 12300, type: 'Thread' },
]

const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  LinkedIn:  { bg: '#EFF6FF', text: '#0A66C2' },
  'X/Twitter': { bg: '#EFF9FF', text: '#1D9BF0' },
  Instagram: { bg: '#FFF0F6', text: '#E1306C' },
  TikTok:    { bg: '#F0F0FF', text: '#6366F1' },
  Facebook:  { bg: '#EEF2FF', text: '#1877F2' },
}

const TYPE_STYLE: Record<string, string> = {
  Thread:   'bg-orange-50 text-orange-700',
  Video:    'bg-purple-50 text-purple-700',
  Carousel: 'bg-sky-50 text-sky-700',
  Single:   'bg-muted text-muted-foreground',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function EngagementTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-background/95 p-3 shadow-xl backdrop-blur text-xs space-y-1.5 min-w-[140px]">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="capitalize text-muted-foreground flex-1">{p.name === 'twitter' ? 'X/Twitter' : p.name}</span>
          <span className="font-bold tabular-nums">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30D')
  const [activePlatforms, setActivePlatforms] = useState<Set<string>>(
    new Set(['twitter', 'instagram', 'linkedin', 'tiktok'])
  )

  const { data: stats } = useSWR<{
    drafts: number
    threads: number
    publishedPosts: number
    scheduledPosts: number
    connectedAccounts: number
  }>('/api/stats', fetcher, { refreshInterval: 60000 })

  const totalContent = (stats?.drafts ?? 0) + (stats?.threads ?? 0)
  const published = stats?.publishedPosts ?? 0
  const scheduled = stats?.scheduledPosts ?? 0

  const kpi = KPIS[period]
  const chartData = CHART_DATA[period]

  // Build period label from today
  const today = new Date()
  const daysBefore = period === '7D' ? 7 : period === '30D' ? 30 : 90
  const from = new Date(today)
  from.setDate(from.getDate() - daysBefore)
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const periodLabel = `${fmtDate(from)} – ${fmtDate(today)}`

  const togglePlatform = (p: string) => {
    setActivePlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(p)) {
        if (next.size > 1) next.delete(p)
      } else {
        next.add(p)
      }
      return next
    })
  }

  const PLATFORM_LABELS: Record<string, string> = {
    twitter: 'X', instagram: 'IG', linkedin: 'LI', tiktok: 'TK',
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Analytics"
        description="Track your growth and engagement across every platform"
        action={
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-150',
                  period === p
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Date range label */}
        <div className="flex items-center gap-3 -mt-2 flex-wrap">
          <p className="text-xs text-muted-foreground">{periodLabel}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            Engagement &amp; reach figures are illustrative.{' '}
            <Link href="/dashboard/accounts" className="underline underline-offset-2 hover:text-amber-900 transition-colors">
              Connect accounts
            </Link>
            {' '}to see your real metrics.
          </span>
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Real DB stat: total content pieces created */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content Created</p>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </div>
            <p className="text-3xl font-black tabular-nums">{totalContent}</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats?.drafts ?? 0}</span> drafts &middot; <span className="font-semibold text-foreground">{stats?.threads ?? 0}</span> threads
            </span>
          </div>

          {/* Real DB stat: published posts */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Published</p>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <p className="text-3xl font-black tabular-nums">{published}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              {scheduled > 0 ? `${scheduled} scheduled` : 'No posts scheduled'}
            </span>
          </div>

          {/* Illustrated: engagement rate */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Engagement</p>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-3xl font-black tabular-nums">{kpi.engagement}%</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              +{kpi.engDelta}pp vs prior period
            </span>
          </div>

          {/* Illustrated: estimated reach */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Est. Reach</p>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-3xl font-black tabular-nums">{fmt(kpi.reach)}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              +{kpi.reachDelta}% vs prior period
            </span>
          </div>
        </div>

        {/* ── Real activity summary ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold mb-4">Your Activity</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Drafts saved',       value: stats?.drafts ?? 0,           href: '/dashboard/drafts' },
              { label: 'Threads saved',      value: stats?.threads ?? 0,          href: '/dashboard/drafts' },
              { label: 'Published posts',    value: stats?.publishedPosts ?? 0,   href: '/dashboard/accounts' },
              { label: 'Scheduled posts',    value: stats?.scheduledPosts ?? 0,   href: '/dashboard/calendar' },
              { label: 'Connected accounts', value: stats?.connectedAccounts ?? 0, href: '/dashboard/accounts' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/20 p-4 text-center hover:bg-muted/40 hover:border-border transition-all"
              >
                <span className="text-2xl font-black tabular-nums group-hover:text-primary transition-colors">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wide">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Engagement chart + Platform bars ─────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Area chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold">Engagement Rate Over Time</h3>
                <p className="text-xs text-muted-foreground mt-0.5">% of reached audience that engaged</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {(Object.keys(P)).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all border',
                      activePlatforms.has(p)
                        ? 'text-white border-transparent'
                        : 'text-muted-foreground border-border/50 opacity-40 hover:opacity-60'
                    )}
                    style={activePlatforms.has(p) ? { background: P[p], borderColor: P[p] } : {}}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  {Object.entries(P).map(([key, color]) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" width={30} />
                <Tooltip content={<EngagementTooltip />} />
                {Object.keys(P)
                  .filter((p) => activePlatforms.has(p))
                  .map((p) => (
                    <Area
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={P[p]}
                      strokeWidth={2}
                      fill={`url(#grad-${p})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Platform performance */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold mb-1">Platform Performance</h3>
            <p className="text-xs text-muted-foreground mb-5">Avg engagement rate per platform</p>
            <div className="space-y-4">
              {PLATFORM_BARS.map((pb) => (
                <div key={pb.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{pb.label}</span>
                    <span className="font-black tabular-nums">{pb.engagement}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(pb.engagement / 14) * 100}%`, background: pb.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{pb.posts} posts · {period}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content types + AI Insights ──────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Content type mix */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-bold mb-1">Content Type Performance</h3>
            <p className="text-xs text-muted-foreground mb-5">What format drives the most engagement</p>
            <div className="space-y-3.5">
              {CONTENT_TYPES.map((ct) => (
                <div key={ct.type} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ct.color }} />
                      <span className="text-xs font-medium">{ct.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{ct.engAvg}% avg eng</span>
                      <span className="text-xs font-bold tabular-nums w-7 text-right">{ct.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ct.pct}%`, background: ct.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl p-3" style={{ background: 'oklch(0.652 0.214 36 / 0.06)', border: '1px solid oklch(0.652 0.214 36 / 0.15)' }}>
              <p className="text-xs font-semibold" style={{ color: '#EA580C' }}>
                💡 Videos earn 2.3× more engagement per post but you only post 11% video. Consider doubling down.
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold">AI Insights</h3>
              <span
                className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.652 0.214 36 / 0.15)', color: '#EA580C' }}
              >
                Claude
              </span>
            </div>
            <div className="space-y-3">
              {INSIGHTS.map((ins) => (
                <div
                  key={ins.title}
                  className="group rounded-xl border border-border/50 p-3.5 space-y-2 hover:border-border transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{ins.icon}</span>
                    <span className="text-xs font-bold">{ins.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.body}</p>
                  <Link
                    href={ins.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-1.5 transition-all"
                    style={{ color: ins.color }}
                  >
                    {ins.cta}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Top performing posts ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold">Top Performing Content</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your best posts ranked by engagement rate</p>
            </div>
            <Link href="/dashboard/drafts" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              All drafts →
            </Link>
          </div>
          <div className="space-y-2">
            {TOP_POSTS.map((post, i) => {
              const badge = BADGE_STYLE[post.platform]
              const type = TYPE_STYLE[post.type] ?? TYPE_STYLE.Single
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors group"
                >
                  <span
                    className="text-xs font-black w-5 shrink-0 tabular-nums"
                    style={{ color: i === 0 ? '#EA580C' : i === 1 ? '#DB2777' : undefined }}
                  >
                    #{i + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium line-clamp-1 min-w-0">{post.content}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: badge?.bg, color: badge?.text }}
                    >
                      {post.platform}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold hidden md:inline-flex', type)}>
                      {post.type}
                    </span>
                    <span className="text-xs font-black tabular-nums text-emerald-600">{post.eng}%</span>
                    <span className="text-xs text-muted-foreground tabular-nums hidden lg:inline">{fmt(post.reach)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
