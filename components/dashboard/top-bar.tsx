'use client'

import Link from 'next/link'
import { NotificationsButton } from '@/components/dashboard/notifications'

export function TopBar() {
  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent('command-palette:open'))
  }

  return (
    <div className="hidden lg:flex items-center justify-end gap-2 border-b border-border/60 bg-card/30 px-6 h-12 backdrop-blur-md sticky top-0 z-30">
      <button
        onClick={openCommandPalette}
        className="group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 pl-3 pr-2 py-1.5 text-xs text-muted-foreground hover:bg-background hover:border-border transition-colors min-w-[260px]"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">⌘K</kbd>
      </button>

      <NotificationsButton />

      <Link
        href="/dashboard/help"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Help"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </Link>
    </div>
  )
}
