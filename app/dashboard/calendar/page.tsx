'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────

type PlatformId = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook'
type PostStatus = 'published' | 'scheduled' | 'draft'

interface CalendarPost {
  id: string
  content: string
  platform: PlatformId
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  status: PostStatus
}

// ── Platform display config ────────────────────────────────────────────────────

const PLATFORM: Record<PlatformId, { label: string; abbr: string; color: string; bg: string; text: string }> = {
  twitter:   { label: 'X/Twitter', abbr: 'X',  color: '#1D9BF0', bg: '#EFF9FF', text: '#1D9BF0' },
  instagram: { label: 'Instagram', abbr: 'IG', color: '#E1306C', bg: '#FFF0F6', text: '#E1306C' },
  linkedin:  { label: 'LinkedIn',  abbr: 'LI', color: '#0A66C2', bg: '#EFF6FF', text: '#0A66C2' },
  tiktok:    { label: 'TikTok',    abbr: 'TK', color: '#6366F1', bg: '#F0F0FF', text: '#6366F1' },
  facebook:  { label: 'Facebook',  abbr: 'FB', color: '#1877F2', bg: '#EEF2FF', text: '#1877F2' },
}

// ── Mock scheduled posts for May 2026 ─────────────────────────────────────────

const SEED_POSTS: CalendarPost[] = [
  { id: 's1',  content: '5 productivity systems that actually work (not just theory)…',                         platform: 'tiktok',    date: '2026-05-01', time: '10:00', status: 'published' },
  { id: 's2',  content: 'Why most LinkedIn posts fail in the first 3 words',                                   platform: 'linkedin',  date: '2026-05-01', time: '09:00', status: 'published' },
  { id: 's3',  content: 'The underrated skill that separates good creators from great ones 🧵',                platform: 'twitter',   date: '2026-05-02', time: '08:00', status: 'published' },
  { id: 's4',  content: 'Behind the scenes of my content creation workflow',                                   platform: 'instagram', date: '2026-05-03', time: '11:00', status: 'published' },
  { id: 's5',  content: 'Hot take: Consistency is overrated. This matters more.',                              platform: 'tiktok',    date: '2026-05-05', time: '17:00', status: 'published' },
  { id: 's6',  content: 'Building in public is the most underrated growth strategy in 2026',                  platform: 'linkedin',  date: '2026-05-06', time: '09:30', status: 'published' },
  { id: 's7',  content: 'The 3-sentence hook formula that tripled my engagement 📈',                           platform: 'twitter',   date: '2026-05-07', time: '08:00', status: 'scheduled' },
  { id: 's8',  content: 'How I batch 2 weeks of content in one Sunday session',                                platform: 'instagram', date: '2026-05-07', time: '18:00', status: 'scheduled' },
  { id: 's9',  content: 'Why your content strategy needs a POV before it needs a plan',                        platform: 'linkedin',  date: '2026-05-08', time: '08:30', status: 'scheduled' },
  { id: 's10', content: 'The algorithm change nobody is talking about this week',                              platform: 'tiktok',    date: '2026-05-09', time: '17:00', status: 'scheduled' },
  { id: 's11', content: 'What 100 days of daily posts taught me about audience building',                      platform: 'twitter',   date: '2026-05-10', time: '07:30', status: 'scheduled' },
  { id: 's12', content: 'Sunday morning routine for creators 🌅',                                              platform: 'instagram', date: '2026-05-10', time: '09:00', status: 'scheduled' },
  { id: 's13', content: 'The counterintuitive reason your engagement rate is dropping',                        platform: 'linkedin',  date: '2026-05-12', time: '08:00', status: 'scheduled' },
  { id: 's14', content: 'I tested 10 different posting times. Here are the results:',                          platform: 'tiktok',    date: '2026-05-13', time: '17:30', status: 'scheduled' },
  { id: 's15', content: '7 hooks that went viral last week (and why they worked) 🧵',                          platform: 'twitter',   date: '2026-05-14', time: '08:00', status: 'scheduled' },
  { id: 's16', content: 'The content calendar template I use for 6-figure creators',                           platform: 'linkedin',  date: '2026-05-15', time: '09:00', status: 'scheduled' },
  { id: 's17', content: "Friday energy check — what's your content goal this weekend?",                       platform: 'instagram', date: '2026-05-15', time: '18:00', status: 'scheduled' },
  { id: 's18', content: 'Stop optimizing for reach. Optimize for THIS instead.',                               platform: 'tiktok',    date: '2026-05-17', time: '10:00', status: 'scheduled' },
  { id: 's19', content: 'Growth hack or growth trap? The real difference:',                                    platform: 'twitter',   date: '2026-05-19', time: '08:30', status: 'scheduled' },
  { id: 's20', content: 'The creator economy is shifting again. Are you ready?',                               platform: 'linkedin',  date: '2026-05-20', time: '09:00', status: 'scheduled' },
  { id: 's21', content: 'My honest review of every content tool I used this month',                            platform: 'tiktok',    date: '2026-05-21', time: '17:00', status: 'scheduled' },
  { id: 's22', content: 'Throwback: my first ever post vs my best performing post 📊',                         platform: 'instagram', date: '2026-05-22', time: '12:00', status: 'scheduled' },
  { id: 's23', content: 'Non-obvious LinkedIn strategies that still work in 2026',                             platform: 'linkedin',  date: '2026-05-26', time: '08:00', status: 'scheduled' },
  { id: 's24', content: 'The only metric that matters for long-term creator success',                          platform: 'twitter',   date: '2026-05-27', time: '08:00', status: 'scheduled' },
  { id: 's25', content: 'End of month recap: what worked, what flopped, what\'s next',                         platform: 'tiktok',    date: '2026-05-29', time: '17:00', status: 'scheduled' },
  { id: 's26', content: 'May retrospective: my top 3 insights for June',                                      platform: 'instagram', date: '2026-05-30', time: '10:00', status: 'scheduled' },
  { id: 's27', content: 'June is going to be different. Here\'s my content plan 🗓️',                          platform: 'linkedin',  date: '2026-05-31', time: '09:00', status: 'scheduled' },
]

