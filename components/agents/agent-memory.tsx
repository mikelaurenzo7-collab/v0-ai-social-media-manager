'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Agent } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * Adaptive Agent Memory.
 *
 * Beyond a flat list of "remember this" notes, this surface shows the
 * three signals that should make an agent feel like it's actually
 * learning to be your agent:
 *
 *  1. Explicit memories the user wrote ("our audience is B2B founders")
 *  2. Inferred preferences from approval/rejection/edit history
 *  3. Performance-driven adjustments from analytics signals
 *
 * Each row has feedback affordances (👍/👎) and a delete control. The
 * user is always in charge of what the agent remembers.
 */

type Source = 'explicit' | 'inferred' | 'performance' | 'feedback' | 'audience'
type Confidence = 'low' | 'medium' | 'high'

interface MemoryRow {
  id: string
  source: Source
  confidence: Confidence
  body: string
  evidence?: string
  createdAt: string
  reaction?: 'up' | 'down'
  pinned?: boolean
  active?: boolean
}

const SOURCE_META: Record<Source, { label: string; emoji: string; cls: string }> = {
  explicit:    { label: 'You told me',     emoji: '✍️', cls: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  inferred:    { label: 'Inferred',         emoji: '🧠', cls: 'bg-violet-500/10 text-violet-700 border-violet-200' },
  performance: { label: 'Performance',     emoji: '📈', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  feedback:    { label: 'Your feedback',   emoji: '👍', cls: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  audience:    { label: 'Audience signal', emoji: '👥', cls: 'bg-amber-500/10 text-amber-700 border-amber-200' },
}

const CONF_META: Record<Confidence, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

function defaultMemoriesFor(agent: Agent): MemoryRow[] {
  const base: MemoryRow[] = [
    {
      id: 'm-explicit-audience',
      source: 'explicit',
      confidence: 'high',
      body: 'Audience is founders, indie hackers, and small marketing teams (1–20 people).',
      createdAt: '4d ago',
      pinned: true,
      active: true,
    },
    {
      id: 'm-explicit-tone',
      source: 'explicit',
      confidence: 'high',
      body: 'Avoid hype words: "synergy", "leverage", "unlock". Prefer concrete, grounded language.',
      createdAt: '4d ago',
      pinned: true,
      active: true,
    },
    {
      id: 'm-explicit-cta',
      source: 'explicit',
      confidence: 'medium',
      body: 'Sign-offs ask a question. Never sell directly in the close.',
      createdAt: '3d ago',
      active: true,
    },
  ]

  const inferred: MemoryRow[] = []
  if (agent.id === 'linkedin' || agent.platforms.includes('linkedin')) {
    inferred.push({
      id: 'm-inf-stories',
      source: 'inferred',
      confidence: 'high',
      body: 'Personal-story posts get 7×+ reach over feature posts.',
      evidence: '6 of 6 personal-story posts beat your feed average. Drift detected weeks 4–6.',
      createdAt: '1d ago',
      active: true,
    })
    inferred.push({
      id: 'm-inf-line-breaks',
      source: 'inferred',
      confidence: 'medium',
      body: 'You edit out long paragraphs in 4/5 drafts — keep line breaks every 1–2 sentences.',
      evidence: 'Edit history on the last 5 LinkedIn drafts.',
      createdAt: '2d ago',
      active: true,
    })
  }
  if (agent.id === 'tiktok' || agent.platforms.includes('tiktok')) {
    inferred.push({
      id: 'm-inf-hook',
      source: 'inferred',
      confidence: 'high',
      body: 'Drop the warm-up. Open on-screen text in the first 1.5 seconds.',
      evidence: 'Your top 5 TikToks all hit on-screen text by 1.4s; floor for 7s avg watch time.',
      createdAt: '8h ago',
      active: true,
    })
  }

  const performance: MemoryRow[] = []
  if (agent.id === 'linkedin' || agent.platforms.includes('linkedin')) {
    performance.push({
      id: 'm-perf-wed9',
      source: 'performance',
      confidence: 'high',
      body: 'Wed 9 AM is your highest-performing slot — 2.4× your other windows.',
      evidence: '6 of 6 Wed-9-AM posts beat the average. Other slots: 38% above avg.',
      createdAt: '5h ago',
      active: true,
    })
  }
  if (agent.id === 'x' || agent.platforms.includes('twitter')) {
    performance.push({
      id: 'm-perf-thread',
      source: 'performance',
      confidence: 'medium',
      body: 'Threads outperform single tweets 3.1×. Default to thread when topic >120 chars of value.',
      evidence: 'Last 20 X posts: threads avg 4.2k impressions; singles avg 1.3k.',
      createdAt: '2d ago',
      active: true,
    })
  }

  const feedback: MemoryRow[] = [
    {
      id: 'm-fb-emoji',
      source: 'feedback',
      confidence: 'medium',
      body: 'You thumbs-downed three drafts that opened with an emoji. Avoid leading with emojis.',
      evidence: '3 thumbs-down feedback events on emoji-led drafts.',
      createdAt: '6h ago',
      reaction: 'up',
      active: true,
    },
  ]

  const audience: MemoryRow[] = [
    {
      id: 'm-aud-questions',
      source: 'audience',
      confidence: 'medium',
      body: 'Audience comments cluster around "how" and "why" — they want operating playbooks.',
      evidence: 'Top comment intents over 400 replies: how-to (38%), why-this (22%), counter-take (12%).',
      createdAt: '3d ago',
      active: true,
    },
  ]

  return [...base, ...inferred, ...performance, ...feedback, ...audience]
}

const FILTERS: { id: Source | 'all'; label: string; emoji?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'explicit', label: 'You told me', emoji: '✍️' },
  { id: 'inferred', label: 'Inferred', emoji: '🧠' },
  { id: 'performance', label: 'Performance', emoji: '📈' },
  { id: 'feedback', label: 'Feedback', emoji: '👍' },
  { id: 'audience', label: 'Audience', emoji: '👥' },
]

export function AgentMemory({ agent }: { agent: Agent }) {
  const storageKey = `postpilot_agent_${agent.id}_memoryv2`
  const [memories, setMemories] = useState<MemoryRow[]>([])
  const [filter, setFilter] = useState<Source | 'all'>('all')
  const [draft, setDraft] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let loaded = false
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as MemoryRow[]
        if (Array.isArray(parsed) && parsed.every((m) => m && typeof m.body === 'string')) {
          setMemories(parsed)
          loaded = true
        }
      }
    } catch {
      // ignore
    }
    if (!loaded) setMemories(defaultMemoriesFor(agent))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id])

  function persist(next: MemoryRow[]) {
    setMemories(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  function react(id: string, reaction: 'up' | 'down') {
    persist(
      memories.map((m) =>
        m.id === id
          ? { ...m, reaction: m.reaction === reaction ? undefined : reaction, active: reaction === 'down' ? false : m.active }
          : m,
      ),
    )
    toast.message(reaction === 'up' ? 'Marked helpful' : 'Marked unhelpful', {
      description: reaction === 'up' ? 'I\'ll lean into this more.' : 'Disabled this memory.',
    })
  }

  function toggleActive(id: string) {
    persist(memories.map((m) => (m.id === id ? { ...m, active: !m.active } : m)))
  }

  function pin(id: string) {
    persist(memories.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m)))
  }

  function remove(id: string) {
    persist(memories.filter((m) => m.id !== id))
    toast.message('Memory removed')
  }

  function addExplicit() {
    if (!draft.trim()) return
    const m: MemoryRow = {
      id: `m-${Date.now()}`,
      source: 'explicit',
      confidence: 'high',
      body: draft.trim(),
      createdAt: 'just now',
      active: true,
    }
    persist([m, ...memories])
    setDraft('')
    toast.success('Added to memory', { description: `${agent.name} will use this on the next request.` })
  }

  const filtered = useMemo(() => {
    const list = filter === 'all' ? memories : memories.filter((m) => m.source === filter)
    return [...list].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  }, [memories, filter])

  const counts = useMemo(() => {
    const c: Record<Source | 'all', number> = {
      all: memories.length,
      explicit: 0,
      inferred: 0,
      performance: 0,
      feedback: 0,
      audience: 0,
    }
    for (const m of memories) c[m.source]++
    return c
  }, [memories])

  if (!mounted) return null

  const activeCount = memories.filter((m) => m.active !== false).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Adaptive memory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything {agent.name} has learned about you. Promote the good signals, retire the noisy ones.
          </p>
        </div>
        <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
          {activeCount} active · {memories.length} total
        </Badge>
      </div>

      {/* Add explicit memory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tell {agent.name} something</CardTitle>
          <CardDescription>
            Anything you write here is high-confidence and travels with every request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='e.g. "Always end LinkedIn posts with a question."'
              onKeyDown={(e) => e.key === 'Enter' && addExplicit()}
              aria-label="New memory"
            />
            <Button
              size="sm"
              onClick={addExplicit}
              disabled={!draft.trim()}
              style={draft.trim() ? { background: 'linear-gradient(135deg, #EA580C, #DB2777)' } : undefined}
            >
              Add
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Concrete &gt; vague. &quot;Use grade 6 readability&quot; beats &quot;keep it simple.&quot;
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              filter === f.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            {f.emoji && <span>{f.emoji}</span>}
            {f.label}
            <span className={cn('text-[10px] tabular-nums', filter === f.id ? 'opacity-80' : 'opacity-60')}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Memory list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm font-semibold">Nothing here yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filter === 'all'
                ? 'Tell the agent something above, or wait — it learns as you approve and reject drafts.'
                : 'Memories of this kind will appear as the agent gathers signal.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MemoryItem
              key={m.id}
              memory={m}
              onReact={react}
              onToggle={toggleActive}
              onPin={pin}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center">
        Adaptive memory is shown for transparency. Every row is editable and the agent always says
        &quot;applied X memories&quot; in its responses so you can audit what shaped a draft.
      </p>
    </div>
  )
}

function MemoryItem({
  memory: m,
  onReact,
  onToggle,
  onPin,
  onRemove,
}: {
  memory: MemoryRow
  onReact: (id: string, r: 'up' | 'down') => void
  onToggle: (id: string) => void
  onPin: (id: string) => void
  onRemove: (id: string) => void
}) {
  const meta = SOURCE_META[m.source]
  const dimmed = m.active === false
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        dimmed ? 'border-border/40 bg-muted/20 opacity-60' : 'border-border/60 bg-card',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 leading-none">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge className={cn('text-[9px] px-1.5 py-0 border', meta.cls)}>{meta.label}</Badge>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              conf · {CONF_META[m.confidence]}
            </span>
            {m.pinned && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                📌 Pinned
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground ml-auto">{m.createdAt}</span>
          </div>
          <p className={cn('text-sm leading-relaxed', dimmed && 'line-through')}>{m.body}</p>
          {m.evidence && (
            <p className="mt-1.5 text-[11px] text-muted-foreground italic leading-relaxed">
              Evidence · {m.evidence}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onReact(m.id, 'up')}
              aria-pressed={m.reaction === 'up'}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
                m.reaction === 'up'
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              👍 helpful
            </button>
            <button
              type="button"
              onClick={() => onReact(m.id, 'down')}
              aria-pressed={m.reaction === 'down'}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
                m.reaction === 'down'
                  ? 'bg-rose-500/15 text-rose-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              👎 noise
            </button>
            <button
              type="button"
              onClick={() => onPin(m.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              {m.pinned ? 'Unpin' : 'Pin'}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{m.active === false ? 'Off' : 'On'}</span>
              <Switch
                checked={m.active !== false}
                onCheckedChange={() => onToggle(m.id)}
                aria-label="Toggle memory"
              />
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                aria-label="Remove memory"
                className="text-[11px] text-muted-foreground hover:text-rose-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
