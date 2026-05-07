'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { AGENTS } from '@/lib/agents'

interface Action {
  id: string
  label: string
  desc?: string
  icon: React.ReactNode
  href?: string
  group: 'Navigate' | 'Create' | 'Agents' | 'Account' | 'Help'
  shortcut?: string
  keywords?: string[]
}

const NAV_ACTIONS: Action[] = [
  { id: 'dash', label: 'Dashboard', icon: '🏠', href: '/dashboard', group: 'Navigate', shortcut: 'g d' },
  { id: 'inbox', label: 'Inbox', desc: 'Replies, mentions, DMs', icon: '📬', href: '/dashboard/inbox', group: 'Navigate', shortcut: 'g i' },
  { id: 'approvals', label: 'Approvals', desc: 'Drafts pending your sign-off', icon: '✅', href: '/dashboard/approvals', group: 'Navigate', shortcut: 'g v', keywords: ['approve', 'review', 'pending'] },
  { id: 'library', label: 'Asset Library', desc: 'Images, video, templates', icon: '🖼️', href: '/dashboard/library', group: 'Navigate', shortcut: 'g l', keywords: ['assets', 'media', 'images', 'templates'] },
  { id: 'pipeline', label: 'Pipeline', desc: 'Kanban: Idea → Published', icon: '📋', href: '/dashboard/pipeline', group: 'Navigate', shortcut: 'g p', keywords: ['kanban', 'board', 'flow'] },
  { id: 'workflows', label: 'Workflows', desc: 'Recipes & automations', icon: '⚙️', href: '/dashboard/workflows', group: 'Navigate', shortcut: 'g w', keywords: ['recipes', 'automation', 'rules'] },
  { id: 'create', label: 'Create content', icon: '✨', href: '/dashboard/create', group: 'Create', shortcut: 'c' },
  { id: 'autopilot', label: 'Auto-Pilot', icon: '⚡', href: '/dashboard/autopilot', group: 'Create' },
  { id: 'drafts', label: 'Drafts', icon: '📝', href: '/dashboard/drafts', group: 'Navigate', shortcut: 'g f' },
  { id: 'calendar', label: 'Calendar', icon: '📅', href: '/dashboard/calendar', group: 'Navigate', shortcut: 'g c' },
  { id: 'analytics', label: 'Analytics', icon: '📊', href: '/dashboard/analytics', group: 'Navigate', shortcut: 'g a' },
  { id: 'trends', label: 'Trends & Discovery', icon: '🔥', href: '/dashboard/trends', group: 'Navigate', keywords: ['discovery', 'topics'] },
  { id: 'brand', label: 'Brand Kit', icon: '🎨', href: '/dashboard/brand', group: 'Navigate', keywords: ['voice', 'palette', 'hashtags'] },
  { id: 'team', label: 'Team & Workspace', desc: 'Members, roles, invites, audit log', icon: '👥', href: '/dashboard/team', group: 'Account', shortcut: 'g t', keywords: ['workspace', 'members', 'roles', 'audit'] },
  { id: 'accounts', label: 'Accounts', icon: '🔌', href: '/dashboard/accounts', group: 'Account' },
  { id: 'developers', label: 'Developers', desc: 'API keys, webhooks, code samples', icon: '🛠️', href: '/dashboard/developers', group: 'Account', keywords: ['api', 'webhooks', 'sdk'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/dashboard/settings', group: 'Account' },
  { id: 'agents', label: 'AI Agents', icon: '🤖', href: '/dashboard/agents', group: 'Navigate' },
  { id: 'help', label: 'Help Center', icon: '❓', href: '/dashboard/help', group: 'Help' },
  { id: 'changelog', label: 'Changelog', icon: '📝', href: '/changelog', group: 'Help' },
  { id: 'status', label: 'System Status', icon: '🟢', href: '/status', group: 'Help' },
  { id: 'security', label: 'Security', icon: '🔒', href: '/security', group: 'Help' },
  { id: 'shortcuts', label: 'Keyboard shortcuts', desc: 'Press ? for the full list', icon: '⌨️', href: '#open-shortcuts', group: 'Help', shortcut: '?' },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    const onToggle = () => setOpen((o) => !o)
    document.addEventListener('keydown', onKey)
    window.addEventListener('command-palette:open', onOpen)
    window.addEventListener('command-palette:toggle', onToggle)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('command-palette:open', onOpen)
      window.removeEventListener('command-palette:toggle', onToggle)
    }
  }, [])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      if (href === '#open-shortcuts') {
        // dispatch as a real ? key on document so the ShortcutsOverlay picks it up
        // without us coupling the two components
        if (typeof document !== 'undefined') {
          const evt = new KeyboardEvent('keydown', { key: '?', bubbles: true })
          document.dispatchEvent(evt)
        }
        return
      }
      router.push(href)
    },
    [router],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Search or navigate">
      <CommandInput placeholder="Search for an action, page, or agent…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {(['Navigate', 'Create', 'Account', 'Help'] as const).map((group) => {
          const items = NAV_ACTIONS.filter((a) => a.group === group)
          if (items.length === 0) return null
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.label} ${a.desc ?? ''} ${a.keywords?.join(' ') ?? ''}`}
                  onSelect={() => a.href && go(a.href)}
                >
                  <span className="mr-1">{a.icon}</span>
                  <span>{a.label}</span>
                  {a.desc && <span className="ml-2 text-xs text-muted-foreground">{a.desc}</span>}
                  {a.shortcut && <CommandShortcut>{a.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}

        <CommandSeparator />

        <CommandGroup heading="Talk to an agent">
          {AGENTS.map((agent) => (
            <CommandItem
              key={agent.id}
              value={`Talk to ${agent.name} ${agent.role}`}
              onSelect={() => go(`/dashboard/agents/${agent.id}`)}
            >
              <span
                className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
              >
                {agent.avatar}
              </span>
              <span>Talk to {agent.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{agent.role}</span>
              {agent.premium && (
                <CommandShortcut>
                  <span className="text-[9px] uppercase tracking-widest text-orange-600">Pro</span>
                </CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Workspace shortcuts">
          <CommandItem value="Invite a teammate" onSelect={() => go('/dashboard/team')}>
            <span className="mr-1">✉️</span>
            <span>Invite a teammate</span>
            <span className="ml-2 text-xs text-muted-foreground">Members & roles</span>
          </CommandItem>
          <CommandItem value="Workspace audit log" onSelect={() => go('/dashboard/team')}>
            <span className="mr-1">📜</span>
            <span>Open audit log</span>
          </CommandItem>
          {AGENTS.map((agent) => (
            <CommandItem
              key={`customize-${agent.id}`}
              value={`Customize ${agent.name}`}
              onSelect={() => go(`/dashboard/agents/${agent.id}`)}
            >
              <span className="mr-1">⚙️</span>
              <span>Customize {agent.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick draft">
          {[
            { tone: 'Witty', emoji: '😄' },
            { tone: 'Professional', emoji: '💼' },
            { tone: 'Bold', emoji: '🔥' },
            { tone: 'Storytelling', emoji: '📖' },
          ].map((q) => (
            <CommandItem
              key={q.tone}
              value={`Quick draft ${q.tone}`}
              onSelect={() => go(`/dashboard/create?tone=${q.tone.toLowerCase()}`)}
            >
              <span className="mr-1">{q.emoji}</span>
              <span>New post · {q.tone} tone</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
