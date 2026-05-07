'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */

interface BioLink {
  id: string
  title: string
  url: string
  enabled: boolean
  clicks: number
}

interface BioPage {
  handle: string
  displayName: string
  bio: string
  avatarUrl: string
  theme: 'minimal' | 'gradient' | 'dark' | 'neon'
  links: BioLink[]
}

/* ─────────────────────────────────────────────────────────────────────────────
   Seed Data
───────────────────────────────────────────────────────────────────────────── */

const SEED_PAGE: BioPage = {
  handle: 'postpilot',
  displayName: 'PostPilot',
  bio: 'AI-powered social media manager. Draft, schedule, and publish across every channel.',
  avatarUrl: '',
  theme: 'gradient',
  links: [
    { id: '1', title: 'Try PostPilot Free', url: 'https://postpilot.app', enabled: true, clicks: 1247 },
    { id: '2', title: 'Follow on X', url: 'https://x.com/postpilot', enabled: true, clicks: 892 },
    { id: '3', title: 'LinkedIn', url: 'https://linkedin.com/company/postpilot', enabled: true, clicks: 456 },
    { id: '4', title: 'Latest Blog Post', url: 'https://postpilot.app/blog', enabled: true, clicks: 234 },
    { id: '5', title: 'Book a Demo', url: 'https://cal.com/postpilot', enabled: false, clicks: 0 },
  ],
}

