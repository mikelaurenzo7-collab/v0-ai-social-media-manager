'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Workspace {
  id: string
  name: string
  slug: string
  role: 'Owner' | 'Admin' | 'Editor' | 'Approver' | 'Viewer'
  plan: 'Free' | 'Pro' | 'Business' | 'Enterprise'
  hue: string
}

const SAMPLE_WORKSPACES: Workspace[] = [
  { id: 'ws-1', name: 'Your Brand', slug: 'your-brand', role: 'Owner', plan: 'Pro', hue: 'from-orange-500 to-pink-600' },
  { id: 'ws-2', name: 'Northwave Agency', slug: 'northwave', role: 'Admin', plan: 'Business', hue: 'from-sky-500 to-blue-700' },
  { id: 'ws-3', name: 'Halewise · Client', slug: 'halewise', role: 'Editor', plan: 'Pro', hue: 'from-violet-500 to-purple-600' },
  { id: 'ws-4', name: 'BrightLabs', slug: 'brightlabs', role: 'Approver', plan: 'Business', hue: 'from-emerald-500 to-teal-600' },
]

export function WorkspaceSwitcher() {
  const router = useRouter()
  const [active, setActive] = useState<Workspace>(SAMPLE_WORKSPACES[0])
  const [open, setOpen] = useState(false)

  function switchTo(ws: Workspace) {
    if (ws.id === active.id) {
      setOpen(false)
      return
    }
    setActive(ws)
    setOpen(false)
    toast.success(`Switched to ${ws.name}`, { description: `${ws.role} · ${ws.plan} plan` })
    router.refresh()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/5"
          style={{ background: 'oklch(0.185 0.016 48)' }}
          aria-label="Switch workspace"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white bg-gradient-to-br ${active.hue}`}
          >
            {active.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-bold text-white leading-tight">{active.name}</p>
            <p className="truncate text-[10px] text-white/45 mt-0.5">
              {active.role} · {active.plan}
            </p>
          </div>
          <svg
            className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover:text-white/60 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Switch workspace
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SAMPLE_WORKSPACES.map((ws) => {
          const isActive = ws.id === active.id
          return (
            <DropdownMenuItem
              key={ws.id}
              onSelect={(e) => {
                e.preventDefault()
                switchTo(ws)
              }}
              className="gap-2.5 cursor-pointer"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white bg-gradient-to-br ${ws.hue}`}
              >
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{ws.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {ws.role} · {ws.plan}
                </p>
              </div>
              {isActive && (
                <svg
                  className="h-3.5 w-3.5 text-orange-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/team" className="cursor-pointer text-xs">
            <span className="text-muted-foreground mr-2">⚙</span>
            Workspace settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            toast.message('Create workspace', {
              description: 'Multi-workspace creation lands in the next release.',
            })
          }
          className="cursor-pointer text-xs"
        >
          <span className="text-muted-foreground mr-2">+</span>
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
