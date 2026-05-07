'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Notif {
  id: string
  icon: string
  title: string
  body: string
  time: string
  href?: string
  unread: boolean
  tone?: 'success' | 'info' | 'warn'
}

const SAMPLE: Notif[] = [
  {
    id: '1',
    icon: '✅',
    title: '3 posts published',
    body: 'X, LinkedIn, Instagram — your morning queue went out clean.',
    time: '12 min ago',
    href: '/dashboard/calendar',
    unread: true,
    tone: 'success',
  },
  {
    id: '2',
    icon: '🔥',
    title: 'Maya Chen replied to your post',
    body: '"This is exactly the framework I needed…"',
    time: '24 min ago',
    href: '/dashboard/inbox',
    unread: true,
  },
  {
    id: '3',
    icon: '📈',
    title: 'Trend match — 96% relevant',
    body: '"AI agents replacing SaaS" is hot right now.',
    time: '1h ago',
    href: '/dashboard/trends',
    unread: true,
    tone: 'info',
  },
  {
    id: '4',
    icon: '⚠️',
    title: 'TikTok token expires in 3 days',
    body: 'Reconnect to keep Auto-Pilot running.',
    time: '4h ago',
    href: '/dashboard/accounts',
    unread: false,
    tone: 'warn',
  },
  {
    id: '5',
    icon: '🤖',
    title: 'LinkedIn Agent drafted next week\'s posts',
    body: '7 drafts ready for your review.',
    time: '1d ago',
    href: '/dashboard/drafts',
    unread: false,
  },
]

export function NotificationsButton() {
  const [items, setItems] = useState<Notif[]>(SAMPLE)
  const unread = items.filter((i) => i.unread).length

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Notifications"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <p className="text-sm font-bold">Notifications</p>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              You&apos;re all caught up. ✨
            </div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={n.href ?? '#'}
                onClick={() => {
                  if (n.unread) {
                    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, unread: false } : i)))
                  }
                }}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0',
                  n.unread && 'bg-orange-50/40 dark:bg-orange-500/5',
                )}
              >
                <div className="text-xl shrink-0 mt-0.5">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold leading-tight">{n.title}</p>
                    {n.unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/80">{n.time}</p>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/dashboard/notifications"
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            See all notifications →
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Preferences
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
