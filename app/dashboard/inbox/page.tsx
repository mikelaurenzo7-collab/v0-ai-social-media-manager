'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  INBOX_THREADS,
  AI_SUGGESTIONS,
  type InboxThread,
  type InboxKind,
  type InboxStatus,
  type Sentiment,
} from '@/lib/inbox/seed'
import type { SocialPlatformId } from '@/lib/constants/platforms'

// ── Display config ───────────────────────────────────────────────────────────

const PLATFORM_COLOR: Record<SocialPlatformId, { color: string; bg: string }> = {
  twitter: { color: '#1D9BF0', bg: '#EFF9FF' },
  instagram: { color: '#E1306C', bg: '#FFF0F6' },
  linkedin: { color: '#0A66C2', bg: '#EFF6FF' },
  tiktok: { color: '#6366F1', bg: '#F0F0FF' },
  facebook: { color: '#1877F2', bg: '#EEF2FF' },
}

const KIND_LABEL: Record<InboxKind, string> = {
  comment: 'Comment',
  dm: 'DM',
  mention: 'Mention',
  reply: 'Reply',
}

const SENTIMENT_STYLE: Record<
  Sentiment,
  { dot: string; label: string; bg: string; text: string }
> = {
  positive: { dot: '#10B981', label: 'Positive', bg: '#F0FDF4', text: '#047857' },
  question: { dot: '#0EA5E9', label: 'Question', bg: '#F0F9FF', text: '#0369A1' },
  negative: { dot: '#EF4444', label: 'Critical', bg: '#FEF2F2', text: '#B91C1C' },
  lead: { dot: '#EA580C', label: 'Hot lead', bg: '#FFF7ED', text: '#C2410C' },
  neutral: { dot: '#94A3B8', label: 'Neutral', bg: '#F8FAFC', text: '#475569' },
}

