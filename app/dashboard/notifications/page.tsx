'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'info' | 'warn' | 'danger'
type Category = 'publishing' | 'inbox' | 'trends' | 'connections' | 'team' | 'system'
type State = 'unread' | 'read' | 'archived'

interface Notif {
  id: string
  icon: string
  title: string
  body: string
  time: string
  href?: string
  state: State
  tone: Tone
  category: Category
}

const SAMPLE: Notif[] = [
  {
    id: 'n1',
    icon: '✅',
    title: '3 posts published',
    body: 'X, LinkedIn, Instagram — your morning queue went out clean.',
    time: '12 min ago',
    href: '/dashboard/calendar',
    state: 'unread',
    tone: 'success',
    category: 'publishing',
  },
  {
    id: 'n2',
    icon: '🔥',
    title: 'Maya Chen replied to your post',
    body: '"This is exactly the framework I needed…"',
    time: '24 min ago',
    href: '/dashboard/inbox',
    state: 'unread',
    tone: 'info',
    category: 'inbox',
  },
  {
    id: 'n3',
    icon: '📈',
    title: 'Trend match — 96% relevant',
    body: '"AI agents replacing SaaS" is hot right now.',
    time: '1h ago',
    href: '/dashboard/trends',
    state: 'unread',
    tone: 'info',
    category: 'trends',
  },
  {
    id: 'n4',
    icon: '⚠️',
    title: 'TikTok token expires in 3 days',
    body: 'Reconnect to keep Auto-Pilot running.',
    time: '4h ago',
    href: '/dashboard/accounts',
    state: 'read',
    tone: 'warn',
    category: 'connections',
  },
  {
    id: 'n5',
    icon: '🤖',
    title: 'LinkedIn Agent drafted next week\'s posts',
    body: '7 drafts ready for your review.',
    time: '1d ago',
    href: '/dashboard/drafts',
    state: 'read',
    tone: 'info',
    category: 'publishing',
  },
  {
    id: 'n6',
    icon: '👥',
    title: 'Theo Williams accepted the invite',
    body: 'Now an Editor in Your Brand workspace.',
    time: '1d ago',
    href: '/dashboard/team',
    state: 'read',
    tone: 'info',
    category: 'team',
  },
  {
    id: 'n7',
    icon: '🛑',
    title: 'Crisis Mode armed by Demi Laurence',
    body: '"Investigating a customer complaint about pricing."',
    time: '2d ago',
    href: '/dashboard/team',
    state: 'read',
    tone: 'danger',
    category: 'system',
  },
  {
    id: 'n8',
    icon: '✨',
    title: 'New release · v2026.05',
    body: 'Studio multi-format remix, Pipeline kanban, Insights, public Roadmap, and Crisis Mode shipped this week.',
    time: '2d ago',
    href: '/changelog',
    state: 'read',
    tone: 'info',
    category: 'system',
  },
  {
    id: 'n9',
    icon: '⚡',
    title: 'Auto-Pilot rate-limit hit',
    body: 'TikTok queue paused at the 4-posts/day cap. Will resume tomorrow.',
    time: '3d ago',
    href: '/dashboard/agents/tiktok',
    state: 'archived',
    tone: 'warn',
    category: 'publishing',
  },
  {
    id: 'n10',
    icon: '👤',
    title: 'New mention on X',
    body: '@nadiawrites tagged you in a thread on AI tooling.',
    time: '3d ago',
    href: '/dashboard/inbox',
    state: 'archived',
    tone: 'info',
    category: 'inbox',
  },
]

const FILTERS: { id: 'inbox' | 'unread' | 'read' | 'archived'; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
  { id: 'archived', label: 'Archived' },
]

const CATS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'inbox', label: 'Mentions' },
  { id: 'trends', label: 'Trends' },
  { id: 'connections', label: 'Connections' },
  { id: 'team', label: 'Team' },
  { id: 'system', label: 'System' },
]

