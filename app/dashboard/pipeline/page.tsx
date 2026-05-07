'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { cn } from '@/lib/utils'

type Stage = 'idea' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published'
type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'

interface Card {
  id: string
  title: string
  excerpt: string
  agent: string
  agentSlug: string
  platform: Platform
  stage: Stage
  scheduledFor?: string
  owner: string
  ownerHue: string
  comments: number
  updatedAt: string
}

const STAGES: { id: Stage; label: string; hint: string; accent: string }[] = [
  { id: 'idea', label: 'Ideas', hint: 'Park half-thoughts here', accent: 'from-slate-500 to-slate-700' },
  { id: 'draft', label: 'Drafting', hint: 'Agents are working', accent: 'from-amber-500 to-orange-600' },
  { id: 'review', label: 'In review', hint: 'Pending your sign-off', accent: 'from-violet-500 to-purple-600' },
  { id: 'approved', label: 'Approved', hint: 'Cleared, awaiting slot', accent: 'from-sky-500 to-blue-600' },
  { id: 'scheduled', label: 'Scheduled', hint: 'On the queue', accent: 'from-emerald-500 to-teal-600' },
  { id: 'published', label: 'Published', hint: 'Live on the channel', accent: 'from-rose-500 to-pink-600' },
]

const SAMPLE: Card[] = [
  // Ideas
  { id: 'p1', title: 'Take on "AI agents replacing SaaS"', excerpt: 'Our angle: working agent product is the proof. One specific thing the agents do that a chatbot cannot.', agent: 'X Agent', agentSlug: 'x', platform: 'twitter', stage: 'idea', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 0, updatedAt: '2h ago' },
  { id: 'p2', title: 'Customer case study: Halewise', excerpt: 'Could be a Reel — show the agency before/after dashboards.', agent: 'Meta Agent', agentSlug: 'meta', platform: 'instagram', stage: 'idea', owner: 'PM', ownerHue: 'from-violet-500 to-purple-600', comments: 1, updatedAt: '4h ago' },

  // Drafts
  { id: 'p3', title: 'Launch week thread', excerpt: '5 lessons from launch week. Hook works. Need a tighter close.', agent: 'X Agent', agentSlug: 'x', platform: 'twitter', stage: 'draft', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 2, updatedAt: '12m ago' },
  { id: 'p4', title: 'BTS studio carousel', excerpt: '6 slides, hero shot to "save this if". Caption draft v2.', agent: 'Meta Agent', agentSlug: 'meta', platform: 'instagram', stage: 'draft', owner: 'TW', ownerHue: 'from-sky-500 to-blue-600', comments: 0, updatedAt: '23m ago' },
  { id: 'p5', title: 'Gmail intro to Priya', excerpt: 'Cold intro mentioning her growth post. Asking for 15 min.', agent: 'Gmail Agent', agentSlug: 'gmail', platform: 'gmail', stage: 'draft', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 0, updatedAt: '1h ago' },

  // Review
  { id: 'p6', title: '10k customers post', excerpt: 'Personal voice. No hype. Two readers flagged the second paragraph.', agent: 'LinkedIn Agent', agentSlug: 'linkedin', platform: 'linkedin', stage: 'review', scheduledFor: 'Tomorrow · 9 AM', owner: 'TW', ownerHue: 'from-sky-500 to-blue-600', comments: 3, updatedAt: '8m ago' },
  { id: 'p7', title: 'TikTok productivity hook', excerpt: '"I broke every productivity rule for 30 days." Strong open.', agent: 'TikTok Agent', agentSlug: 'tiktok', platform: 'tiktok', stage: 'review', scheduledFor: 'Sat · 7:30 PM', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 1, updatedAt: '34m ago' },

  // Approved
  { id: 'p8', title: 'Friday recap thread', excerpt: 'Approved — slotting into the weekly recap window.', agent: 'X Agent', agentSlug: 'x', platform: 'twitter', stage: 'approved', scheduledFor: 'Fri · 4:30 PM', owner: 'OP', ownerHue: 'from-emerald-500 to-teal-600', comments: 0, updatedAt: '1h ago' },

  // Scheduled
  { id: 'p9', title: 'Q3 update for board', excerpt: 'Subject: [Update] Q3 revenue + commentary. Headline + 3 drivers.', agent: 'Outlook Agent', agentSlug: 'outlook', platform: 'outlook', stage: 'scheduled', scheduledFor: 'Mon · 8 AM', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 0, updatedAt: '3h ago' },
  { id: 'p10', title: 'Studio carousel #2', excerpt: 'Slotted into Friday peak window after a reshoot.', agent: 'Meta Agent', agentSlug: 'meta', platform: 'instagram', stage: 'scheduled', scheduledFor: 'Fri · 12 PM', owner: 'TW', ownerHue: 'from-sky-500 to-blue-600', comments: 1, updatedAt: '5h ago' },

  // Published
  { id: 'p11', title: 'AI agents thread (live)', excerpt: 'Pinned. 312 likes / 84 RTs at 2h.', agent: 'X Agent', agentSlug: 'x', platform: 'twitter', stage: 'published', scheduledFor: '2h ago', owner: 'D', ownerHue: 'from-orange-500 to-pink-600', comments: 0, updatedAt: '2h ago' },
  { id: 'p12', title: 'LinkedIn launch announce', excerpt: 'Performing 3.4× our average. 92 reposts.', agent: 'LinkedIn Agent', agentSlug: 'linkedin', platform: 'linkedin', stage: 'published', scheduledFor: '1d ago', owner: 'PM', ownerHue: 'from-violet-500 to-purple-600', comments: 4, updatedAt: '1d ago' },
]

