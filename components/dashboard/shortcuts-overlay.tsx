'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShortcutGroup {
  label: string
  items: { keys: string[]; desc: string }[]
}

const GROUPS: ShortcutGroup[] = [
  {
    label: 'Global',
    items: [
      { keys: ['⌘', 'K'], desc: 'Open command palette' },
      { keys: ['?'], desc: 'Show this overlay' },
      { keys: ['Esc'], desc: 'Close any dialog' },
    ],
  },
  {
    label: 'Navigate',
    items: [
      { keys: ['G', 'D'], desc: 'Go to Dashboard' },
      { keys: ['G', 'I'], desc: 'Go to Inbox' },
      { keys: ['G', 'V'], desc: 'Go to Approvals' },
      { keys: ['G', 'F'], desc: 'Go to Drafts' },
      { keys: ['G', 'C'], desc: 'Go to Calendar' },
      { keys: ['G', 'A'], desc: 'Go to Analytics' },
      { keys: ['G', 'L'], desc: 'Go to Library' },
      { keys: ['G', 'P'], desc: 'Go to Pipeline' },
      { keys: ['G', 'W'], desc: 'Go to Workflows' },
      { keys: ['G', 'T'], desc: 'Go to Team' },
    ],
  },
  {
    label: 'Create',
    items: [
      { keys: ['C'], desc: 'New post' },
      { keys: ['C', 'T'], desc: 'New thread' },
      { keys: ['C', 'E'], desc: 'New email draft' },
    ],
  },
  {
    label: 'Inbox & Approvals',
    items: [
      { keys: ['J'], desc: 'Next item' },
      { keys: ['K'], desc: 'Previous item' },
      { keys: ['A'], desc: 'Approve selected draft' },
      { keys: ['R'], desc: 'Reply to selected message' },
      { keys: ['Shift', 'A'], desc: 'Mark all read' },
    ],
  },
]

const NAV_ROUTES: Record<string, string> = {
  d: '/dashboard',
  i: '/dashboard/inbox',
  v: '/dashboard/approvals',
  f: '/dashboard/drafts',
  c: '/dashboard/calendar',
  a: '/dashboard/analytics',
  l: '/dashboard/library',
  p: '/dashboard/pipeline',
  w: '/dashboard/workflows',
  t: '/dashboard/team',
}

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let pendingG = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const onKey = (e: KeyboardEvent) => {
      // ignore when user is typing into an input/textarea/contenteditable
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      const editable =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      if (editable) return

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((prev) => !prev)
        return
      }

      if (e.key === 'Escape') {
        setOpen(false)
        return
      }

      // chord: g + letter
      if (pendingG) {
        const target = NAV_ROUTES[e.key.toLowerCase()]
        pendingG = false
        if (timer) clearTimeout(timer)
        timer = null
        if (target) {
          e.preventDefault()
          if (typeof window !== 'undefined') window.location.href = target
        }
        return
      }
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingG = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          pendingG = false
        }, 900)
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (timer) clearTimeout(timer)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Press{' '}
            <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px]">?</kbd>{' '}
            from anywhere outside an input to open this.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                {g.label}
              </p>
              <ul className="space-y-1.5">
                {g.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground/80">{item.desc}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
