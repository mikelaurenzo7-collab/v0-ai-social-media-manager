'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Topic {
  title: string
  angle: string
  platform: 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'all'
  urgency: 'trending_now' | 'evergreen' | 'seasonal'
  hook: string
  why: string
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1D9BF0',
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  tiktok: '#6366F1',
  all: '#EA580C',
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'X/Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  all: 'All Platforms',
}

const URGENCY_CFG = {
  trending_now: { label: 'Trending', bg: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' },
  evergreen: { label: 'Evergreen', bg: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' },
  seasonal: { label: 'Seasonal', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' },
}

function TopicCard({ topic, index }: { topic: Topic; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const platformColor = PLATFORM_COLORS[topic.platform]
  const urgency = URGENCY_CFG[topic.urgency]
  const createUrl = `/dashboard/create?idea=${encodeURIComponent(topic.hook)}`

  return (
    <div
      className="group rounded-xl border border-border/60 bg-card transition-all hover:shadow-sm"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-black text-white"
            style={{ backgroundColor: platformColor }}
          >
            {topic.platform === 'twitter' ? '𝕏' :
             topic.platform === 'instagram' ? '📸' :
             topic.platform === 'linkedin' ? 'in' :
             topic.platform === 'tiktok' ? '▶' : '★'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', urgency.bg)}>
                {urgency.label}
              </span>
              <span className="text-[10px] text-muted-foreground" style={{ color: platformColor }}>
                {PLATFORM_LABELS[topic.platform]}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{topic.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{topic.angle}</p>
          </div>
          <svg
            className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-2', expanded && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 pb-4 pt-3 space-y-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ready-to-use hook
            </p>
            <p className="text-xs italic text-foreground leading-relaxed">&ldquo;{topic.hook}&rdquo;</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{topic.why}</p>
          <Link
            href={createUrl}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800/40 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/40"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Create post from this idea
          </Link>
        </div>
      )}
    </div>
  )
}

export function TrendIntelligence() {
  const [niche, setNiche] = useState('')
  const [savedNiche, setSavedNiche] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchTrends = useCallback(async (nicheToUse: string) => {
    if (!nicheToUse.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: nicheToUse.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setTopics(data.topics ?? [])
      setSavedNiche(nicheToUse.trim())
      setHasLoaded(true)
    } catch {
      toast.error('Failed to generate topic ideas. Try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTrends(niche)
  }

  return (
    <div
      className="rounded-2xl border border-border/60 overflow-hidden"
      style={{ background: 'oklch(var(--card))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Trend Intelligence</p>
            {savedNiche && (
              <p className="text-[10px] text-muted-foreground">for &ldquo;{savedNiche}&rdquo;</p>
            )}
          </div>
        </div>
        {hasLoaded && (
          <button
            onClick={() => fetchTrends(savedNiche)}
            disabled={loading}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Refresh ideas"
          >
            <svg
              className={cn('h-4 w-4', loading && 'animate-spin')}
              fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Niche input */}
        {!hasLoaded && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Your niche (e.g. SaaS, fitness, web3)"
              className="h-9 text-sm flex-1"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!niche.trim() || loading}
              className="shrink-0 gap-1.5 font-bold"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
            >
              {loading ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
              {loading ? 'Analyzing…' : 'Get Ideas'}
            </Button>
          </form>
        )}

        {/* Loading state */}
        {loading && !hasLoaded && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border/60 bg-muted/30 p-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded-full bg-muted" />
                    <div className="h-4 w-4/5 rounded-full bg-muted" />
                    <div className="h-3 w-2/3 rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Topics */}
        {!loading && topics.length > 0 && (
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <TopicCard key={i} topic={topic} index={i} />
            ))}
            <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
              <Input
                placeholder="Change niche"
                className="h-8 text-xs flex-1"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
              <Button type="submit" size="sm" variant="outline" className="h-8 text-xs shrink-0">
                Update
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
