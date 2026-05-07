'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'
type Status = 'pending' | 'approved' | 'rejected' | 'changes-requested'

interface Approval {
  id: string
  agent: string
  agentSlug: string
  platform: Platform
  content: string
  scheduledFor: string
  submittedBy: string
  submittedAt: string
  status: Status
  decision?: { by: string; at: string; reason?: string }
  thread?: string[]
  mediaUrls?: string[]
}

const SAMPLE: Approval[] = [
  {
    id: 'a1',
    agent: 'X Agent',
    agentSlug: 'x',
    platform: 'twitter',
    content:
      "5 lessons from launch week. A thread.\n\n1/ Ship before you're ready. We weren't. It still worked.\n2/ The first hour matters more than the first day.\n3/ Pin the demo, not the announcement.\n4/ Reply to every comment for 48h. Velocity beats volume.\n5/ Day-2 silence kills momentum. Have a follow-up ready.",
    scheduledFor: 'Today · 4:30 PM',
    submittedBy: 'Auto-Pilot',
    submittedAt: '8m ago',
    status: 'pending',
    thread: [
      "5 lessons from launch week. A thread.",
      "1/ Ship before you're ready. We weren't. It still worked.",
      "2/ The first hour matters more than the first day.",
      "3/ Pin the demo, not the announcement.",
      "4/ Reply to every comment for 48h. Velocity beats volume.",
      "5/ Day-2 silence kills momentum. Have a follow-up ready.",
    ],
  },
  {
    id: 'a2',
    agent: 'LinkedIn Agent',
    agentSlug: 'linkedin',
    platform: 'linkedin',
    content:
      "We hit 10k customers.\n\nI still cry-laughed in the car after the call with #6,142.\n\nBuilding means caring about every single one. If you're early, that's the bar.",
    scheduledFor: 'Tomorrow · 9:00 AM',
    submittedBy: 'Theo Williams',
    submittedAt: '23m ago',
    status: 'pending',
  },
  {
    id: 'a3',
    agent: 'Meta Agent',
    agentSlug: 'meta',
    platform: 'instagram',
    content:
      "Inside the studio at 7am. Workbench, no stylists. The rejected version we almost shipped. The version we sent.\n\nSave this if you've ever wondered what 'crafted' actually looks like.\n\n#buildinpublic #craft #studio",
    scheduledFor: 'Fri · 12:00 PM',
    submittedBy: 'Auto-Pilot',
    submittedAt: '1h ago',
    status: 'pending',
  },
  {
    id: 'a4',
    agent: 'Gmail Agent',
    agentSlug: 'gmail',
    platform: 'gmail',
    content:
      "subject: small idea, big fan\n\nHi Priya,\n\nshort version: love what you're building. one specific way we could collab in 15 min. happy to send the deck if it's a fit.\n\nLet me know if Tuesday or Thursday afternoon works.\n\n—",
    scheduledFor: 'Send when approved',
    submittedBy: 'Demi Laurence',
    submittedAt: '2h ago',
    status: 'pending',
  },
  {
    id: 'a5',
    agent: 'TikTok Agent',
    agentSlug: 'tiktok',
    platform: 'tiktok',
    content:
      "On-screen: \"I broke every productivity rule for 30 days.\"\nVO: \"Rule #4 made me 3x more focused. Don't skip — wait for the green sticky note.\"\nCaption: do not try this if you have meetings before 10am.",
    scheduledFor: 'Sat · 7:30 PM',
    submittedBy: 'Auto-Pilot',
    submittedAt: '4h ago',
    status: 'approved',
    decision: { by: 'Olivia Park', at: '38m ago' },
  },
  {
    id: 'a6',
    agent: 'X Agent',
    agentSlug: 'x',
    platform: 'twitter',
    content:
      "AI agents are eating SaaS. Buckle up. The next 18 months will be wild.",
    scheduledFor: '—',
    submittedBy: 'Auto-Pilot',
    submittedAt: '1d ago',
    status: 'changes-requested',
    decision: {
      by: 'Demi Laurence',
      at: '6h ago',
      reason: "Too generic — pull out one specific thing our agents do that a generic chatbot can't.",
    },
  },
]

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'changes-requested', label: 'Changes requested' },
  { id: 'all', label: 'All' },
] as const