const TONE_BORDER: Record<Tone, string> = {
  success: 'border-emerald-200/60',
  info: 'border-border/60',
  warn: 'border-amber-200/60',
  danger: 'border-rose-200/60',
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>(SAMPLE)
  const [tab, setTab] = useState<'inbox' | 'unread' | 'read' | 'archived'>('inbox')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [groupSimilar, setGroupSimilar] = useState(true)

  const counts = useMemo(() => {
    const c = { inbox: 0, unread: 0, read: 0, archived: 0 }
    for (const n of items) {
      if (n.state !== 'archived') c.inbox++
      if (n.state === 'unread') c.unread++
      if (n.state === 'read') c.read++
      if (n.state === 'archived') c.archived++
    }
    return c
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (tab === 'inbox' && n.state === 'archived') return false
      if (tab === 'unread' && n.state !== 'unread') return false
      if (tab === 'read' && n.state !== 'read') return false
      if (tab === 'archived' && n.state !== 'archived') return false
      if (cat !== 'all' && n.category !== cat) return false
      return true
    })
  }, [items, tab, cat])

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, state: 'read' } : n)))
  }

  function archive(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, state: 'archived' } : n)))
    toast.message('Archived')
  }

  function unarchive(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, state: 'read' } : n)))
    toast.message('Restored to inbox')
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => (n.state === 'unread' ? { ...n, state: 'read' } : n)))
    toast.success('All caught up')
  }

  function archiveAllRead() {
    setItems((prev) => prev.map((n) => (n.state === 'read' ? { ...n, state: 'archived' } : n)))
    toast.message('Archived all read')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Notifications"
        description="Every signal from your workspace, in one place. Triage, archive, or follow the link to act."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
              {counts.unread} unread
            </Badge>
            <Button variant="outline" size="sm" className="text-xs" onClick={markAllRead} disabled={counts.unread === 0}>
              Mark all read
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/dashboard/settings#notifications">Preferences →</Link>
            </Button>
          </div>
        }
      />

      <div className="border-b border-border/60 bg-card/30 px-6 flex items-center gap-1">
        {FILTERS.map((f) => {
          const active = tab === f.id
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(f.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-semibold transition-colors capitalize',
                active
                  ? 'text-foreground border-b-2 border-orange-500 -mb-px'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  active ? 'bg-orange-500/15 text-orange-700' : 'bg-muted text-muted-foreground',
                )}
              >
                {counts[f.id]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  cat === c.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={groupSimilar} onCheckedChange={setGroupSimilar} aria-label="Group similar" />
              Group similar
            </label>
            {tab === 'read' && counts.read > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={archiveAllRead}>
                Archive all read
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl">
                ✨
              </div>
              <p className="text-sm font-semibold">
                {tab === 'unread' ? 'You\'re all caught up.' : tab === 'archived' ? 'Nothing archived.' : 'Quiet on this side of the workspace.'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Notifications appear here as they happen. Mute spam clusters from the Inbox.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0 divide-y divide-border/40">
              {filtered.map((n) => (
                <NotifRow
                  key={n.id}
                  notif={n}
                  onRead={() => markRead(n.id)}
                  onArchive={() => archive(n.id)}
                  onUnarchive={() => unarchive(n.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function NotifRow({
  notif,
  onRead,
  onArchive,
  onUnarchive,
}: {
  notif: Notif
  onRead: () => void
  onArchive: () => void
  onUnarchive: () => void
}) {
  const isUnread = notif.state === 'unread'
  const isArchived = notif.state === 'archived'

  return (
    <div
      className={cn(
        'group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30',
        isUnread && 'bg-orange-50/40 dark:bg-orange-500/5',
        TONE_BORDER[notif.tone],
      )}
    >
      <div className="text-2xl shrink-0 leading-none mt-0.5">{notif.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {notif.href ? (
            <Link
              href={notif.href}
              onClick={() => isUnread && onRead()}
              className="text-sm font-semibold leading-snug hover:text-orange-600 transition-colors"
            >
              {notif.title}
            </Link>
          ) : (
            <span className="text-sm font-semibold leading-snug">{notif.title}</span>
          )}
          {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-label="Unread" />}
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">
            {notif.category}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{notif.body}</p>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{notif.time}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 sm:opacity-100">
        {isUnread && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={onRead}>
            Mark read
          </Button>
        )}
        {!isArchived ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={onArchive}>
            Archive
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={onUnarchive}>
            Restore
          </Button>
        )}
      </div>
    </div>
  )
}
