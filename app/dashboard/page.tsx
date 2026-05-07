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
  'The best time to post on Instagram is when YOUR audience is active — check your insights.',
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
    <div className="flex flex-col">
      <Header 
        title="Welcome back!" 
        description="Ready to create some engaging content?"
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Action */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Create Your First Post</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Let Claude craft platform-optimized content for X, Instagram, and Facebook in seconds.
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link href="/dashboard/create">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Post
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saved Drafts</CardDescription>
              <CardTitle className="text-3xl">{drafts.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Posts ready to publish</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saved Threads</CardDescription>
              <CardTitle className="text-3xl">{threads.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">X/Twitter threads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>AI Generations Left</CardDescription>
              <CardTitle className="text-3xl">25</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Free plan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Connected Accounts</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <Link href="/dashboard/accounts" className="text-primary hover:underline">
                  Connect now
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Drafts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Drafts</CardTitle>
                  <CardDescription>Your saved content ready to post</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/drafts">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {drafts.length > 0 ? (
                  <div className="space-y-4">
                    {drafts.slice(0, 3).map((draft) => (
                      <div key={draft.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{draft.content}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {draft.platforms.map((p: string) => (
                                <div key={p} className="flex h-5 w-5 items-center justify-center rounded-full bg-background border ring-1 ring-background">
                                  <PlatformIcon platform={p as any} className="h-3 w-3" />
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(draft.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/drafts`}>Open</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">No drafts yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your saved posts will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insight Card */}
          <div className="flex flex-col gap-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <CardTitle className="text-sm">Today&apos;s Tip</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">Claude</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{tip}&rdquo;
                </p>
                <Button asChild variant="link" className="mt-3 h-auto p-0 text-xs">
                  <Link href="/dashboard/create">Apply it now →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link href="/dashboard/create">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Generate new post
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link href="/dashboard/drafts">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    View all drafts
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full justify-start">
                  <Link href="/dashboard/accounts">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Connect accounts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