const TONE_LABEL = {
  warm: 'Warm',
  direct: 'Direct',
  witty: 'Witty',
} as const

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const now = new Date('2026-05-07T14:30:00Z').getTime()
  const diff = Math.floor((now - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ── Page ─────────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'unread' | 'mentions' | 'comments' | 'dms' | 'leads' | 'snoozed'

export default function InboxPage() {
  const [threads, setThreads] = useState<InboxThread[]>(INBOX_THREADS)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [platformFilter, setPlatformFilter] = useState<Set<SocialPlatformId>>(
    new Set(['twitter', 'instagram', 'linkedin', 'tiktok', 'facebook'])
  )
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>(INBOX_THREADS[0]?.id ?? '')
  const [draft, setDraft] = useState('')
  const [tone, setTone] = useState<'warm' | 'direct' | 'witty'>('warm')
  const [generating, setGenerating] = useState(false)
  const [generatedTone, setGeneratedTone] = useState<'warm' | 'direct' | 'witty' | null>(null)
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false)

  // ── Derived state ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (!platformFilter.has(t.platform)) return false
      const q = search.trim().toLowerCase()
      if (
        q &&
        !t.author.name.toLowerCase().includes(q) &&
        !t.preview.toLowerCase().includes(q) &&
        !t.author.handle.toLowerCase().includes(q)
      ) {
        return false
      }
      switch (activeFilter) {
        case 'unread':
          return t.status === 'unread'
        case 'mentions':
          return t.kind === 'mention'
        case 'comments':
          return t.kind === 'comment' || t.kind === 'reply'
        case 'dms':
          return t.kind === 'dm'
        case 'leads':
          return t.sentiment === 'lead'
        case 'snoozed':
          return t.status === 'snoozed'
        default:
          return true
      }
    })
  }, [threads, activeFilter, platformFilter, search])

  const selected = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? filtered[0] ?? threads[0],
    [threads, selectedId, filtered]
  )

  // Stats for header
  const stats = useMemo(() => {
    const unread = threads.filter((t) => t.status === 'unread').length
    const leads = threads.filter((t) => t.sentiment === 'lead' && t.status !== 'replied').length
    const mentions = threads.filter((t) => t.kind === 'mention').length
    return { unread, leads, mentions }
  }, [threads])

  // Auto-mark selected as read when opened
  useEffect(() => {
    if (!selected) return
    if (selected.status === 'unread') {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selected.id ? { ...t, status: 'read' as InboxStatus, unreadCount: 0 } : t
        )
      )
    }
    setDraft('')
    setGeneratedTone(null)
  }, [selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────
  const togglePlatform = useCallback((p: SocialPlatformId) => {
    setPlatformFilter((prev) => {
      const next = new Set(prev)
      if (next.has(p)) {
        if (next.size > 1) next.delete(p)
      } else {
        next.add(p)
      }
      return next
    })
  }, [])

  const useSuggestion = useCallback(
    (toneKey: 'warm' | 'direct' | 'witty') => {
      if (!selected) return
      setTone(toneKey)
      const suggestions = AI_SUGGESTIONS[selected.id] ?? []
      const match = suggestions.find((s) => s.tone === toneKey) ?? suggestions[0]
      if (!match) {
        toast.info('No suggestion available for this thread yet.')
        return
      }
      setGenerating(true)
      setDraft('')
      setGeneratedTone(null)
      // Simulate streaming
      let i = 0
      const interval = setInterval(() => {
        i += Math.floor(Math.random() * 4) + 2
        if (i >= match.text.length) {
          setDraft(match.text)
          clearInterval(interval)
          setGenerating(false)
          setGeneratedTone(toneKey)
        } else {
          setDraft(match.text.slice(0, i))
        }
      }, 18)
    },
    [selected]
  )

  const handleSendReply = useCallback(() => {
    if (!selected || !draft.trim()) return
    const newMsg = {
      id: `m-local-${Date.now()}`,
      from: 'you' as const,
      body: draft.trim(),
      ts: new Date().toISOString(),
    }
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              status: 'replied' as InboxStatus,
              messages: [...t.messages, newMsg],
              ts: newMsg.ts,
            }
          : t
      )
    )
    setDraft('')
    setGeneratedTone(null)
    toast.success('Reply sent', {
      description: `Posted to ${selected.author.name} on ${selected.platform.charAt(0).toUpperCase() + selected.platform.slice(1)}`,
    })
  }, [selected, draft])

  const handleSnooze = useCallback(() => {
    if (!selected) return
    setThreads((prev) =>
      prev.map((t) => (t.id === selected.id ? { ...t, status: 'snoozed' as InboxStatus } : t))
    )
    toast.success('Snoozed for 24h')
  }, [selected])

  const handleMarkAllRead = useCallback(() => {
    setThreads((prev) =>
      prev.map((t) =>
        t.status === 'unread' ? { ...t, status: 'read' as InboxStatus, unreadCount: 0 } : t
      )
    )
    toast.success('All threads marked as read')
  }, [])

  // ── Filter rail items ──────────────────────────────────────────────────────
  const filterItems: { key: FilterKey; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'all',
      label: 'All',
      count: threads.length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      key: 'unread',
      label: 'Unread',
      count: threads.filter((t) => t.status === 'unread').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      key: 'leads',
      label: 'Hot leads',
      count: threads.filter((t) => t.sentiment === 'lead').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
      ),
    },
    {
      key: 'mentions',
      label: 'Mentions',
      count: threads.filter((t) => t.kind === 'mention').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
        </svg>
      ),
    },
    {
      key: 'comments',
      label: 'Comments',
      count: threads.filter((t) => t.kind === 'comment' || t.kind === 'reply').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      key: 'dms',
      label: 'DMs',
      count: threads.filter((t) => t.kind === 'dm').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      key: 'snoozed',
      label: 'Snoozed',
      count: threads.filter((t) => t.status === 'snoozed').length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  const suggestions = selected ? AI_SUGGESTIONS[selected.id] ?? [] : []

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
      <Header
        title="Inbox"
        description="Every comment, DM, and mention across your platforms — triaged and ready to reply."
        action={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <Stat label="Unread" value={stats.unread} accent="#EA580C" />
              <span className="h-4 w-px bg-border/60" />
              <Stat label="Hot leads" value={stats.leads} accent="#DB2777" />
              <span className="h-4 w-px bg-border/60" />
              <Stat label="Mentions" value={stats.mentions} accent="#0EA5E9" />
            </div>
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Mark all read
            </button>
          </div>
        }
      />

      {/* Three-column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left rail: filters ─────────────────────────────────────────── */}
        <aside className="hidden md:flex w-52 shrink-0 flex-col gap-1 border-r border-border/60 bg-muted/20 p-3">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Triage
          </p>
          {filterItems.map((f) => {
            const active = activeFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                )}
                style={
                  active
                    ? { borderLeft: '2px solid #EA580C', boxShadow: '0 0 0 1px hsl(var(--border))' }
                    : undefined
                }
              >
                <span className={cn('shrink-0', active && 'text-orange-500')}>{f.icon}</span>
                <span className="truncate">{f.label}</span>
                {f.count > 0 && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                      active ? 'bg-orange-50 text-orange-600' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            )
          })}

          {/* Platform filter */}
          <p className="mt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Platforms
          </p>
          <div className="flex flex-wrap gap-1.5 px-2">
            {(Object.keys(PLATFORM_COLOR) as SocialPlatformId[]).map((p) => {
              const active = platformFilter.has(p)
              const cfg = PLATFORM_COLOR[p]
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  title={p}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg border transition-all',
                    active
                      ? 'border-transparent shadow-sm'
                      : 'border-border/60 bg-background opacity-40 hover:opacity-70'
                  )}
                  style={active ? { background: cfg.bg } : undefined}
                >
                  <PlatformIcon
                    platform={p}
                    className="h-3.5 w-3.5"
                  />
                </button>
              )
            })}
          </div>

          {/* Footer tip */}
          <div className="mt-auto rounded-xl p-3 text-[11px] leading-relaxed text-muted-foreground border border-dashed border-border/60">
            <p className="font-bold text-foreground mb-1">💡 Triage tip</p>
            Reply to hot leads first, then mentions, then comments. DMs go cold fast.
          </div>
        </aside>

        {/* ── Middle: conversations list ────────────────────────────────── */}
        <section
          className={cn(
            'flex w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-border/60 min-h-0',
            mobileThreadOpen && 'hidden md:flex'
          )}
        >
          {/* Search + tabs (mobile filter) */}
          <div className="px-3 pt-3 pb-2 border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-lg border border-border/60 bg-muted/30 pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-300/50"
              />
            </div>

            {/* Mobile filter pills */}
            <div className="md:hidden mt-2 flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {filterItems.slice(0, 5).map((f) => {
                const active = activeFilter === f.key
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors',
                      active
                        ? 'text-white'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                    )}
                    style={
                      active
                        ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                        : undefined
                    }
                  >
                    {f.label} {f.count > 0 && `(${f.count})`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-2xl">
                  ✓
                </div>
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nothing matches the current filter. Try another view.
                </p>
              </div>
            ) : (
              filtered.map((t) => {
                const cfg = PLATFORM_COLOR[t.platform]
                const isSelected = selected?.id === t.id
                const sent = SENTIMENT_STYLE[t.sentiment]
                const isUnread = t.status === 'unread'

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedId(t.id)
                      setMobileThreadOpen(true)
                    }}
                    className={cn(
                      'group relative w-full text-left px-4 py-3 border-b border-border/40 transition-colors',
                      isSelected
                        ? 'bg-orange-50/40'
                        : 'hover:bg-muted/40'
                    )}
                  >
                    {isSelected && (
                      <span
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ background: 'linear-gradient(180deg, #EA580C, #DB2777)' }}
                      />
                    )}
                    {isUnread && !isSelected && (
                      <span
                        className="absolute left-1.5 top-4 h-2 w-2 rounded-full"
                        style={{ background: '#EA580C' }}
                      />
                    )}

                    <div className="flex items-start gap-3 pl-2">
                      {/* Avatar with platform overlay */}
                      <div className="relative shrink-0">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{
                            background:
                              'linear-gradient(135deg, oklch(0.42 0.012 52), oklch(0.32 0.012 52))',
                          }}
                        >
                          {t.author.avatar}
                        </div>
                        <div
                          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-background"
                          style={{ background: cfg.bg }}
                        >
                          <PlatformIcon
                            platform={t.platform}
                            className="h-2 w-2"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={cn(
                              'truncate text-xs',
                              isUnread ? 'font-bold text-foreground' : 'font-semibold text-foreground/90'
                            )}
                          >
                            {t.author.name}
                          </p>
                          {t.author.verified && (
                            <svg
                              className="h-3 w-3 shrink-0 text-sky-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-4-3.818-4-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                            </svg>
                          )}
                          <span className="ml-auto text-[10px] text-muted-foreground tabular-nums shrink-0">
                            {relativeTime(t.ts)}
                          </span>
                        </div>

                        <p className="text-[10px] text-muted-foreground truncate">
                          @{t.author.handle}
                          {' · '}
                          <span style={{ color: cfg.color }}>{KIND_LABEL[t.kind]}</span>
                        </p>

                        <p
                          className={cn(
                            'mt-1.5 text-xs leading-relaxed line-clamp-2',
                            isUnread ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {t.preview}
                        </p>

                        {/* Status / sentiment chips */}
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          {t.sentiment !== 'neutral' && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                              style={{ background: sent.bg, color: sent.text }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: sent.dot }} />
                              {sent.label}
                            </span>
                          )}
                          {t.priority === 'high' && t.status !== 'replied' && (
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                              Priority
                            </span>
                          )}
                          {t.status === 'replied' && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Replied
                            </span>
                          )}
                          {t.status === 'snoozed' && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                              💤 Snoozed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* ── Right: thread view + AI reply pane ────────────────────────── */}
        <section
          className={cn(
            'flex-1 flex-col min-w-0',
            mobileThreadOpen ? 'flex w-full' : 'hidden md:flex'
          )}
        >
          {selected ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-2 border-b border-border/60 bg-background/95 px-4 sm:px-6 py-4">
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileThreadOpen(false)}
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
                  aria-label="Back to inbox"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, oklch(0.42 0.012 52), oklch(0.32 0.012 52))',
                  }}
                >
                  {selected.author.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm">{selected.author.name}</h2>
                    {selected.author.verified && (
                      <svg className="h-3.5 w-3.5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-4-3.818-4-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                      </svg>
                    )}
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        background: PLATFORM_COLOR[selected.platform].bg,
                        color: PLATFORM_COLOR[selected.platform].color,
                      }}
                    >
                      {KIND_LABEL[selected.kind]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    @{selected.author.handle}
                    {selected.author.followers ? ` · ${selected.author.followers} followers` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSnooze}
                    className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Snooze
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info('Opening on platform…')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Open on {selected.platform}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Conversation body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Post context if applicable */}
                {selected.postContext && (
                  <div
                    className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                    style={{ borderLeft: `3px solid ${PLATFORM_COLOR[selected.platform].color}` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      Post context
                    </p>
                    <p className="text-xs text-muted-foreground italic">{selected.postContext}</p>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3">
                  {selected.messages.map((msg) => {
                    const fromYou = msg.from === 'you'
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex gap-3', fromYou && 'flex-row-reverse')}
                      >
                        <div
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                            fromYou ? '' : ''
                          )}
                          style={{
                            background: fromYou
                              ? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)'
                              : 'linear-gradient(135deg, oklch(0.42 0.012 52), oklch(0.32 0.012 52))',
                          }}
                        >
                          {fromYou ? 'You' : selected.author.avatar}
                        </div>
                        <div className={cn('max-w-[75%]', fromYou && 'items-end')}>
                          <div
                            className={cn(
                              'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                              fromYou
                                ? 'rounded-tr-sm text-white'
                                : 'rounded-tl-sm bg-muted/50 border border-border/40 text-foreground'
                            )}
                            style={
                              fromYou
                                ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                                : undefined
                            }
                          >
                            {msg.body}
                          </div>
                          <p className={cn('mt-1 text-[10px] text-muted-foreground', fromYou && 'text-right')}>
                            {formatTimestamp(msg.ts)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Reply Coach + Composer */}
              <div className="border-t border-border/60 bg-card/50 backdrop-blur-sm px-6 py-4 space-y-3 shrink-0">
                {/* Marcus avatar + signals */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)' }}
                  >
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-foreground">Marcus · Reply Coach</p>
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-50 px-1.5 py-0 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                        AI
                      </span>
                    </div>
                    {selected.signals && selected.signals.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selected.signals.map((sig) => (
                          <span
                            key={sig}
                            className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tone picker (only show if suggestions exist) */}
                {suggestions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">
                      Generate reply:
                    </p>
                    {(['warm', 'direct', 'witty'] as const).map((t) => {
                      const has = suggestions.some((s) => s.tone === t)
                      if (!has) return null
                      const isActive = generatedTone === t
                      return (
                        <button
                          key={t}
                          onClick={() => useSuggestion(t)}
                          disabled={generating}
                          className={cn(
                            'rounded-full px-3 py-1 text-[11px] font-bold transition-all border',
                            isActive
                              ? 'text-white border-transparent shadow-sm'
                              : 'border-border/60 text-foreground hover:bg-muted disabled:opacity-50'
                          )}
                          style={
                            isActive
                              ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                              : undefined
                          }
                        >
                          {generating && tone === t ? (
                            <span className="inline-flex items-center gap-1.5">
                              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Writing…
                            </span>
                          ) : (
                            TONE_LABEL[t]
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Composer */}
                <div className="rounded-xl border border-border/60 bg-background focus-within:ring-2 focus-within:ring-orange-300/40 focus-within:border-orange-300/60 transition-shadow">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Write a reply to ${selected.author.name}…`}
                    rows={3}
                    className="w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {draft.length} chars
                      {generatedTone && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 not-italic">
                          ✦ AI · {TONE_LABEL[generatedTone]}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDraft('')
                          setGeneratedTone(null)
                        }}
                        disabled={!draft || generating}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={!draft.trim() || generating}
                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                      >
                        Send
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p className="text-sm">Select a conversation to start replying</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Stat chip in header ──────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-base font-black tabular-nums" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
