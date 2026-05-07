'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'
import { cn } from '@/lib/utils'

// ── Time-aware greeting ────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── AI Tips Pool ───────────────────────────────────────────────────────────────

const AI_TIPS = [
  { tip: 'Hook your audience in the first 3 words — people scroll fast.', category: 'Hooks' },
  { tip: 'Posts with a question get 2× more comments on average.', category: 'Engagement' },
  { tip: 'Consistency beats virality. Show up daily before chasing big moments.', category: 'Strategy' },
  { tip: 'Repurpose your top-performing post in 3 different formats this week.', category: 'Repurposing' },
  { tip: 'The best time to post is when YOUR audience is active — check your insights.', category: 'Timing' },
  { tip: 'Start every caption with your hook. Never bury the lead.', category: 'Copywriting' },
  { tip: 'Carousels hold attention 3× longer than single images on Instagram.', category: 'Format' },
  { tip: 'LinkedIn posts with a line break after the first sentence get 40% more views.', category: 'LinkedIn' },
  { tip: 'TikTok rewards watch time. Hook in 0.5 seconds, deliver in 15.', category: 'TikTok' },
]

// ── Quick Actions ──────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    label: 'Write a post',
    desc: 'Generate 3 AI variations in seconds',
    href: '/dashboard/create',
    gradient: 'from-orange-500 to-pink-600',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: 'Content Calendar',
    desc: 'Plan and schedule posts across platforms',
    href: '/dashboard/calendar',
    gradient: 'from-violet-500 to-purple-600',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'View Analytics',
    desc: 'Track engagement and grow smarter',
    href: '/dashboard/analytics',
    gradient: 'from-sky-500 to-blue-600',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

// ── Recent Activity Feed (mock) ────────────────────────────────────────────────

const ACTIVITY_FEED = [
  { id: '1', type: 'published', platform: 'linkedin', content: 'The creator plateau problem...', time: '2 hours ago', engagement: '+127 impressions' },
  { id: '2', type: 'scheduled', platform: 'tiktok', content: 'Stop optimizing for reach...', time: '4 hours ago', engagement: 'Tomorrow 5 PM' },
  { id: '3', type: 'draft', platform: 'twitter', content: '7 hooks that went viral...', time: 'Yesterday', engagement: 'Ready to publish' },
  { id: '4', type: 'published', platform: 'instagram', content: 'Sunday morning routine...', time: '2 days ago', engagement: '+89 likes' },
]

const ACTIVITY_ICONS: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  published: {
    icon: <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    bg: 'bg-emerald-500',
    label: 'Published',
  },
  scheduled: {
    icon: <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    bg: 'bg-amber-500',
    label: 'Scheduled',
  },
  draft: {
    icon: <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    bg: 'bg-slate-500',
    label: 'Draft saved',
  },
}

// ── Onboarding Checklist ───────────────────────────────────────────────────────

interface ChecklistItem {
  id: string
  label: string
  href: string
  completed: boolean
}

