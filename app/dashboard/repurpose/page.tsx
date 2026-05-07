'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { ScheduleDialog } from '@/components/create/schedule-dialog'

// ── Types ──────────────────────────────────────────────────────────────────────

type PlatformId = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook'

interface RepurposeResult {
  twitter: string
  linkedin: string
  instagram: string
  tiktok: string
  facebook: string
  newsletter_subject: string
  newsletter_intro: string
}

interface SavedDraft {
  id: string
  content: string
  platforms: PlatformId[]
}

// ── Platform configs ───────────────────────────────────────────────────────────

type OutputKey = keyof RepurposeResult | 'newsletter'

const OUTPUTS: {
  key: OutputKey
  label: string
  sublabel: string
  charLimit: number | null
  gradient: string
  headerBg: string
  headerText: string
  icon: string
}[] = [
  {
    key: 'twitter',
    label: 'X / Twitter',
    sublabel: 'Hook-first · punchy',
    charLimit: 280,
    gradient: 'from-gray-900 to-gray-800',
    headerBg: '#000000',
    headerText: '#FFFFFF',
    icon: 'x',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    sublabel: 'Professional · insight-driven',
    charLimit: 1300,
    gradient: 'from-blue-700 to-blue-600',
    headerBg: '#0A66C2',
    headerText: '#FFFFFF',
    icon: 'li',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    sublabel: 'Visual-first · hashtag-rich',
    charLimit: 2200,
    gradient: 'from-pink-600 to-orange-500',
    headerBg: '#E1306C',
    headerText: '#FFFFFF',
    icon: 'ig',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    sublabel: 'Script format · hook-driven',
    charLimit: null,
    gradient: 'from-purple-600 to-pink-600',
    headerBg: '#010101',
    headerText: '#FFFFFF',
    icon: 'tt',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    sublabel: 'Community · conversational',
    charLimit: 500,
    gradient: 'from-blue-600 to-blue-500',
    headerBg: '#1877F2',
    headerText: '#FFFFFF',
    icon: 'fb',
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    sublabel: 'Subject + opener paragraph',
    charLimit: null,
    gradient: 'from-orange-600 to-pink-600',
    headerBg: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
    headerText: '#FFFFFF',
    icon: '✉',
  },
]

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  x: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  li: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  ig: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  tt: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.79 1.52V6.75a4.85 4.85 0 01-1.02-.06z" />
    </svg>
  ),
  fb: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
}

// ── OutputCard ─────────────────────────────────────────────────────────────────

