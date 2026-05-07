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
    label: 'Build a thread',
    desc: 'X/Twitter thread in one click',
    href: '/dashboard/create',
    gradient: 'from-amber-500 to-orange-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    label: 'Chat with an Agent',
    desc: 'Get expert strategy from your AI team',
    href: '/dashboard/agents',
    gradient: 'from-pink-600 to-rose-500',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
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
      const storedThreads = localStorage.getItem('postpilot_threads')
      if (storedDrafts) setDrafts(JSON.parse(storedDrafts))
      if (storedThreads) setThreads(JSON.parse(storedThreads))
    } catch {
      // corrupt localStorage — ignore
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Good morning ✦"
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
                    <div className="mt-0.5 h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: p.color === '#000' ? '#374151' : p.color }} />
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
