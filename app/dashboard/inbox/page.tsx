'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { getAgentForPlatform } from '@/lib/agents'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'
type ItemType = 'reply' | 'mention' | 'dm' | 'comment' | 'review'
type Sentiment = 'positive' | 'neutral' | 'negative' | 'urgent'

interface InboxItem {
  id: string
  platform: Platform
  type: ItemType
  author: { name: string; handle: string; avatar?: string; verified?: boolean }
  preview: string
  fullText: string
  receivedAt: string
  unread: boolean
  sentiment: Sentiment
  context?: string
  thread?: { author: string; text: string }[]
  aiSuggestion?: string
}

const SAMPLE_ITEMS: InboxItem[] = [
  {
    id: '1',
    platform: 'twitter',
    type: 'reply',
    author: { name: 'Maya Chen', handle: '@mayabuilds', verified: true },
    preview: 'This is exactly the framework I needed. How did you handle multi-tenant analytics?',
    fullText:
      'This is exactly the framework I needed. How did you handle multi-tenant analytics? We\'ve been struggling with row-level security at scale. Would love a write-up if you ever do one.',
    receivedAt: '2m ago',
    unread: true,
    sentiment: 'positive',
    context: 'Replying to your post about our launch architecture',
    aiSuggestion:
      'Thanks Maya! We use Postgres RLS with a tenant_id on every row, plus a session-level setter. Working on a post — want me to send you the draft?',
  },
  {
    id: '2',
    platform: 'instagram',
    type: 'dm',
    author: { name: 'Olivia Park', handle: '@olivia.park' },
    preview: 'Hi! Are partnerships still open for Q3? I run a 40k creator newsletter…',
    fullText:
      'Hi! Are partnerships still open for Q3? I run a 40k creator newsletter and your tool is exactly what my audience needs. Happy to share rates and audience demographics if there\'s interest.',
    receivedAt: '14m ago',
    unread: true,
    sentiment: 'positive',
    aiSuggestion:
      'Hey Olivia — yes, partnerships are open. Can you send over the audience deck and proposed format? We\'ll have something back to you in 24h.',
  },
  {
    id: '3',
    platform: 'linkedin',
    type: 'comment',
    author: { name: 'Daniel Reyes', handle: 'Daniel Reyes · CMO at Northwave' },
    preview: 'Sharing this with my team. Question — do you support approval workflows for agencies?',
    fullText:
      'Sharing this with my team. Question — do you support approval workflows for agencies managing 10+ clients? That\'s our biggest blocker right now.',
    receivedAt: '38m ago',
    unread: true,
    sentiment: 'positive',
    context: 'Commented on: "We just shipped Auto-Pilot"',
    aiSuggestion:
      'Hey Daniel — yes, multi-client + multi-stage approvals ship next week (current beta). DM me and I\'ll get you on it early.',
  },
  {
    id: '4',
    platform: 'gmail',
    type: 'reply',
    author: { name: 'Priya Menon', handle: 'priya@brightlabs.io' },
    preview: 'Re: Quick intro — would love to set something up next week',
    fullText:
      'Loved the note. Tuesday or Thursday afternoon both work — pick whatever\'s easier for you. I\'ll bring our growth lead.',
    receivedAt: '1h ago',
    unread: false,
    sentiment: 'positive',
    aiSuggestion:
      'Tuesday at 2pm works perfect — sending an invite now. Looking forward to meeting you and the growth lead.',
  },
  {
    id: '5',
    platform: 'twitter',
    type: 'mention',
    author: { name: 'Hacker News Bot', handle: '@HNDigest' },
    preview: '@yourbrand mentioned in: "Show HN: PostPilot — AI agents for social"',
    fullText:
      'Your brand was just mentioned in a Show HN thread that hit #4 on the front page. Estimated 12,000 impressions in the next hour.',
    receivedAt: '2h ago',
    unread: true,
    sentiment: 'urgent',
    context: 'Trending now — respond fast',
  },
  {
    id: '6',
    platform: 'instagram',
    type: 'comment',
    author: { name: 'Theo Williams', handle: '@theo.builds' },
    preview: 'How does this compare to Buffer? Genuine question.',
    fullText:
      'How does this compare to Buffer? Genuine question — we\'ve been on Buffer for 4 years and our team is split.',
    receivedAt: '3h ago',
    unread: false,
    sentiment: 'neutral',
    aiSuggestion:
      'Great q — short version: Buffer is great for scheduling, PostPilot is built around AI agents that draft + decide + post. Happy to send a side-by-side if useful.',
  },
  {
    id: '7',
    platform: 'tiktok',
    type: 'comment',
    author: { name: 'jasper.codes', handle: '@jasper.codes' },
    preview: 'first 😤 also where do I sign up',
    fullText: 'first 😤 also where do I sign up',
    receivedAt: '5h ago',
    unread: false,
    sentiment: 'positive',
    aiSuggestion: 'haha appreciate you 🙏 link in bio — shoot us a DM if you want a 1:1 walkthrough',
  },
  {
    id: '8',
    platform: 'linkedin',
    type: 'dm',
    author: { name: 'Jordan Hale', handle: 'Jordan Hale · Founder, Halewise' },
    preview: 'Curious if you\'ve thought about an enterprise tier with SOC 2…',
    fullText:
      'Curious if you\'ve thought about an enterprise tier with SOC 2 / SSO. We\'d be in for 50 seats day one if so.',
    receivedAt: '1d ago',
    unread: false,
    sentiment: 'positive',
    aiSuggestion:
      'Hey Jordan — SOC 2 Type 1 is in motion (audit Q4), SSO is live for Business plan today. Let\'s get on a call this week?',
  },
  {
    id: '9',
    platform: 'twitter',
    type: 'mention',
    author: { name: 'Nadia Park', handle: '@nadiawrites' },
    preview: 'tried @postpilot for a week — here\'s the honest review',
    fullText:
      'tried @postpilot for a week — here\'s the honest review: the AI agents are scary good, the inbox is unreal, but the analytics need work. 7/10 would recommend.',
    receivedAt: '1d ago',
    unread: false,
    sentiment: 'neutral',
    aiSuggestion:
      'Appreciate the honest take, Nadia 🙏 analytics overhaul is shipping next sprint — would love your eyes on the beta if you\'re game.',
  },
]

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'dm', label: 'DMs' },
  { id: 'reply', label: 'Replies' },
  { id: 'urgent', label: 'Urgent' },
] as const

