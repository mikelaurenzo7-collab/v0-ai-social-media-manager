'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Global AI Co-Pilot drawer.
 *
 * Toggle anywhere with ⌘J / Ctrl+J. The drawer is context-aware: it surfaces
 * actions tailored to the page you're on (inbox, pipeline, analytics, etc.)
 * and a freeform chat box for everything else. This is the "Cursor for
 * content" surface — short loops, fast actions, never blocks the canvas.
 *
 * The shipping behavior here is a faithful UI scaffold. Real action
 * execution lands as we wire each surface to the Co-Pilot's tool calls.
 */

interface QuickAction {
  label: string
  hint?: string
  emoji: string
  onSelect: () => void
}

interface ContextConfig {
  context: string
  blurb: string
  actions: QuickAction[]
}

interface ChatTurn {
  id: string
  role: 'user' | 'copilot'
  text: string
  intent?: string
}

const STARTER_TURNS: ChatTurn[] = [
  {
    id: 'seed',
    role: 'copilot',
    text:
      "I'm your Co-Pilot. I read the page you're on and can take actions on it. Try one of the chips above, or ask me anything in plain English — \"reply to all positive mentions\", \"draft a Friday recap\", \"why is LinkedIn up this week?\"",
  },
]

export function CopilotDrawer() {
  const pathname = usePathname()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>(STARTER_TURNS)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  // ⌘J / Ctrl+J global toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'j' || e.key === 'J') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    const onOpen = () => setOpen(true)
    const onToggle = () => setOpen((o) => !o)
    document.addEventListener('keydown', onKey)
    window.addEventListener('copilot:open', onOpen)
    window.addEventListener('copilot:toggle', onToggle)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('copilot:open', onOpen)
      window.removeEventListener('copilot:toggle', onToggle)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, open])

  const ctx = useMemo<ContextConfig>(() => buildContext(pathname, router, setTurns, setBusy), [pathname, router])

  function appendUser(text: string) {
    setTurns((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text }])
  }

  function fakeReply(text: string, intent?: string) {
    setBusy(true)
    setTimeout(() => {
      setTurns((prev) => [...prev, { id: `c-${Date.now()}`, role: 'copilot', text, intent }])
      setBusy(false)
    }, 600)
  }

  function send() {
    const trimmed = input.trim()
    if (!trimmed || busy) return
    appendUser(trimmed)
    setInput('')

    // Heuristic intent routing for common asks. Real impl wires this to a
    // server-side planner; we model the loop here.
    const lower = trimmed.toLowerCase()
    if (lower.startsWith('go to ') || lower.startsWith('open ')) {
      const target = lower.replace(/^(go to |open )/, '')
      const map: Record<string, string> = {
        inbox: '/dashboard/inbox',
        pipeline: '/dashboard/pipeline',
        approvals: '/dashboard/approvals',
        drafts: '/dashboard/drafts',
        calendar: '/dashboard/calendar',
        analytics: '/dashboard/analytics',
        library: '/dashboard/library',
        team: '/dashboard/team',
        brand: '/dashboard/brand',
        trends: '/dashboard/trends',
        workflows: '/dashboard/workflows',
        insights: '/dashboard/insights',
      }
      const dest = Object.entries(map).find(([k]) => target.includes(k))?.[1]
      if (dest) {
        router.push(dest)
        fakeReply(`Opened ${target}.`, 'navigation')
        toast.success('Co-Pilot navigated', { description: dest })
        return
      }
    }

    if (lower.includes('draft')) {
      router.push('/dashboard/create')
      fakeReply('I opened the composer with your prompt loaded. I\'ll generate three takes — pick one and I\'ll route it to Approvals.', 'draft')
      return
    }

    if (lower.includes('reply') || lower.includes('inbox')) {
      router.push('/dashboard/inbox')
      fakeReply('Routing to Inbox. I\'ll surface drafts for unread positive mentions matching your brand voice — approve in one tap.', 'inbox')
      return
    }

    fakeReply(
      "Got it. I'll think out loud here while a real planner takes the action — once your workspace is wired in this becomes a real tool call.",
    )
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!open) {
    return <CopilotFab onOpen={() => setOpen(true)} />
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 h-screen w-full max-w-md flex flex-col"
        role="dialog"
        aria-label="AI Co-Pilot"
        style={{
          background: 'oklch(0.135 0.018 48)',
          borderLeft: '1px solid oklch(0.25 0.018 48)',
          boxShadow: '-30px 0 80px -20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'oklch(0.22 0.016 48)' }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Co-Pilot</p>
            <p className="text-[11px] text-white/50 truncate">{ctx.blurb}</p>
          </div>
          <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/50">⌘J</kbd>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close Co-Pilot"
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Context chips */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'oklch(0.22 0.016 48)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-2">
            On this page · {ctx.context}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ctx.actions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onSelect}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/85 transition-colors hover:text-white"
                style={{
                  background: 'oklch(0.652 0.214 36 / 0.18)',
                  border: '1px solid oklch(0.652 0.214 36 / 0.35)',
                }}
                title={a.hint}
              >
                <span>{a.emoji}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {turns.map((t) => (
            <div
              key={t.id}
              className={cn(
                'flex gap-2',
                t.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              {t.role === 'copilot' && (
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                  aria-hidden
                >
                  <span className="text-[10px] font-black text-white">C</span>
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                  t.role === 'user'
                    ? 'bg-white/10 text-white/95 rounded-br-md'
                    : 'text-white/85 rounded-bl-md',
                )}
                style={
                  t.role === 'copilot'
                    ? { background: 'oklch(0.185 0.016 48)', border: '1px solid oklch(0.22 0.016 48)' }
                    : undefined
                }
              >
                {t.text}
                {t.intent && (
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50">
                    intent: {t.intent}
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-2">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                aria-hidden
              >
                <span className="text-[10px] font-black text-white">C</span>
              </div>
              <div
                className="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px]"
                style={{ background: 'oklch(0.185 0.016 48)', border: '1px solid oklch(0.22 0.016 48)' }}
              >
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          className="border-t p-4"
          style={{ borderColor: 'oklch(0.22 0.016 48)' }}
        >
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ background: 'oklch(0.185 0.016 48)', borderColor: 'oklch(0.25 0.018 48)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder='Try: "reply to positive mentions" · "draft a Friday recap" · "why is LinkedIn up?"'
              aria-label="Co-Pilot prompt"
              className="w-full resize-none px-3.5 pt-3 pb-2 text-[13px] bg-transparent text-white placeholder:text-white/30 outline-none"
            />
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-t" style={{ borderColor: 'oklch(0.22 0.016 48)' }}>
              <span className="text-[10px] text-white/35">
                <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono">Enter</kbd> send
                <span className="mx-1.5">·</span>
                <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono">Shift</kbd>+
                <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono">Enter</kbd> newline
              </span>
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || busy}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
              >
                Send
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-white/30 text-center">
            Co-Pilot is preview · server-side planner ships next
          </p>
        </div>
      </aside>
    </>
  )
}

function CopilotFab({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open Co-Pilot"
      className="fixed bottom-5 right-5 z-30 group inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, #EA580C, #DB2777)',
        boxShadow: '0 12px 32px -10px rgba(234, 88, 12, 0.55)',
      }}
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
        aria-hidden
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </span>
      Co-Pilot
      <kbd className="hidden sm:inline rounded bg-white/15 px-1 py-0.5 font-mono text-[9px] text-white/85">⌘J</kbd>
    </button>
  )
}

// Build the context-aware action chips. Every page gets a label, blurb, and 3–5 chips.
function buildContext(
  pathname: string,
  router: ReturnType<typeof useRouter>,
  setTurns: React.Dispatch<React.SetStateAction<ChatTurn[]>>,
  setBusy: React.Dispatch<React.SetStateAction<boolean>>,
): ContextConfig {
  const action = (label: string, body: string, intent?: string): QuickAction['onSelect'] => () => {
    setTurns((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: label },
    ])
    setBusy(true)
    setTimeout(() => {
      setTurns((prev) => [...prev, { id: `c-${Date.now()}`, role: 'copilot', text: body, intent }])
      setBusy(false)
    }, 700)
  }

  if (pathname.startsWith('/dashboard/inbox')) {
    return {
      context: 'Inbox',
      blurb: 'Triage replies and DMs in seconds',
      actions: [
        { emoji: '⚡', label: 'Triage 24h of mentions', onSelect: action('Triage the last 24 hours of mentions', 'Sorted 18 items into Reply / Skip / Spam. 9 are positive — drafts ready to approve in your inbox.', 'inbox.triage') },
        { emoji: '✍️', label: 'Reply to all positive mentions', onSelect: action('Reply to all positive mentions', 'Drafted 9 replies in your brand voice. Approve them one by one in the inbox or all at once with Shift+A.', 'inbox.reply') },
        { emoji: '📝', label: 'Summarize today\'s mentions', onSelect: action("Summarize today's mentions", 'Today: 23 mentions, 14 positive (mostly about Auto-Pilot), 6 neutral, 3 questions. The standout is Maya Chen — partnership angle worth a 1:1 reply.', 'inbox.summarize') },
        { emoji: '🚫', label: 'Mute spam clusters', onSelect: action('Mute spam clusters', 'Identified 2 spam patterns (prompts asking for crypto giveaways, follow-back rings). Muted across X and Instagram.', 'inbox.mute') },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/pipeline')) {
    return {
      context: 'Pipeline',
      blurb: 'See what\'s stuck and what\'s next',
      actions: [
        { emoji: '🟪', label: 'What\'s stuck in review?', onSelect: action("What's stuck in review?", '3 cards in review for >24h: "10k customers post" (LinkedIn), "TikTok productivity hook", "Friday recap thread". Olivia is the holdup on two — pinged her.', 'pipeline.stuck') },
        { emoji: '⏩', label: 'Move approved into next week', onSelect: action('Move all approved cards into next week\'s queue', 'Slotted 5 approved cards into next week\'s peak windows based on each platform\'s historical engagement.', 'pipeline.schedule') },
        { emoji: '📊', label: 'Cycle-time report', onSelect: action('Cycle-time report', 'Median idea→published is 2.4 days. Slowest stage: Approvals (1.1d avg). Fastest: Drafting (3h).', 'pipeline.cycletime') },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/analytics') || pathname.startsWith('/dashboard/insights')) {
    return {
      context: 'Analytics',
      blurb: 'Anomaly detection and quick reads',
      actions: [
        { emoji: '🔍', label: 'Why is LinkedIn up this week?', onSelect: action('Why is LinkedIn up this week?', 'Up 38%. Driver: 2 personal-story posts that hit ≥7× normal reach. Common thread: short hook, single CTA, no link in body.', 'analytics.why') },
        { emoji: '🧪', label: 'Last week\'s top 3 with takeaways', onSelect: action("Last week's top 3 with takeaways", '1) "10k customers" (LinkedIn) — vulnerability beat polish. 2) "Launch lessons thread" (X) — pinned for 48h. 3) BTS carousel (IG) — strong save rate.', 'analytics.top3') },
        { emoji: '📅', label: 'Best time to post next week', onSelect: action('Best time to post next week', 'X: Tue/Thu 8:30 AM. LinkedIn: Wed 9 AM. IG: Fri 12 PM. TikTok: Sat 7:30 PM.', 'analytics.windows') },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/drafts')) {
    return {
      context: 'Drafts',
      blurb: 'Find old drafts and finish them',
      actions: [
        { emoji: '🗑', label: 'Find drafts older than 7 days', onSelect: action('Find drafts older than 7 days', 'Found 4 stale drafts. Want me to refresh them with the latest brand voice and submit for approval?', 'drafts.stale') },
        { emoji: '🔁', label: 'Convert latest draft to a thread', onSelect: action('Convert my latest draft to a thread', 'Drafted a 5-tweet thread version. Open in composer to review.', 'drafts.thread') },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/calendar')) {
    return {
      context: 'Calendar',
      blurb: 'Plan and schedule your week',
      actions: [
        { emoji: '📆', label: 'Plan next week from goals', onSelect: action('Plan next week from goals', 'Drafted a 7-day plan (5 X, 3 LinkedIn, 2 IG, 1 TikTok) aligned to growth + authority. Drop into pipeline?', 'calendar.plan') },
        { emoji: '🌐', label: 'Optimize times by platform', onSelect: action('Optimize times for each platform', 'Re-slotted 8 scheduled posts into each channel\'s peak window. Saved 3 conflicts.', 'calendar.optimize') },
      ],
    }
  }

  if (pathname.startsWith('/dashboard/agents')) {
    return {
      context: 'Agents',
      blurb: 'Tune any specialist',
      actions: [
        { emoji: '🎚', label: 'Audit agent against brand kit', onSelect: action('Audit this agent against the brand kit', 'Audited last 10 outputs. 8/10 on brand. 2 drift in formality — flagged with rewrites.', 'agents.audit') },
        { emoji: '🪄', label: 'Generate a persona variant', onSelect: action('Generate a persona variant for A/B', 'Drafted a slightly bolder variant. Save it as a sandbox to test for two weeks?', 'agents.variant') },
      ],
    }
  }

  // Default
  return {
    context: 'Workspace',
    blurb: 'Anything you need across the workspace',
    actions: [
      { emoji: '🗓', label: 'Plan my week', onSelect: action('Plan my week', 'Pulling Brand Kit, top-performing topics, and your goals. I\'ll draft a 7-day plan you can edit.', 'planner') },
      { emoji: '🧾', label: 'Status: pending approvals', onSelect: action('Status: pending approvals', '4 drafts pending — 1 over 24h. Want me to nudge approvers in Slack?', 'approvals.status') },
      { emoji: '✍️', label: 'Draft an idea', onSelect: () => router.push('/dashboard/create') },
      { emoji: '📈', label: 'How was last week?', onSelect: action('How was last week?', '+18% engagement on X, +38% on LinkedIn, IG flat. Top win: 10k customers post (3.4× avg).', 'recap') },
    ],
  }
}
