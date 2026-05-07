'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'tiktok'

interface Trend {
  topic: string
  platform: Platform
  velocity: number // 0-100
  posts: string
  audienceMatch: number // 0-100
  angle: string
  category: 'hot' | 'rising' | 'evergreen'
}

const TRENDS: Trend[] = [
  {
    topic: 'AI agents replacing SaaS',
    platform: 'twitter',
    velocity: 94,
    posts: '12.4k posts · last 24h',
    audienceMatch: 96,
    category: 'hot',
    angle: 'You\'re building the proof — a working agent product. Drop one specific thing your agents do that a generic chatbot can\'t.',
  },
  {
    topic: 'Build in public 2.0',
    platform: 'twitter',
    velocity: 78,
    posts: '4.1k posts · last 24h',
    audienceMatch: 92,
    category: 'rising',
    angle: 'Share a metric you\'re NOT proud of yet, plus your hypothesis for fixing it. People reward vulnerability + specificity.',
  },
  {
    topic: 'The death of the dashboard',
    platform: 'linkedin',
    velocity: 82,
    posts: '2.8k posts · last 24h',
    audienceMatch: 88,
    category: 'hot',
    angle: 'Your inbox feature is literally proving this. Tell the story — "we removed 4 dashboards last month, here\'s what replaced them."',
  },
  {
    topic: 'Founder mode vs manager mode',
    platform: 'linkedin',
    velocity: 71,
    posts: '1.6k posts',
    audienceMatch: 81,
    category: 'rising',
    angle: 'Take a contrarian stance — "founder mode is just an excuse for not delegating well." Bet you\'ll get 200+ comments.',
  },
  {
    topic: 'Behind-the-scenes Reel hooks',
    platform: 'instagram',
    velocity: 88,
    posts: '32k Reels',
    audienceMatch: 74,
    category: 'hot',
    angle: 'Show the boring parts: the spreadsheet you used, the rejected design, the failed launch. People save BTS content.',
  },
  {
    topic: 'POV transitions',
    platform: 'tiktok',
    velocity: 91,
    posts: '480k videos',
    audienceMatch: 62,
    category: 'hot',
    angle: '"POV: you\'re a small team and an agency just quoted you $8k/mo for what PostPilot does in 5 minutes." Fast cuts, text-on-screen.',
  },
  {
    topic: 'How to write better hooks',
    platform: 'twitter',
    velocity: 55,
    posts: 'Evergreen',
    audienceMatch: 95,
    category: 'evergreen',
    angle: 'You teach this every week. Run the same playbook with a fresh example: a viral post, broken down line by line.',
  },
  {
    topic: 'Year-end retrospective',
    platform: 'linkedin',
    velocity: 48,
    posts: 'Evergreen',
    audienceMatch: 90,
    category: 'evergreen',
    angle: 'Numbers + lessons + what surprised you. Bonus: include one thing you\'re changing next year.',
  },
]

const COMPETITORS = [
  { name: '@buffer', platform: 'twitter' as Platform, lastPost: '2h ago', topPost: '"The 5 metrics every social marketer should obsess over"', engagement: '+312%' },
  { name: '@hootsuite', platform: 'twitter' as Platform, lastPost: '6h ago', topPost: '"Agencies: stop using 7 different tools. Here\'s our consolidation playbook."', engagement: '+89%' },
  { name: 'Sprout Social', platform: 'linkedin' as Platform, lastPost: '4h ago', topPost: '"We surveyed 1,200 marketers about AI in 2026. The findings surprised us."', engagement: '+540%' },
]

export default function TrendsPage() {
  const [filter, setFilter] = useState<'all' | 'hot' | 'rising' | 'evergreen'>('all')

  const filtered = filter === 'all' ? TRENDS : TRENDS.filter((t) => t.category === filter)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Trends & Discovery"
        description="What's working right now — across your audience, niche, and platforms — picked for you."
        action={
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
            Updated 4 min ago
          </Badge>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5">
          {(['all', 'hot', 'rising', 'evergreen'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors',
                filter === f
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {f === 'all' ? 'All trends' : f}
            </button>
          ))}
        </div>

        {/* Trends grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.topic} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PlatformIcon platform={t.platform} size="sm" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {t.platform === 'twitter' ? 'X' : t.platform}
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      'text-[9px] uppercase tracking-widest px-1.5 py-0 border',
                      t.category === 'hot' && 'bg-rose-500/10 text-rose-700 border-rose-300/40',
                      t.category === 'rising' && 'bg-amber-500/10 text-amber-700 border-amber-300/40',
                      t.category === 'evergreen' && 'bg-emerald-500/10 text-emerald-700 border-emerald-300/40',
                    )}
                  >
                    {t.category === 'hot' && '🔥 '}
                    {t.category === 'rising' && '↗ '}
                    {t.category === 'evergreen' && '∞ '}
                    {t.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold leading-tight">{t.topic}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">{t.posts}</p>
                </div>

                {/* Velocity bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-muted-foreground">Velocity</span>
                    <span>{t.velocity}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${t.velocity}%`,
                        background: 'linear-gradient(90deg, #EA580C, #DB2777)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold pt-2">
                    <span className="text-muted-foreground">Audience match</span>
                    <span>{t.audienceMatch}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${t.audienceMatch}%` }}
                    />
                  </div>
                </div>

                <div
                  className="rounded-xl p-3 border"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.652 0.214 36 / 0.05), transparent)',
                    borderColor: 'oklch(0.652 0.214 36 / 0.2)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="h-3 w-3 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Your angle</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/85">{t.angle}</p>
                </div>

                <Button asChild size="sm" className="w-full" style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}>
                  <Link href={`/dashboard/create?topic=${encodeURIComponent(t.topic)}`}>
                    Draft a post on this →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Competitor watch */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Competitor watch</CardTitle>
                <CardDescription>What players in your niche just published — and how it&apos;s landing.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="text-xs">+ Track competitor</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {COMPETITORS.map((c) => (
              <div key={c.name} className="rounded-xl border border-border/60 bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <PlatformIcon platform={c.platform} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold">{c.name}</p>
                      <span className="text-[10px] text-muted-foreground">· {c.lastPost}</span>
                      <Badge className={cn('text-[10px] px-1.5 py-0 ml-auto', c.engagement.startsWith('+') ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : '')}>
                        {c.engagement} vs avg
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-1">&ldquo;{c.topPost}&rdquo;</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