const PLATFORM_LIMITS: Record<Platform, number> = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  tiktok: 2200,
  gmail: 50000,
  outlook: 50000,
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<Approval[]>(SAMPLE)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('pending')
  const [selectedId, setSelectedId] = useState<string>(SAMPLE[0]?.id ?? '')
  const [reason, setReason] = useState('')

  const filtered = useMemo(
    () => items.filter((i) => filter === 'all' || i.status === filter),
    [items, filter],
  )

  // Resolve selection from the filtered list so the detail pane never
  // disagrees with what's visible.
  const selected = useMemo(() => {
    const fromFilter = filtered.find((i) => i.id === selectedId)
    if (fromFilter) return fromFilter
    return filtered[0] ?? null
  }, [filtered, selectedId])

  useEffect(() => {
    if (selected && selected.id !== selectedId) {
      setSelectedId(selected.id)
    } else if (!selected && selectedId) {
      setSelectedId('')
    }
  }, [selected, selectedId])

  const counts = useMemo(() => {
    const c: Record<Status | 'all', number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      'changes-requested': 0,
      all: items.length,
    }
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1
    return c
  }, [items])

  function decide(id: string, status: Status, why?: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status, decision: { by: 'Demi Laurence', at: 'just now', reason: why } }
          : i,
      ),
    )
    setReason('')
    if (status === 'approved') toast.success('Approved — queued for publish')
    if (status === 'rejected') toast.message('Rejected', { description: 'Removed from queue.' })
    if (status === 'changes-requested') toast.message('Changes requested', { description: 'Agent will redraft.' })
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Approvals"
        description="Drafts waiting on you before they post. Approve, reject, or send back with notes."
        action={
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
            {counts.pending} pending
          </Badge>
        }
      />

      {/* Filter row */}
      <div className="border-b border-border/60 bg-card/30 px-6 py-3 flex flex-wrap items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              filter === f.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            {f.label}
            <span className={cn('ml-1.5 text-[10px] tabular-nums', filter === f.id ? 'opacity-80' : 'opacity-60')}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[400px_1fr] min-h-0">
        {/* List */}
        <div className="border-r border-border/60 max-h-[calc(100vh-9rem)] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Nothing here.</div>
          ) : (
            filtered.map((item) => {
              const isSelected = selected?.id === item.id
              const limit = PLATFORM_LIMITS[item.platform]
              const over = item.content.length > limit
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'w-full text-left border-b border-border/40 px-4 py-4 transition-colors',
                    isSelected ? 'bg-orange-50/60 dark:bg-orange-500/10' : 'hover:bg-muted/40',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <PlatformIcon platform={item.platform} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold truncate">{item.agent}</p>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <p className="text-[10px] text-muted-foreground truncate">{item.submittedBy}</p>
                        <StatusBadge status={item.status} className="ml-auto shrink-0" />
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed line-clamp-3 text-foreground/90">{item.content}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25M3 18.75A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M3 18.75v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {item.scheduledFor}
                        <span className="ml-auto">{item.submittedAt}</span>
                        {over && (
                          <span className="rounded bg-rose-500/10 text-rose-600 px-1.5 py-0.5 text-[9px] font-bold">
                            OVER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Detail pane */}
        <div className="flex flex-col max-h-[calc(100vh-9rem)] overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl">
                  ✓
                </div>
                <p className="text-sm font-semibold">Inbox zero on approvals</p>
                <p className="mt-1 text-xs text-muted-foreground">When agents submit drafts, they&apos;ll show up here.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-border/60 bg-card/40">
                <div className="flex items-start gap-3">
                  <PlatformIcon platform={selected.platform} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/agents/${selected.agentSlug}`} className="text-base font-bold hover:underline">
                        {selected.agent}
                      </Link>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted by {selected.submittedBy} · {selected.submittedAt} · {selected.scheduledFor}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                    <Link href={`/dashboard/agents/${selected.agentSlug}`}>Open agent →</Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {selected.thread ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Thread · {selected.thread.length} tweets
                    </p>
                    {selected.thread.map((t, i) => {
                      const remaining = PLATFORM_LIMITS.twitter - t.length
                      const over = remaining < 0
                      return (
                        <div
                          key={i}
                          className={cn(
                            'rounded-xl border bg-card p-3',
                            over ? 'border-rose-300' : 'border-border/60',
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{t}</p>
                          <p
                            className={cn(
                              'mt-2 text-[10px] tabular-nums',
                              over ? 'text-rose-600 font-bold' : 'text-muted-foreground',
                            )}
                          >
                            {over ? `${Math.abs(remaining)} over limit` : `${t.length}/${PLATFORM_LIMITS.twitter}`}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.content}</p>
                    <p className="mt-3 text-[10px] text-muted-foreground tabular-nums">
                      {selected.content.length}/{PLATFORM_LIMITS[selected.platform]} chars
                    </p>
                  </div>
                )}

                {selected.decision && (
                  <div
                    className={cn(
                      'rounded-2xl border p-4',
                      selected.status === 'approved' && 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-500/5',
                      selected.status === 'rejected' && 'bg-rose-50/40 border-rose-200 dark:bg-rose-500/5',
                      selected.status === 'changes-requested' && 'bg-amber-50/40 border-amber-200 dark:bg-amber-500/5',
                    )}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      {selected.status === 'approved' ? 'Approved' : selected.status === 'rejected' ? 'Rejected' : 'Changes requested'} by {selected.decision.by}
                    </p>
                    {selected.decision.reason && (
                      <p className="text-sm leading-relaxed text-foreground/90">{selected.decision.reason}</p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground">{selected.decision.at}</p>
                  </div>
                )}
              </div>

              {selected.status === 'pending' && (
                <div className="border-t border-border/60 bg-card/40 p-4 space-y-3">
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="Add a note (required for Reject or Request changes)…"
                    aria-label="Decision note"
                    className="resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-600 hover:text-rose-700"
                      disabled={!reason.trim()}
                      onClick={() => decide(selected.id, 'rejected', reason)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={!reason.trim()}
                      onClick={() => decide(selected.id, 'changes-requested', reason)}
                    >
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs px-4"
                      style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                      onClick={() => decide(selected.id, 'approved')}
                    >
                      Approve &amp; queue →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const map: Record<Status, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-orange-500/15 text-orange-700 border-orange-200' },
    approved: { label: 'Approved', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', cls: 'bg-rose-500/15 text-rose-700 border-rose-200' },
    'changes-requested': { label: 'Changes', cls: 'bg-amber-500/15 text-amber-700 border-amber-200' },
  }
  const m = map[status]
  return <Badge className={cn('text-[9px] px-1.5 py-0 border', m.cls, className)}>{m.label}</Badge>
}
