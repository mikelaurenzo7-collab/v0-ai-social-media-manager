'use client'

import { useEffect, useMemo, useState } from 'react'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Status = 'shipped' | 'in-progress' | 'next' | 'considered'

interface Item {
  id: string
  title: string
  desc: string
  status: Status
  category: 'agents' | 'inbox' | 'pipeline' | 'analytics' | 'team' | 'developers' | 'mobile' | 'integrations'
  votes: number
  shippedDate?: string
  eta?: string
}

const ITEMS: Item[] = [
  // Shipped
  { id: 'r-inbox', title: 'Unified Inbox across all 7 channels', desc: 'Replies, mentions, comments, DMs in one place — with AI-suggested replies that match your brand voice.', status: 'shipped', category: 'inbox', votes: 412, shippedDate: 'May 2026' },
  { id: 'r-brand', title: 'Brand Kit with voice fingerprint', desc: 'Train your agents on a sample, lock the do/don\'t rules, layer agent customization on top.', status: 'shipped', category: 'agents', votes: 388, shippedDate: 'May 2026' },
  { id: 'r-pipeline', title: 'Kanban content pipeline', desc: 'Idea → Draft → Review → Approved → Scheduled → Published. Drag to advance.', status: 'shipped', category: 'pipeline', votes: 357, shippedDate: 'May 2026' },
  { id: 'r-approvals', title: 'Approvals queue with role-based gating', desc: 'Per-agent posting modes, approver assignment, audit log.', status: 'shipped', category: 'team', votes: 312, shippedDate: 'May 2026' },
  { id: 'r-team', title: 'Team workspace + audit log', desc: 'Members, roles, agent access matrix, invites, every meaningful action logged.', status: 'shipped', category: 'team', votes: 289, shippedDate: 'May 2026' },
  { id: 'r-trends', title: 'Trends & competitor watcher', desc: 'Real-time velocity scoring with audience-match and your specific angle.', status: 'shipped', category: 'analytics', votes: 245, shippedDate: 'May 2026' },
  { id: 'r-developers', title: 'Public REST API + webhooks', desc: 'API keys with scopes, webhooks with HMAC signing, cURL/Node/Python quickstarts.', status: 'shipped', category: 'developers', votes: 198, shippedDate: 'May 2026' },
  { id: 'r-copilot', title: 'AI Co-Pilot drawer (⌘J)', desc: 'Context-aware assistant that knows the page you\'re on and can take actions on it.', status: 'shipped', category: 'agents', votes: 521, shippedDate: 'May 2026' },
  { id: 'r-crisis', title: 'Crisis mode', desc: 'One-tap global pause for every agent and the entire scheduled queue, audit-logged.', status: 'shipped', category: 'team', votes: 167, shippedDate: 'May 2026' },

  // In progress
  { id: 'r-mobile', title: 'iOS + Android apps', desc: 'Push notifications for approvals and inbox, thumb-friendly composer, biometric unlock.', status: 'in-progress', category: 'mobile', votes: 1142, eta: 'Q3 2026' },
  { id: 'r-perms-server', title: 'Server-backed permissions enforcement', desc: 'Today the agent permission UI is a client preview. Promoting it to authoritative, workspace-scoped, and shared with Auto-Pilot.', status: 'in-progress', category: 'team', votes: 612, eta: 'June 2026' },
  { id: 'r-asset-upload', title: 'Real asset library (uploads + S3 + AI tagging)', desc: 'Drag-and-drop, encrypted at rest, agents auto-tag for search and reuse.', status: 'in-progress', category: 'pipeline', votes: 478, eta: 'June 2026' },
  { id: 'r-soc2-2', title: 'SOC 2 Type 2 audit', desc: 'Audit window opens Q4. Type 1 already complete.', status: 'in-progress', category: 'team', votes: 312, eta: 'Q4 2026' },

  // Next
  { id: 'r-multi-ws', title: 'Agency multi-workspace operator console', desc: 'Switch + compare across all your client workspaces in one view. Bulk actions across them.', status: 'next', category: 'team', votes: 873, eta: 'Q3 2026' },
  { id: 'r-genome', title: 'Content Genome visualization', desc: 'Visual map of your content\'s DNA. Topics × engagement × time. Click any cluster to remix.', status: 'next', category: 'analytics', votes: 645, eta: 'Q3 2026' },
  { id: 'r-voice-clone', title: 'Voice cloning (audio)', desc: 'Train an agent on real audio for podcast, voice notes, and TikTok voice-overs. Consent-gated.', status: 'next', category: 'agents', votes: 524, eta: 'Q4 2026' },
  { id: 'r-slack', title: 'Slack & Discord integrations', desc: 'Approvals in Slack/Discord, daily digests, crisis alerts.', status: 'next', category: 'integrations', votes: 488, eta: 'Q3 2026' },
  { id: 'r-experiments', title: 'A/B testing for posts', desc: 'Run two takes against each other on the same audience window, declare a winner automatically.', status: 'next', category: 'analytics', votes: 421, eta: 'Q4 2026' },

  // Considered
  { id: 'r-yt', title: 'YouTube Shorts + Threads support', desc: 'Adding two more channels.', status: 'considered', category: 'integrations', votes: 691 },
  { id: 'r-dao', title: 'Token-gated workspaces (web3 brands)', desc: 'Sign-in with wallet, NFT-gated agent access. Niche but loud demand.', status: 'considered', category: 'team', votes: 88 },
  { id: 'r-podcast', title: 'Podcast clipping agent', desc: 'Drop an audio file, get short-form video clips with auto-captions and platform-perfect cuts.', status: 'considered', category: 'agents', votes: 532 },
  { id: 'r-deal', title: 'Deals & sponsorship CRM', desc: 'Track partnerships, deliverables, payouts, and FTC disclosure tagging.', status: 'considered', category: 'pipeline', votes: 416 },
  { id: 'r-mcp', title: 'MCP tools marketplace', desc: 'Plug your own MCP servers into agents — internal CRMs, data warehouses, custom playbooks.', status: 'considered', category: 'developers', votes: 367 },
]