function OutputCard({
  cfg,
  content,
  newsletterSubject,
  isLoading,
  index,
}: {
  cfg: (typeof OUTPUTS)[number]
  content: string
  newsletterSubject?: string
  isLoading: boolean
  index: number
}) {
  const [localContent, setLocalContent] = useState(content)
  const [localSubject, setLocalSubject] = useState(newsletterSubject ?? '')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalContent(content)
    if (newsletterSubject !== undefined) setLocalSubject(newsletterSubject)
  }, [content, newsletterSubject])

  const charCount = localContent.length
  const charLimit = cfg.charLimit
  const overLimit = charLimit !== null && charCount > charLimit
  const nearLimit = charLimit !== null && charCount > charLimit * 0.85

  const handleCopy = useCallback(async () => {
    const text = cfg.key === 'newsletter'
      ? `Subject: ${localSubject}\n\n${localContent}`
      : localContent
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${cfg.label} copy ready`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }, [localContent, localSubject, cfg.key, cfg.label])

  const handleSave = useCallback(() => {
    try {
      const raw = localStorage.getItem('postpilot_drafts')
      const existing: SavedDraft[] = raw ? JSON.parse(raw) : []
      const platforms: PlatformId[] = cfg.key === 'newsletter'
        ? ['twitter']
        : [cfg.key as PlatformId]
      const newDraft = {
        id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        content: cfg.key === 'newsletter' ? `Subject: ${localSubject}\n\n${localContent}` : localContent,
        hashtags: [],
        platforms,
        tone: 'confident',
        contentType: cfg.key === 'newsletter' ? 'newsletter' : 'post',
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('postpilot_drafts', JSON.stringify([newDraft, ...existing]))
      setSaved(true)
      toast.success(`Saved to Drafts`, {
        action: { label: 'View Drafts', onClick: () => { window.location.href = '/dashboard/drafts' } },
      })
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Save failed')
    }
  }, [localContent, localSubject, cfg.key])

  if (isLoading) {
    return (
      <div
        className="rounded-2xl overflow-hidden border border-border/50 shadow-sm"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <div className="h-11 animate-pulse" style={{ background: '#e5e7eb' }} />
        <div className="p-4 space-y-2">
          <div className="h-3 w-3/4 rounded animate-pulse bg-muted" />
          <div className="h-3 w-full rounded animate-pulse bg-muted" />
          <div className="h-3 w-5/6 rounded animate-pulse bg-muted" />
          <div className="h-3 w-2/3 rounded animate-pulse bg-muted" />
          {cfg.key === 'linkedin' && (
            <>
              <div className="h-3 w-full rounded animate-pulse bg-muted" />
              <div className="h-3 w-4/5 rounded animate-pulse bg-muted" />
            </>
          )}
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <div className="h-8 w-16 rounded-lg animate-pulse bg-muted" />
          <div className="h-8 w-16 rounded-lg animate-pulse bg-muted" />
        </div>
      </div>
    )
  }

  if (!content) return null

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-all duration-300"
      style={{ animation: 'fadeSlideUp 0.35s ease both' }}
    >
      {/* Platform header */}
      <div
        className="flex h-11 items-center gap-3 px-4"
        style={{
          background: cfg.headerBg.startsWith('linear') ? cfg.headerBg : cfg.headerBg,
          color: cfg.headerText,
        }}
      >
        <span className="text-sm">{typeof cfg.icon === 'string' && cfg.icon.length > 2 ? cfg.icon : PLATFORM_ICONS[cfg.icon] ?? cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-none">{cfg.label}</p>
          <p className="text-[10px] opacity-70 mt-0.5">{cfg.sublabel}</p>
        </div>
        {charLimit !== null && (
          <span className={cn('text-[10px] font-bold tabular-nums', overLimit ? 'text-red-300' : nearLimit ? 'text-yellow-300' : 'opacity-60')}>
            {charCount}/{charLimit}
          </span>
        )}
      </div>

      {/* Newsletter subject line */}
      {cfg.key === 'newsletter' && (
        <div className="px-3 pt-3 pb-0">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</span>
            <input
              value={localSubject}
              onChange={(e) => setLocalSubject(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
              placeholder="Subject line…"
            />
            <span className={cn('text-[10px] tabular-nums', localSubject.length > 55 ? 'text-destructive' : 'text-muted-foreground')}>
              {localSubject.length}/55
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-3 pt-3">
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          className={cn(
            'w-full resize-none rounded-xl border border-transparent bg-muted/20 p-3 text-sm leading-relaxed focus:outline-none focus:border-border/60 transition-colors',
            cfg.key === 'tiktok' ? 'font-mono text-xs' : '',
            cfg.key === 'linkedin' ? 'min-h-[180px]' : cfg.key === 'instagram' ? 'min-h-[160px]' : 'min-h-[120px]',
          )}
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-2">
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
          )}
        >
          {copied ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            saved
              ? 'bg-orange-100 text-orange-700 border border-orange-200'
              : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
          )}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          {saved ? 'Saved!' : 'Save'}
        </button>

        {cfg.key !== 'newsletter' && (
          <ScheduleDialog
            draft={{
              id: `repurpose-${cfg.key}`,
              content: localContent,
              platforms: [cfg.key as PlatformId],
            }}
          >
            <button className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-transparent">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Schedule
            </button>
          </ScheduleDialog>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  'I used to think consistency was the key to growing on social media. I was wrong. What actually matters is being specific about who you\'re talking to.',
  'The biggest mistake creators make is trying to appeal to everyone. The riches are in the niches.',
  'Took me 2 years and 3 failed businesses to learn this: your idea doesn\'t matter. Your execution and your ability to learn fast is everything.',
]

export default function RepurposePage() {
  const [inputContent, setInputContent] = useState('')
  const [isRepurposing, setIsRepurposing] = useState(false)
  const [results, setResults] = useState<Partial<RepurposeResult>>({})
  const [revealedCount, setRevealedCount] = useState(0)
  const [drafts, setDrafts] = useState<SavedDraft[]>([])
  const [showDraftPicker, setShowDraftPicker] = useState(false)
  const [mounted, setMounted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem('postpilot_drafts')
      if (raw) setDrafts(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const handleRepurpose = useCallback(async () => {
    if (!inputContent.trim() || isRepurposing) return
    setIsRepurposing(true)
    setResults({})
    setRevealedCount(0)

    // Scroll to results
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)

    try {
      const voiceRaw = localStorage.getItem('postpilot_brand_voice')
      const voiceSettings = voiceRaw ? JSON.parse(voiceRaw) : undefined

      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputContent.trim(), voiceSettings }),
      })

      if (!res.ok) throw new Error('API error')

      const data: RepurposeResult = await res.json()
      setResults(data)

      // Stagger reveal
      for (let i = 0; i <= OUTPUTS.length; i++) {
        setTimeout(() => setRevealedCount(i), i * 180)
      }

      toast.success('6 formats ready', {
        description: 'Copy, save, or schedule each version',
      })
    } catch {
      toast.error('Repurpose failed — please try again')
    } finally {
      setIsRepurposing(false)
    }
  }, [inputContent, isRepurposing])

  const hasResults = Object.keys(results).length > 0
  const charCount = inputContent.length

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left input panel ──────────────────────────────────────────── */}
      <div
        className="flex w-80 shrink-0 flex-col"
        style={{ background: 'oklch(0.135 0.018 48)', borderRight: '1px solid oklch(0.22 0.016 48)' }}
      >
        {/* Panel header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid oklch(0.22 0.016 48)' }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Repurpose Engine</h2>
              <p className="text-[10px] text-white/40">1 idea → 6 platform formats</p>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Draft picker */}
          {mounted && drafts.length > 0 && (
            <div>
              <button
                onClick={() => setShowDraftPicker(!showDraftPicker)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
                style={{
                  background: showDraftPicker ? 'oklch(0.652 0.214 36 / 0.2)' : 'oklch(0.185 0.016 48)',
                  color: showDraftPicker ? '#EA580C' : 'oklch(0.55 0.012 52)',
                  border: showDraftPicker ? '1px solid oklch(0.652 0.214 36 / 0.3)' : '1px solid transparent',
                }}
              >
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Pick from Drafts
                </span>
                <svg
                  className={cn('h-3 w-3 transition-transform', showDraftPicker ? 'rotate-180' : '')}
                  fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showDraftPicker && (
                <div className="mt-1.5 rounded-xl overflow-hidden border" style={{ borderColor: 'oklch(0.22 0.016 48)' }}>
                  {drafts.slice(0, 6).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setInputContent(d.content); setShowDraftPicker(false) }}
                      className="block w-full px-3 py-2.5 text-left text-xs text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors border-b last:border-b-0"
                      style={{ borderColor: 'oklch(0.22 0.016 48)' }}
                    >
                      <span className="line-clamp-2 leading-relaxed">{d.content}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'oklch(0.4 0.010 52)' }}>
                Source Content
              </p>
              <span className={cn('text-[10px] tabular-nums', charCount > 4500 ? 'text-red-400' : 'text-white/30')}>
                {charCount}/5000
              </span>
            </div>
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Paste your content here — a blog post, tweet, thought, or anything you want to multiply across platforms…"
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 p-3.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-orange-500/50 leading-relaxed transition-colors"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Example prompts */}
          {!inputContent && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'oklch(0.4 0.010 52)' }}>
                Try an example
              </p>
              <div className="space-y-1.5">
                {EXAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setInputContent(p)}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all leading-relaxed"
                    style={{ background: 'oklch(0.185 0.016 48)' }}
                  >
                    <span className="line-clamp-2">&ldquo;{p}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brand voice badge */}
          <Link
            href="/dashboard/brand"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all hover:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #EA580C15 0%, #DB277715 100%)',
              border: '1px solid oklch(0.652 0.214 36 / 0.2)',
            }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white/80">Brand Voice</p>
              <p className="text-[10px] text-white/40">Tune how the AI sounds like you</p>
            </div>
            <svg className="h-3.5 w-3.5 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {/* CTA */}
        <div className="p-4" style={{ borderTop: '1px solid oklch(0.22 0.016 48)' }}>
          <button
            onClick={handleRepurpose}
            disabled={!inputContent.trim() || isRepurposing}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', boxShadow: '0 4px 20px oklch(0.652 0.214 36 / 0.4)' }}
          >
            {isRepurposing ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating 6 formats…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Repurpose Everything
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] text-white/30">
            6 platform formats · ~10 seconds
          </p>
        </div>
      </div>

      {/* ── Right output panel ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex h-12 items-center justify-between px-6 border-b"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold">Output Formats</h1>
            {hasResults && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                6 ready
              </span>
            )}
          </div>
          {hasResults && (
            <button
              onClick={handleRepurpose}
              disabled={isRepurposing}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-40"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Regenerate
            </button>
          )}
        </div>

        <div ref={resultsRef} className="p-6">
          {!hasResults && !isRepurposing ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
              <div
                className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Multiply Your Content</h2>
              <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
                Paste any piece of content on the left — a thought, a draft, or a blog post — and the AI will instantly transform it into 6 platform-optimized formats.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
                {OUTPUTS.map((o) => (
                  <div
                    key={o.key}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-border/60"
                    style={{ background: 'var(--muted)' }}
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white text-[10px] font-bold"
                      style={{ background: o.headerBg.startsWith('linear') ? o.headerBg : o.headerBg }}
                    >
                      {typeof o.icon === 'string' && o.icon.length > 2 ? o.icon : null}
                      {typeof o.icon === 'string' && o.icon.length <= 2 ? (PLATFORM_ICONS[o.icon] ?? o.icon) : null}
                    </div>
                    <span className="text-xs font-medium">{o.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {OUTPUTS.map((cfg, i) => {
                const content = cfg.key === 'newsletter'
                  ? (results.newsletter_intro ?? '')
                  : cfg.key in results
                    ? (results[cfg.key as keyof Omit<RepurposeResult, 'newsletter_subject' | 'newsletter_intro'>] ?? '')
                    : ''
                const newsletterSubject = cfg.key === 'newsletter' ? (results.newsletter_subject ?? '') : undefined
                const isCardLoading = isRepurposing || (hasResults && i >= revealedCount)

                return (
                  <OutputCard
                    key={cfg.key}
                    cfg={cfg}
                    content={content}
                    newsletterSubject={newsletterSubject}
                    isLoading={isCardLoading}
                    index={i}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