const BEST_TIMES = [
  { day: 'Mon', time: '8–9 AM',  platform: 'LinkedIn',  score: 92 },
  { day: 'Wed', time: '12–1 PM', platform: 'Instagram', score: 88 },
  { day: 'Fri', time: '5–7 PM',  platform: 'TikTok',    score: 96 },
  { day: 'Sat', time: '9–11 AM', platform: 'Instagram', score: 91 },
  { day: 'Sun', time: '7–8 PM',  platform: 'X/Twitter', score: 84 },
]

// ── Month helpers ──────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

// ── Platform chip ──────────────────────────────────────────────────────────────

function PlatformChip({ platform, time, status }: { platform: PlatformId; time: string; status: PostStatus }) {
  const cfg = PLATFORM[platform]
  return (
    <div
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none truncate"
      style={{ background: cfg.bg, color: cfg.text, opacity: status === 'published' ? 0.7 : 1 }}
    >
      <span>{cfg.abbr}</span>
      <span className="text-[9px] opacity-70 hidden sm:inline">{formatTime(time)}</span>
      {status === 'published' && (
        <svg className="h-2.5 w-2.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </div>
  )
}

// ── Selected day panel ─────────────────────────────────────────────────────────

function DayPanel({
  date,
  posts,
  onClose,
}: {
  date: string
  posts: CalendarPost[]
  onClose: () => void
}) {
  const d = new Date(date + 'T12:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleDelete = (id: string) => {
    try {
      const stored = localStorage.getItem('postpilot_scheduled')
      if (!stored) return
      const parsed: CalendarPost[] = JSON.parse(stored)
      const updated = parsed.filter((p) => p.id !== id)
      localStorage.setItem('postpilot_scheduled', JSON.stringify(updated))
      toast.success('Post removed from calendar')
    } catch {
      toast.error('Failed to remove post')
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(90deg, oklch(0.652 0.214 36 / 0.08) 0%, transparent 100%)', borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div>
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-muted-foreground">{posts.length} post{posts.length !== 1 ? 's' : ''} scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="text-xs h-7 px-3" style={{ background: 'var(--brand-gradient)' }}>
            <Link href={`/dashboard/create`}>+ Add Post</Link>
          </Button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-3xl mb-2">🗓️</span>
            <p className="text-sm font-medium">Nothing scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first post for this day</p>
            <Button asChild size="sm" className="mt-3 text-xs" style={{ background: 'var(--brand-gradient)' }}>
              <Link href="/dashboard/create">Create a post</Link>
            </Button>
          </div>
        ) : (
          posts
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((post) => {
              const cfg = PLATFORM[post.platform]
              return (
                <div
                  key={post.id}
                  className="group flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                    style={{ background: cfg.color }}
                  >
                    {cfg.abbr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{post.content}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{formatTime(post.time)}</span>
                      <span
                        className={cn(
                          'text-[10px] font-semibold rounded-full px-1.5 py-0.5',
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-orange-50 text-orange-700'
                        )}
                      >
                        {post.status === 'published' ? '✓ Published' : '⏰ Scheduled'}
                      </span>
                    </div>
                  </div>
                  {post.id.startsWith('u-') && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            })
        )}
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // May 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<CalendarPost[]>([])
  const [platformFilter, setPlatformFilter] = useState<Set<PlatformId>>(
    new Set(['twitter', 'instagram', 'linkedin', 'tiktok', 'facebook'])
  )

  const TODAY = '2026-05-07'

  useEffect(() => {
    try {
      const stored = localStorage.getItem('postpilot_scheduled')
      if (stored) {
        const parsed: CalendarPost[] = JSON.parse(stored)
        if (Array.isArray(parsed)) setUserPosts(parsed)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // All posts merged
  const allPosts = [...SEED_POSTS, ...userPosts]

  // Build a map from date-key → posts
  const postsByDate = allPosts.reduce<Record<string, CalendarPost[]>>((acc, p) => {
    if (!platformFilter.has(p.platform)) return acc
    if (!acc[p.date]) acc[p.date] = []
    acc[p.date].push(p)
    return acc
  }, {})

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday   = () => setCurrentDate(new Date(2026, 4, 1))

  // Upcoming posts (next 14 days from today)
  const upcoming = allPosts
    .filter((p) => p.date >= TODAY && p.status === 'scheduled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8)

  const togglePlatform = (p: PlatformId) => {
    setPlatformFilter((prev) => {
      const next = new Set(prev)
      if (next.has(p)) {
        if (next.size > 1) next.delete(p)
      } else {
        next.add(p)
      }
      return next
    })
  }

  const selectedPosts = selectedDate ? (postsByDate[selectedDate] ?? []) : []

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Content Calendar"
        description="Plan, schedule, and manage your content across all platforms"
        action={
          <Button asChild className="text-xs h-9" style={{ background: 'var(--brand-gradient)' }}>
            <Link href="/dashboard/create">+ Create Post</Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* ── Calendar ──────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Month nav */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:bg-muted transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h2 className="text-base font-black min-w-[160px] text-center">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:bg-muted transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={goToday}
                  className="rounded-lg border border-border/60 px-3 py-1 text-xs font-semibold hover:bg-muted transition-colors ml-1"
                >
                  Today
                </button>
              </div>

              {/* Platform filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(PLATFORM) as PlatformId[]).map((p) => {
                  const cfg = PLATFORM[p]
                  const active = platformFilter.has(p)
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all border',
                        active ? 'text-white border-transparent' : 'text-muted-foreground border-border/50 opacity-40 hover:opacity-60'
                      )}
                      style={active ? { background: cfg.color, borderColor: cfg.color } : {}}
                    >
                      {cfg.abbr}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border/60">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {Array.from({ length: totalCells }).map((_, i) => {
                  const dayNum = i - firstDay + 1
                  const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
                  const dateKey = isCurrentMonth ? toDateKey(year, month, dayNum) : null
                  const dayPosts = dateKey ? (postsByDate[dateKey] ?? []) : []
                  const isToday = dateKey === TODAY
                  const isPast = dateKey !== null && dateKey < TODAY
                  const isSelected = dateKey === selectedDate
                  const isWeekend = (i % 7 === 0 || i % 7 === 6)

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!isCurrentMonth) return
                        setSelectedDate(isSelected ? null : dateKey)
                      }}
                      disabled={!isCurrentMonth}
                      className={cn(
                        'relative min-h-[88px] p-1.5 text-left transition-colors border-b border-r border-border/40 last:border-r-0',
                        isCurrentMonth
                          ? 'hover:bg-muted/40 cursor-pointer'
                          : 'bg-muted/10 cursor-default',
                        isSelected && 'bg-orange-50 ring-2 ring-orange-400 ring-inset',
                        isPast && isCurrentMonth && !isSelected && 'opacity-60',
                        isWeekend && isCurrentMonth && !isSelected && 'bg-muted/20',
                      )}
                    >
                      {/* Day number */}
                      {isCurrentMonth && (
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold mb-1',
                            isToday
                              ? 'text-white'
                              : 'text-foreground'
                          )}
                          style={isToday ? { background: 'var(--brand-gradient)' } : {}}
                        >
                          {dayNum}
                        </span>
                      )}

                      {/* Post chips */}
                      <div className="space-y-0.5">
                        {dayPosts.slice(0, 3).map((post) => (
                          <PlatformChip
                            key={post.id}
                            platform={post.platform}
                            time={post.time}
                            status={post.status}
                          />
                        ))}
                        {dayPosts.length > 3 && (
                          <p className="text-[9px] font-bold text-muted-foreground px-1">
                            +{dayPosts.length - 3} more
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected day panel */}
            {selectedDate && (
              <DayPanel
                date={selectedDate}
                posts={selectedPosts}
                onClose={() => setSelectedDate(null)}
              />
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 flex-wrap text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-gradient)' }} />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 opacity-70" />
                <span>Published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground opacity-50" />
                <span>Weekend</span>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ──────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Month summary */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">May Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Scheduled', value: SEED_POSTS.filter(p => p.status === 'scheduled').length, color: '#EA580C' },
                  { label: 'Published', value: SEED_POSTS.filter(p => p.status === 'published').length, color: '#10B981' },
                  { label: 'Platforms', value: 5, color: '#6366F1' },
                  { label: 'Avg / Day',  value: '0.9', color: '#0A66C2' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upcoming</h3>
                <span className="text-[10px] text-muted-foreground">next 14 days</span>
              </div>
              <div className="space-y-2">
                {upcoming.slice(0, 6).map((post) => {
                  const cfg = PLATFORM[post.platform]
                  const d = new Date(post.date + 'T12:00:00')
                  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  return (
                    <button
                      key={post.id}
                      onClick={() => {
                        setCurrentDate(new Date(post.date + 'T12:00:00'))
                        setSelectedDate(post.date)
                      }}
                      className="w-full flex items-start gap-2.5 rounded-xl border border-border/50 bg-muted/20 p-2.5 text-left hover:bg-muted/50 transition-colors group"
                    >
                      <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white"
                        style={{ background: cfg.color }}
                      >
                        {cfg.abbr}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{post.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{dayLabel} · {formatTime(post.time)}</p>
                      </div>
                    </button>
                  )
                })}
                {upcoming.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No posts scheduled. <Link href="/dashboard/create" className="font-semibold underline" style={{ color: '#EA580C' }}>Create one →</Link>
                  </p>
                )}
              </div>
            </div>

            {/* Best times to post */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-md shrink-0"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Best Times</h3>
              </div>
              <div className="space-y-2">
                {BEST_TIMES.map((bt) => (
                  <div key={bt.day + bt.time} className="flex items-center gap-2.5 rounded-xl bg-muted/30 p-2.5">
                    <div className="text-center shrink-0 w-7">
                      <p className="text-[10px] font-bold text-muted-foreground">{bt.day}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{bt.time}</p>
                      <p className="text-[10px] text-muted-foreground">{bt.platform}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${(bt.score / 100) * 40}px`, background: bt.score >= 90 ? '#EA580C' : '#DB2777' }}
                      />
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: bt.score >= 90 ? '#EA580C' : '#DB2777' }}>
                        {bt.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center">
                Scores based on your historical engagement
              </p>
            </div>

            {/* Quick create CTA */}
            <div
              className="relative overflow-hidden rounded-2xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #1A1210 0%, #2C1A12 100%)' }}
            >
              <div
                className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-full opacity-20 blur-xl"
                style={{ background: 'radial-gradient(circle, #EA580C, transparent)' }}
              />
              <div className="relative">
                <p className="text-xs font-bold mb-1">Ready to fill the gaps?</p>
                <p className="text-[11px] text-white/65 mb-3 leading-relaxed">
                  Use your AI agents to generate a week&apos;s worth of content in minutes.
                </p>
                <Link
                  href="/dashboard/agents"
                  className="inline-flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: '#FB923C' }}
                >
                  Open AI Agents
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