export default function PipelinePage() {
  const [items, setItems] = useState<Card[]>(SAMPLE)
  const [filter, setFilter] = useState<Platform | 'all'>('all')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((c) => c.platform === filter)),
    [items, filter],
  )

  const byStage = useMemo(() => {
    const map: Record<Stage, Card[]> = {
      idea: [], draft: [], review: [], approved: [], scheduled: [], published: [],
    }
    for (const c of filtered) map[c.stage].push(c)
    return map
  }, [filtered])

  function moveCard(cardId: string, toStage: Stage) {
    let movedTitle = ''
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c
        if (c.stage === toStage) return c
        movedTitle = c.title
        return { ...c, stage: toStage, updatedAt: 'just now' }
      }),
    )
    if (movedTitle) {
      const stageLabel = STAGES.find((s) => s.id === toStage)?.label ?? toStage
      toast.success(`Moved to ${stageLabel}`, { description: movedTitle })
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Pipeline"
        description="Every piece of content in flight. Drag to advance a stage. Filter by channel."
        action={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Platform | 'all')}
              aria-label="Filter pipeline by platform"
              className="h-8 rounded-lg border border-border/60 bg-background px-3 text-xs font-medium"
            >
              <option value="all">All channels</option>
              <option value="twitter">X</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
            </select>
            <Button asChild size="sm" style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}>
              <Link href="/dashboard/create">+ New idea</Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 min-h-full" style={{ minWidth: 'max-content' }}>
          {STAGES.map((stage) => {
            const cards = byStage[stage.id]
            const dropActive = dragOverStage === stage.id
            return (
              <div
                key={stage.id}
                className={cn(
                  'w-80 shrink-0 flex flex-col rounded-2xl border bg-card/40 transition-colors',
                  dropActive ? 'border-orange-500 bg-orange-500/5' : 'border-border/60',
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverStage(stage.id)
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOverStage(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOverStage(null)
                  if (draggingId) moveCard(draggingId, stage.id)
                  setDraggingId(null)
                }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${stage.accent}`} />
                    <p className="text-xs font-bold uppercase tracking-widest">{stage.label}</p>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{cards.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.message('Coming soon', { description: `Add a card directly in ${stage.label}` })}
                    aria-label={`Add card to ${stage.label}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
                <p className="px-3 pb-3 text-[10px] text-muted-foreground italic">{stage.hint}</p>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                  {cards.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border/50 text-[11px] text-muted-foreground">
                      Drop here
                    </div>
                  ) : (
                    cards.map((c) => (
                      <PipelineCard
                        key={c.id}
                        card={c}
                        dragging={draggingId === c.id}
                        onDragStart={() => setDraggingId(c.id)}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setDragOverStage(null)
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PipelineCard({
  card,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  card: Card
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  return (
    <div
      role="article"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-xl border border-border/60 bg-card p-3 cursor-grab active:cursor-grabbing transition-all',
        dragging ? 'opacity-40 ring-2 ring-orange-500' : 'hover:shadow-md hover:border-border',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <PlatformIcon platform={card.platform} size="sm" />
        <Link href={`/dashboard/agents/${card.agentSlug}`} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
          {card.agent}
        </Link>
        <div
          className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white bg-gradient-to-br ${card.ownerHue}`}
          title={card.owner}
        >
          {card.owner}
        </div>
      </div>
      <p className="text-sm font-bold leading-tight line-clamp-2">{card.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{card.excerpt}</p>
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          {card.scheduledFor && (
            <span className="inline-flex items-center gap-1">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {card.scheduledFor}
            </span>
          )}
          {card.comments > 0 && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              💬 {card.comments}
            </Badge>
          )}
        </div>
        <span>{card.updatedAt}</span>
      </div>
    </div>
  )
}