const THEMES: { id: BioPage['theme']; name: string; preview: string }[] = [
  { id: 'minimal', name: 'Minimal', preview: 'bg-white' },
  { id: 'gradient', name: 'Gradient', preview: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
  { id: 'dark', name: 'Dark', preview: 'bg-neutral-900' },
  { id: 'neon', name: 'Neon', preview: 'bg-black' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

export default function LinksPage() {
  const [page, setPage] = useState<BioPage>(SEED_PAGE)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  // ─── Handlers ────────────────────────────────────────────────────────────
  const updatePage = useCallback((updates: Partial<BioPage>) => {
    setPage((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateLink = useCallback((id: string, updates: Partial<BioLink>) => {
    setPage((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }))
  }, [])

  const addLink = useCallback(() => {
    const newLink: BioLink = {
      id: crypto.randomUUID(),
      title: 'New Link',
      url: 'https://',
      enabled: true,
      clicks: 0,
    }
    setPage((prev) => ({ ...prev, links: [...prev.links, newLink] }))
    setEditingLinkId(newLink.id)
  }, [])

  const deleteLink = useCallback((id: string) => {
    setPage((prev) => ({ ...prev, links: prev.links.filter((l) => l.id !== id) }))
    toast.success('Link deleted')
  }, [])

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    setPage((prev) => {
      const links = [...prev.links]
      const fromIdx = links.findIndex((l) => l.id === draggedId)
      const toIdx = links.findIndex((l) => l.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = links.splice(fromIdx, 1)
      links.splice(toIdx, 0, moved)
      return { ...prev, links }
    })
  }
  const handleDragEnd = () => setDraggedId(null)

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://postpilot.app/@${page.handle}`)
    toast.success('Link copied to clipboard')
  }

  const totalClicks = page.links.reduce((sum, l) => sum + l.clicks, 0)

  // ─── Theme Styles ────────────────────────────────────────────────────────
  const themeStyles: Record<BioPage['theme'], { bg: string; card: string; text: string; subtext: string; border: string }> = {
    minimal: {
      bg: 'bg-gray-50',
      card: 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md',
      text: 'text-gray-900',
      subtext: 'text-gray-500',
      border: 'border-gray-200',
    },
    gradient: {
      bg: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
      card: 'bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30',
      text: 'text-white',
      subtext: 'text-white/70',
      border: 'border-white/20',
    },
    dark: {
      bg: 'bg-neutral-900',
      card: 'bg-neutral-800 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-750',
      text: 'text-white',
      subtext: 'text-neutral-400',
      border: 'border-neutral-700',
    },
    neon: {
      bg: 'bg-black',
      card: 'bg-black border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]',
      text: 'text-cyan-400',
      subtext: 'text-cyan-400/60',
      border: 'border-cyan-500/30',
    },
  }
  const ts = themeStyles[page.theme]

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: Editor Panel ─────────────────────────────────────────────── */}
      <section className="flex w-full flex-col border-r border-border/60 lg:w-[420px] xl:w-[480px] shrink-0 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Link in Bio</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Create a mini landing page for your profiles</p>
            </div>
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Copy URL
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6">
          {/* Profile Settings */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Handle</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">postpilot.app/@</span>
                  <input
                    type="text"
                    value={page.handle}
                    onChange={(e) => updatePage({ handle: e.target.value.replace(/[^a-z0-9_-]/gi, '').toLowerCase() })}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                <input
                  type="text"
                  value={page.displayName}
                  onChange={(e) => updatePage({ displayName: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Bio</label>
                <textarea
                  value={page.bio}
                  onChange={(e) => updatePage({ bio: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Theme</h2>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updatePage({ theme: t.id })}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
                    page.theme === t.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-muted-foreground/40'
                  )}
                >
                  <div className={cn('h-8 w-full rounded-md', t.preview)} />
                  <span className="text-[10px] font-medium text-muted-foreground">{t.name}</span>
                  {page.theme === t.id && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Links</h2>
              <span className="text-xs text-muted-foreground">{totalClicks.toLocaleString()} total clicks</span>
            </div>

            <div className="space-y-2">
              {page.links.map((link) => (
                <div
                  key={link.id}
                  draggable
                  onDragStart={() => handleDragStart(link.id)}
                  onDragOver={(e) => handleDragOver(e, link.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'group relative rounded-lg border bg-card p-3 transition-all',
                    draggedId === link.id ? 'opacity-50' : 'opacity-100',
                    !link.enabled && 'opacity-60'
                  )}
                >
                  {/* Drag handle */}
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>

                  <div className="ml-5">
                    {editingLinkId === link.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, { title: e.target.value })}
                          placeholder="Link title"
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          autoFocus
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => setEditingLinkId(null)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">{link.clicks} clicks</span>
                          <button
                            onClick={() => setEditingLinkId(link.id)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => updateLink(link.id, { enabled: !link.enabled })}
                            className={cn(
                              'relative h-5 w-9 rounded-full transition-colors',
                              link.enabled ? 'bg-primary' : 'bg-muted'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                                link.enabled ? 'left-[18px]' : 'left-0.5'
                              )}
                            />
                          </button>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLink}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Link
            </button>
          </div>
        </div>
      </section>

      {/* ── Right: Live Preview ────────────────────────────────────────────── */}
      <section className="hidden lg:flex flex-1 items-center justify-center bg-muted/30 p-8">
        <div className="relative">
          {/* Phone frame */}
          <div className="relative w-[320px] h-[640px] rounded-[40px] border-[8px] border-neutral-800 bg-neutral-800 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-neutral-800 rounded-b-2xl z-20" />

            {/* Screen */}
            <div className={cn('h-full w-full overflow-y-auto', ts.bg)}>
              <div className="flex flex-col items-center px-6 pt-12 pb-8">
                {/* Avatar */}
                <div className={cn('h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold', ts.card, ts.text)}>
                  {page.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Name & Bio */}
                <h2 className={cn('mt-4 text-lg font-bold', ts.text)}>{page.displayName}</h2>
                <p className={cn('mt-1 text-center text-sm leading-relaxed', ts.subtext)}>{page.bio}</p>

                {/* Links */}
                <div className="mt-6 w-full space-y-3">
                  {page.links
                    .filter((l) => l.enabled)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'block w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition-all',
                          ts.card,
                          ts.text
                        )}
                      >
                        {link.title}
                      </a>
                    ))}
                </div>

                {/* Branding */}
                <p className={cn('mt-8 text-xs', ts.subtext)}>
                  Made with PostPilot
                </p>
              </div>
            </div>
          </div>

          {/* Stats overlay */}
          <div className="absolute -bottom-4 -right-4 rounded-xl border border-border bg-card p-3 shadow-lg">
            <p className="text-xs text-muted-foreground">Total Clicks</p>
            <p className="text-xl font-bold text-foreground">{totalClicks.toLocaleString()}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