export default function DashboardPage() {
  const [drafts, setDrafts] = useState<{ id: string; content: string; platforms: string[]; createdAt: string }[]>([])
  const [threads, setThreads] = useState<{ id: string }[]>([])
  const [mounted, setMounted] = useState(false)
  const [tipIndex] = useState(() => Math.floor(Math.random() * AI_TIPS.length))
  const [greeting] = useState(getGreeting)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'connect', label: 'Connect your first account', href: '/dashboard/accounts', completed: false },
    { id: 'create', label: 'Create your first post', href: '/dashboard/create', completed: false },
    { id: 'schedule', label: 'Schedule a post', href: '/dashboard/calendar', completed: false },
    { id: 'brand', label: 'Set up your brand voice', href: '/dashboard/settings', completed: false },
  ])

  const tip = AI_TIPS[tipIndex]

  useEffect(() => {
    setMounted(true)
    try {
      const storedDrafts = localStorage.getItem('postpilot_drafts')
      if (storedDrafts) {
        const parsed = JSON.parse(storedDrafts)
        const draftsArray = Array.isArray(parsed) ? parsed : []
        setDrafts(draftsArray)
        // Mark "create" as completed if user has drafts
        if (draftsArray.length > 0) {
          setChecklist((prev) => prev.map((item) => item.id === 'create' ? { ...item, completed: true } : item))
        }
      }
    } catch {
      setDrafts([])
    }
    try {
      const storedThreads = localStorage.getItem('postpilot_threads')
      if (storedThreads) {
        const parsed = JSON.parse(storedThreads)
        setThreads(Array.isArray(parsed) ? parsed : [])
      }
    } catch {
      setThreads([])
    }
    try {
      const storedScheduled = localStorage.getItem('postpilot_scheduled')
      if (storedScheduled) {
        const parsed = JSON.parse(storedScheduled)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChecklist((prev) => prev.map((item) => item.id === 'schedule' ? { ...item, completed: true } : item))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const completedCount = checklist.filter((item) => item.completed).length
  const progressPct = Math.round((completedCount / checklist.length) * 100)

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Loading..." description="" />
        <div className="p-6 space-y-7">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl loading-skeleton" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl loading-skeleton" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`${greeting} ✦`}
        description="Your content studio is ready. What are we creating today?"
      />

      <div className="p-6 space-y-7">

        {/* ── Hero: Quick Actions ─────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              className="group block reveal-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-white shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-0.5 group-active:scale-[0.99]`}>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-bold text-base leading-tight">{action.label}</p>
                    <p className="text-xs text-white/75 mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Saved Drafts',
              value: drafts.length,
              sub: drafts.length === 0 ? 'Create your first' : 'Ready to publish',
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
              color: '#EA580C',
            },
            {
              label: 'Saved Threads',
              value: threads.length,
              sub: threads.length === 0 ? 'Write your first' : 'X/Twitter threads',
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              ),
              color: '#DB2777',
            },
            {
              label: 'AI Generations',
              value: 25,
              sub: 'Remaining on free plan',
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              color: '#8B5CF6',
            },
            {
              label: 'Connected',
              value: 0,
              sub: <Link href="/dashboard/accounts" className="text-orange-500 hover:underline font-medium">Connect accounts &rarr;</Link>,
              icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              ),
              color: '#0EA5E9',
            },
          ].map((stat, i) => (
            <Card
              key={stat.label}
              className="border-border/60 shadow-sm hover:shadow-md transition-all duration-200 reveal-up overflow-hidden group"
              style={{ animationDelay: `${180 + i * 40}ms` }}
            >
              <CardContent className="pt-5 pb-4 px-5 relative">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full opacity-[0.06] blur-xl transition-opacity group-hover:opacity-[0.12]" style={{ background: stat.color }} />
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-black text-foreground tabular">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main Content Grid ────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left column: Recent Activity + Drafts */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent Activity */}
            <Card className="border-border/60 shadow-sm reveal-up" style={{ animationDelay: '320ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Your latest content across platforms</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/drafts">View all &rarr;</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ACTIVITY_FEED.map((activity) => {
                    const activityConfig = ACTIVITY_ICONS[activity.type]
                    return (
                      <div
                        key={activity.id}
                        className="group flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="relative mt-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/60">
                            <PlatformIcon platform={activity.platform as 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'} className="h-4 w-4" />
                          </div>
                          <div className={cn('absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white', activityConfig.bg)}>
                            {activityConfig.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{activity.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium text-muted-foreground">{activityConfig.label}</span>
                            <span className="text-[10px] text-muted-foreground/60">&middot;</span>
                            <span className="text-[10px] text-muted-foreground">{activity.time}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={cn(
                            'text-[10px] font-semibold',
                            activity.type === 'published' ? 'text-emerald-600' :
                            activity.type === 'scheduled' ? 'text-amber-600' : 'text-muted-foreground'
                          )}>
                            {activity.engagement}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Drafts */}
            <Card className="border-border/60 shadow-sm reveal-up" style={{ animationDelay: '380ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Saved Drafts</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Content ready to publish</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/drafts">View all &rarr;</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {drafts.length > 0 ? (
                  <div className="space-y-2">
                    {drafts.slice(0, 3).map((draft) => (
                      <div
                        key={draft.id}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 text-foreground">{draft.content}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {draft.platforms?.map((p: string) => (
                                <div key={p} className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-border ring-1 ring-white">
                                  <PlatformIcon platform={p as 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'} className="h-3 w-3" />
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(draft.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href="/dashboard/drafts">Open</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">No drafts yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Generate your first post and save it here</p>
                    <Button asChild size="sm" className="mt-4 btn-gradient">
                      <Link href="/dashboard/create">Create a post</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Onboarding Checklist (show only if not all completed) */}
            {progressPct < 100 && (
              <Card className="border-border/60 shadow-sm reveal-up overflow-hidden" style={{ animationDelay: '440ms' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold">Get Started</CardTitle>
                    <span className="text-xs font-semibold tabular" style={{ color: '#EA580C' }}>{completedCount}/{checklist.length}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #EA580C, #DB2777)' }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  {checklist.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                        item.completed ? 'opacity-60' : 'hover:bg-muted/60'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        item.completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border'
                      )}>
                        {item.completed && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className={cn('text-xs font-medium', item.completed && 'line-through text-muted-foreground')}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Tip */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white reveal-up"
              style={{ background: 'linear-gradient(135deg, #1A1210 0%, #2C1A12 100%)', animationDelay: '500ms' }}
            >
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-10 blur-2xl"
                style={{ background: 'radial-gradient(circle, #EA580C, transparent)' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}>
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Today&apos;s Tip</span>
                  <Badge className="text-[9px] ml-auto px-1.5 py-0" style={{ background: 'oklch(0.652 0.214 36 / 0.3)', color: '#FED7AA', border: '1px solid oklch(0.652 0.214 36 / 0.4)' }}>
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-sm text-white/85 leading-relaxed">&ldquo;{tip.tip}&rdquo;</p>
                <Link href="/dashboard/create" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                  Apply it now
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Platform quick tips */}
            <Card className="border-border/60 shadow-sm reveal-up" style={{ animationDelay: '560ms' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Platform Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'X / Twitter', tip: 'Hook in first 10 words', color: '#000', icon: 'twitter' },
                  { name: 'Instagram', tip: 'First 125 chars are everything', color: '#E1306C', icon: 'instagram' },
                  { name: 'LinkedIn', tip: 'First 3 lines before "see more"', color: '#0A66C2', icon: 'linkedin' },
                  { name: 'TikTok', tip: 'Hook in 0.5 seconds', color: '#000', icon: 'tiktok' },
                ].map((p) => (
                  <div key={p.name} className="flex items-start gap-3 rounded-xl p-3 bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-background border border-border/60 shrink-0">
                      <PlatformIcon platform={p.icon as 'twitter' | 'instagram' | 'linkedin' | 'tiktok'} className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.tip}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
