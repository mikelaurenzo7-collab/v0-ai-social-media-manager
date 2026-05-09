'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'
import { Skeleton } from '@/components/ui/skeleton'

const AI_TIPS = [
  'Hook your audience in the first 3 words — people scroll fast.',
  'Posts with a question get 2x more comments on average.',
  'Consistency beats virality. Show up daily before chasing big moments.',
  'Repurpose your top-performing post in 3 different formats this week.',
  'The best time to post is when YOUR audience is active — check your insights.',
  'Start every caption with your hook. Never bury the lead.',
  'Carousels hold attention 3x longer than single images on Instagram.',
]

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

interface Stats {
  drafts: number
  threads: number
  publishedPosts: number
  connectedAccounts: number
  scheduledPosts: number
}

interface Draft {
  id: string
  content: string
  platforms: string[]
  createdAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return res.json()
}

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])
}

export default function DashboardPage() {
  const greeting = useGreeting()
  const [tip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)])

  const { data: statsData, isLoading: statsLoading } = useSWR<Stats>('/api/stats', fetcher, {
    revalidateOnFocus: false,
  })

  const { data: draftsData, isLoading: draftsLoading } = useSWR<{ drafts: Draft[] }>(
    '/api/drafts',
    fetcher,
    { revalidateOnFocus: false }
  )

  const stats = statsData ?? { drafts: 0, threads: 0, publishedPosts: 0, connectedAccounts: 0, scheduledPosts: 0 }
  const recentDrafts = draftsData?.drafts?.slice(0, 4) ?? []

  const statCards = [
    {
      label: 'Saved Drafts',
      value: stats.drafts,
      sub: 'Posts ready to publish',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: 'Threads',
      value: stats.threads,
      sub: 'X/Twitter threads saved',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
    {
      label: 'Published',
      value: stats.publishedPosts,
      sub: 'Posts sent via PostPilot',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
    },
    {
      label: 'Connected',
      value: stats.connectedAccounts,
      sub: stats.connectedAccounts === 0
        ? <Link href="/dashboard/accounts" className="text-orange-500 hover:underline font-medium">Connect accounts</Link>
        : 'Accounts ready to publish',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={greeting}
        description="Your content studio is ready. What are we creating today?"
      />

      <div className="p-6 space-y-7">

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} href={action.href} className="group block">
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-white shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:-translate-y-0.5 group-active:scale-[0.99]`}>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
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

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    {stat.icon}
                  </span>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <p className="text-3xl font-black text-foreground tabular">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Drafts */}
          <div className="lg:col-span-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold">Recent Drafts</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Your saved content, ready to publish</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/drafts">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {draftsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : recentDrafts.length > 0 ? (
                  <div className="space-y-2">
                    {recentDrafts.map((draft) => (
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
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity shrink-0"
                        >
                          <Link href="/dashboard/drafts">View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
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

            {/* AI Tip */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #1A1210 0%, #2C1A12 100%)' }}
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
                </div>
                <p className="text-sm text-white/85 leading-relaxed">&ldquo;{tip}&rdquo;</p>
                <Link href="/dashboard/create" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
                  Apply it now
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Platform quick links */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Platform Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'X / Twitter', tip: 'Hook in first 10 words', color: '#374151' },
                  { name: 'Instagram', tip: 'First 125 chars are everything', color: '#E1306C' },
                  { name: 'LinkedIn', tip: 'First 3 lines before "see more"', color: '#0A66C2' },
                ].map((p) => (
                  <div key={p.name} className="flex items-start gap-3 rounded-xl p-3 bg-muted/40 border border-border/50">
                    <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.tip}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scheduled posts teaser */}
            {!statsLoading && stats.scheduledPosts > 0 && (
              <div
                className="relative overflow-hidden rounded-2xl border border-violet-200/60 p-4"
                style={{ background: 'linear-gradient(135deg, oklch(0.96 0.01 290) 0%, oklch(0.98 0.006 290) 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-900">{stats.scheduledPosts} post{stats.scheduledPosts !== 1 ? 's' : ''} scheduled</p>
                    <p className="text-[10px] text-violet-700/70">Coming up soon</p>
                  </div>
                  <Link href="/dashboard/calendar" className="ml-auto text-[10px] font-semibold text-violet-700 hover:text-violet-900">
                    View
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