const PLATFORM_FILTERS: { id: Platform | 'all'; label: string }[] = [
  { id: 'all', label: 'All channels' },
  { id: 'twitter', label: 'X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'outlook', label: 'Outlook' },
]

const SENTIMENT_STYLE: Record<Sentiment, { dot: string; label: string }> = {
  positive: { dot: 'bg-emerald-500', label: 'Positive' },
  neutral: { dot: 'bg-slate-400', label: 'Neutral' },
  negative: { dot: 'bg-rose-500', label: 'Negative' },
  urgent: { dot: 'bg-orange-500', label: 'Urgent' },
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>(SAMPLE_ITEMS)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(SAMPLE_ITEMS[0]?.id ?? null)
  const [reply, setReply] = useState('')
  const [drafting, setDrafting] = useState(false)

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (platform !== 'all' && i.platform !== platform) return false
      if (filter === 'all') return true
      if (filter === 'unread') return i.unread
      if (filter === 'urgent') return i.sentiment === 'urgent'
      if (filter === 'mentions') return i.type === 'mention'
      if (filter === 'dm') return i.type === 'dm'
      if (filter === 'reply') return i.type === 'reply' || i.type === 'comment'
      return true
    })
  }, [items, filter, platform])

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  )
  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items])

  function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)))
  }

  const typeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelTypingRef = useRef(false)

  useEffect(() => {
    return () => {
      cancelTypingRef.current = true
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current)
    }
  }, [])

  // Cancel any in-flight typing animation when the user switches conversation —
  // prevents the previous conversation's draft from leaking into the new one.
  useEffect(() => {
    cancelTypingRef.current = true
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current)
      typeTimeoutRef.current = null
    }
    setDrafting(false)
  }, [selectedId])

  function sendReply() {
    if (!reply.trim() || !selected) return
    if (typeTimeoutRef.current) {
      clearTimeout(typeTimeoutRef.current)
      typeTimeoutRef.current = null
    }
    cancelTypingRef.current = true
    setDrafting(false)
    toast.success(`Reply sent to ${selected.author.name}`)
    setReply('')
    if (selected.unread) markRead(selected.id)
  }

  function handleUseAiSuggestion() {
    if (!selected?.aiSuggestion) return
    if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current)
    cancelTypingRef.current = false
    setDrafting(true)
    let i = 0
    const text = selected.aiSuggestion
    const tick = () => {
      if (cancelTypingRef.current) return
      i = Math.min(text.length, i + Math.max(2, Math.floor(text.length / 60)))
      setReply(text.slice(0, i))
      if (i < text.length) {
        typeTimeoutRef.current = setTimeout(tick, 18)
      } else {
        typeTimeoutRef.current = null
        setDrafting(false)
      }
    }
    tick()
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Inbox"
        description="Every reply, mention, comment, and DM — across all your platforms — in one place."
        action={
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-500/10 text-orange-700 border border-orange-200">
              {unreadCount} unread
            </Badge>
            <Button variant="outline" size="sm">
              <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Sync
            </Button>
          </div>
        }
      />

      {/* Filters bar */}
      <div className="border-b border-border/60 bg-card/30 px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                filter === f.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
            aria-label="Filter by platform"
            className="h-8 rounded-lg border border-border/60 bg-background px-3 text-xs font-medium"
          >
            {PLATFORM_FILTERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[380px_1fr] min-h-0">
        {/* Items list */}
        <div className="border-r border-border/60 max-h-[calc(100vh-9rem)] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nothing here. Try a different filter.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id)
                    if (item.unread) markRead(item.id)
                    setReply('')
                  }}
                  className={cn(
                    'w-full text-left border-b border-border/40 px-4 py-3.5 transition-colors',
                    isSelected ? 'bg-orange-50/60 dark:bg-orange-500/10' : 'hover:bg-muted/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <PlatformIcon platform={item.platform} size="sm" />
                      {item.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={cn('text-sm truncate', item.unread ? 'font-bold text-foreground' : 'font-semibold text-foreground/80')}>
                          {item.author.name}
                        </p>
                        {item.author.verified && (
                          <svg className="h-3.5 w-3.5 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.39 4.84 5.34.78-3.86 3.77.91 5.31L12 14.27l-4.78 2.51.91-5.31L4.27 7.62l5.34-.78L12 2z" />
                          </svg>
                        )}
                        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{item.receivedAt}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{item.author.handle}</p>
                      <p className={cn('mt-1.5 text-xs leading-relaxed line-clamp-2', item.unread ? 'text-foreground' : 'text-muted-foreground')}>
                        {item.preview}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 rounded-full', SENTIMENT_STYLE[item.sentiment].dot)} />
                        <span className="text-[10px] font-medium text-muted-foreground capitalize">{item.type}</span>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[10px] text-muted-foreground">{SENTIMENT_STYLE[item.sentiment].label}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Conversation pane */}
        <div className="flex flex-col max-h-[calc(100vh-9rem)] overflow-hidden">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-border/60 bg-card/40">
                <div className="flex items-start gap-3">
                  <PlatformIcon platform={selected.platform} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{selected.author.name}</h3>
                      {selected.author.verified && (
                        <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.39 4.84 5.34.78-3.86 3.77.91 5.31L12 14.27l-4.78 2.51.91-5.31L4.27 7.62l5.34-.78L12 2z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selected.author.handle} · {selected.receivedAt}</p>
                    {selected.context && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground italic">{selected.context}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" disabled aria-disabled className="h-8 px-2 text-xs" title="Coming soon">Mute</Button>
                    <Button variant="ghost" size="sm" disabled aria-disabled className="h-8 px-2 text-xs" title="Coming soon">Archive</Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.fullText}</p>
                </div>

                {selected.aiSuggestion && (
                  <div
                    className="rounded-2xl border p-4 relative"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.652 0.214 36 / 0.06), oklch(0.588 0.238 352 / 0.06))',
                      borderColor: 'oklch(0.652 0.214 36 / 0.25)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-md"
                        style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                        {getAgentForPlatform(selected.platform)?.name ?? 'Agent'} suggests
                      </span>
                      <Badge className="ml-auto text-[9px] px-1.5 py-0 bg-orange-500/15 text-orange-700 border-orange-300/40">
                        AI · matches your voice
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 italic">&ldquo;{selected.aiSuggestion}&rdquo;</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                        onClick={handleUseAiSuggestion}
                        disabled={drafting}
                      >
                        Use this draft
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs">Try another tone</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/60 bg-card/40 p-4">
                <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply to ${selected.author.name}…`}
                    aria-label={`Reply to ${selected.author.name}`}
                    className="w-full resize-none px-4 pt-3 pb-2 text-sm bg-transparent outline-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">GIF</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">📎</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const limits: Record<Platform, number> = {
                          twitter: 280,
                          instagram: 2200,
                          linkedin: 3000,
                          facebook: 63206,
                          tiktok: 2200,
                          gmail: 50000,
                          outlook: 50000,
                        }
                        const max = limits[selected.platform]
                        const remaining = max - reply.length
                        const warn = remaining < Math.max(20, max * 0.05)
                        const over = remaining < 0
                        return (
                          <span
                            className={cn(
                              'text-[10px] tabular-nums',
                              over
                                ? 'text-rose-600 font-bold'
                                : warn
                                  ? 'text-amber-600 font-semibold'
                                  : 'text-muted-foreground',
                            )}
                            aria-live="polite"
                          >
                            {over ? `${Math.abs(remaining)} over limit` : `${remaining} left`}
                          </span>
                        )
                      })()}
                      <Button
                        size="sm"
                        className="h-8 text-xs px-4"
                        style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                        disabled={
                          !reply.trim() ||
                          reply.length >
                            ({
                              twitter: 280,
                              instagram: 2200,
                              linkedin: 3000,
                              facebook: 63206,
                              tiktok: 2200,
                              gmail: 50000,
                              outlook: 50000,
                            } as Record<Platform, number>)[selected.platform]
                        }
                        onClick={sendReply}
                      >
                        Send reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10">
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                    📬
                  </div>
                  <p className="text-sm font-semibold">Inbox zero</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pick a conversation on the left.</p>
                  <Button asChild size="sm" variant="outline" className="mt-4 text-xs">
                    <Link href="/dashboard/accounts">Manage channels</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
