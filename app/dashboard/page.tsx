'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'

const AI_TIPS = [
  'Hook your audience in the first 3 words — people scroll fast.',
  'Posts with a question get 2× more comments on average.',
  'Consistency beats virality. Show up daily before chasing big moments.',
  'Repurpose your top-performing post in 3 different formats this week.',
  'The best time to post is when YOUR audience is active — check your insights.',
  'Start every caption with your hook. Never bury the lead.',
  'Carousels hold attention 3× longer than single images on Instagram.',
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

export default function DashboardPage() {
  const [drafts, setDrafts] = useState<{ id: string; content: string; platforms: string[]; createdAt: string }[]>([])
  const [threads, setThreads] = useState<{ id: string }[]>([])
  const [mounted, setMounted] = useState(false)
  const [tip] = useState(() => AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)])

  useEffect(() => {
    setMounted(true)
    try {
      const storedDrafts = localStorage.getItem('postpilot_drafts')
      if (storedDrafts) {
        const parsed = JSON.parse(storedDrafts)
        setDrafts(Array.isArray(parsed) ? parsed : [])
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
  }, [])

  if (!mounted) return null

  const hour = new Date().getHours()
  const timeGreeting = hour < 5 ? 'Burning the midnight oil' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Working late'

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={`${timeGreeting} ✦`}
        description="Your content studio is ready. What are we creating today?"
      />

      <div className="p-6 space-y-7">

        {/* ── Hero: Quick Actions ─────────────────────────────────────────── */}
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

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Saved Drafts', value: drafts.length, sub: 'Posts ready to publish', icon: '📝' },
            { label: 'Saved Threads', value: threads.length, sub: 'X/Twitter threads', icon: '🧵' },
            { label: 'AI Generations', value: 25, sub: 'Remaining on free plan', icon: '⚡' },
            { label: 'Connected', value: 0, sub: <Link href="/dashboard/accounts" className="text-orange-500 hover:underline font-medium">Connect accounts →</Link>, icon: '🔗' },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <p className="text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main Content Grid ────────────────────────────────────────────── */}
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
                  <Link href="/dashboard/drafts">View all →</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {drafts.length > 0 ? (
                  <div className="space-y-2">
                    {drafts.slice(0, 4).map((draft) => (
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
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                      📝
                    </div>
                    <p className="text-sm font-medium text-foreground">No drafts yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Generate your first post and save it here</p>
                    <Button asChild size="sm" className="mt-4" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}>
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
                  <Badge className="text-[9px] ml-auto px-1.5 py-0" style={{ background: 'oklch(0.652 0.214 36 / 0.3)', color: '#FED7AA', border: '1px solid oklch(0.652 0.214 36 / 0.4)' }}>Claude</Badge>
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

            {/* Live activity feed */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Live activity</CardTitle>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: '✅', text: 'Auto-Pilot published 3 posts', time: '2m', tone: 'emerald' },
                  { icon: '💬', text: 'Maya Chen replied to your X post', time: '14m', tone: 'orange' },
                  { icon: '🤖', text: 'Sarah drafted 2 posts for Friday', time: '1h', tone: 'violet' },
                  { icon: '📈', text: 'New trend match: 96% relevance', time: '2h', tone: 'sky' },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="text-lg shrink-0 mt-0.5">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-relaxed">{a.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.time} ago</p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/inbox" className="block text-center text-[11px] font-semibold text-muted-foreground hover:text-foreground pt-1">
                  Open inbox →
                </Link>
              </CardContent>
            </Card>

            {/* Platform quick links */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Platform Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'X / Twitter', tip: 'Hook in first 10 words', color: '#000' },
                  { name: 'Instagram', tip: 'First 125 chars are everything', color: '#E1306C' },
                  { name: 'LinkedIn', tip: 'First 3 lines before "see more"', color: '#0A66C2' },
                ].map((p) => (
                  <div key={p.name} className="flex items-start gap-3 rounded-xl p-3 bg-muted/40 border border-border/50">
                    <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: p.color === '#000' ? '#374151' : p.color }} />
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