const STATUS_META: Record<Status, { label: string; cls: string; accent: string }> = {
  shipped:       { label: 'Shipped',     cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',  accent: 'from-emerald-500 to-teal-600' },
  'in-progress': { label: 'In progress', cls: 'bg-orange-500/10 text-orange-700 border-orange-200',     accent: 'from-orange-500 to-pink-600' },
  next:          { label: 'Next up',     cls: 'bg-violet-500/10 text-violet-700 border-violet-200',    accent: 'from-violet-500 to-purple-600' },
  considered:    { label: 'Considered',  cls: 'bg-slate-500/10 text-slate-700 border-slate-200',       accent: 'from-slate-500 to-slate-700' },
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'agents', label: 'Agents' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'team', label: 'Team' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'developers', label: 'Developers' },
  { id: 'mobile', label: 'Mobile' },
] as const

const VOTES_KEY = 'postpilot_roadmap_votes_v1'

function readVotes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(VOTES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export default function RoadmapPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [voted, setVoted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setVoted(readVotes())
  }, [])

  function toggleVote(id: string) {
    setVoted((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        window.localStorage.setItem(VOTES_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const filtered = useMemo(() => {
    return ITEMS.filter((i) => {
      if (filter !== 'all' && i.category !== filter) return false
      if (statusFilter !== 'all' && i.status !== statusFilter) return false
      return true
    })
  }, [filter, statusFilter])

  const byStatus = useMemo(() => {
    const map: Record<Status, Item[]> = { shipped: [], 'in-progress': [], next: [], considered: [] }
    for (const i of filtered) map[i.status].push(i)
    // sort within a status by votes desc
    for (const k of Object.keys(map) as Status[]) {
      map[k].sort((a, b) => b.votes - a.votes)
    }
    return map
  }, [filtered])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(circle at top right, oklch(0.652 0.214 36 / 0.08), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Public roadmap</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">
              What we&apos;re building.
              <span className="block text-muted-foreground font-normal italic" style={{ fontFamily: 'var(--font-display)' }}>
                In the open.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Vote on what matters. We read every signal — and we ship the things people actually use, not the things
              we think are clever. Considered &gt; Next &gt; In progress &gt; Shipped is the only path.
            </p>
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {(['shipped', 'in-progress', 'next', 'considered'] as Status[]).map((s) => {
                const count = ITEMS.filter((i) => i.status === s).length
                return (
                  <div key={s} className="rounded-2xl border border-border/60 bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${STATUS_META[s].accent}`} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {STATUS_META[s].label}
                      </p>
                    </div>
                    <p className="mt-1 text-2xl font-black tabular-nums">{count}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilter(c.id)}
                  aria-pressed={filter === c.id}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    filter === c.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              aria-label="Filter by status"
              className="h-8 rounded-lg border border-border/60 bg-background px-3 text-xs font-medium"
            >
              <option value="all">All statuses</option>
              <option value="shipped">Shipped</option>
              <option value="in-progress">In progress</option>
              <option value="next">Next up</option>
              <option value="considered">Considered</option>
            </select>
          </div>
        </section>

        {/* Columns by status */}
        <section className="mx-auto max-w-5xl px-6 pb-20 space-y-12">
          {(['in-progress', 'next', 'considered', 'shipped'] as Status[]).map((s) => {
            const items = byStatus[s]
            if (items.length === 0) return null
            const meta = STATUS_META[s]
            return (
              <div key={s}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${meta.accent}`} />
                    {meta.label}
                    <span className="text-sm font-mono text-muted-foreground tabular-nums">{items.length}</span>
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <VoteButton
                            count={item.votes + (voted[item.id] ? 1 : 0)}
                            voted={!!voted[item.id]}
                            onClick={() => toggleVote(item.id)}
                            disabled={item.status === 'shipped'}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold leading-snug">{item.title}</h3>
                              <Badge className={cn('text-[9px] px-1.5 py-0 border', meta.cls)}>{meta.label}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            <p className="mt-2 text-[10px] text-muted-foreground tabular-nums">
                              {item.shippedDate
                                ? `Shipped ${item.shippedDate}`
                                : item.eta
                                  ? `Est. ${item.eta}`
                                  : 'Estimate when prioritized'}{' '}
                              ·{' '}
                              <span className="capitalize">{item.category}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <div
            className="rounded-3xl p-8 sm:p-10 text-white"
            style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48), oklch(0.21 0.05 30))' }}
          >
            <h2 className="text-2xl font-bold tracking-tight">Don&apos;t see it?</h2>
            <p className="mt-2 text-sm text-white/75 max-w-2xl leading-relaxed">
              We read every request. Email{' '}
              <a className="text-orange-300 hover:underline" href="mailto:roadmap@postpilot.app">
                roadmap@postpilot.app
              </a>{' '}
              with what you&apos;d build, why, and who else needs it. We answer within 48 hours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="text-sm font-semibold"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <a href="mailto:roadmap@postpilot.app">Send a request</a>
              </Button>
              <Button asChild variant="outline" className="text-sm font-semibold border-white/20 text-white hover:bg-white/5">
                <a href="/changelog">See what shipped →</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function VoteButton({
  count,
  voted,
  onClick,
  disabled,
}: {
  count: number
  voted: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? 'Remove vote' : 'Vote for this item'}
      className={cn(
        'flex flex-col items-center justify-center shrink-0 w-12 h-14 rounded-xl border transition-all',
        voted
          ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300'
          : 'border-border/60 hover:border-border bg-card text-foreground/80',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <svg
        className={cn('h-3.5 w-3.5 mb-0.5', voted && 'fill-orange-500 stroke-orange-500')}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      <span className="text-[11px] font-bold tabular-nums">{count}</span>
    </button>
  )
}
