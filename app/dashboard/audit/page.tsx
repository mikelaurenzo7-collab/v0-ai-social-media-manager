'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Type = 'permission' | 'publish' | 'auth' | 'config' | 'crisis' | 'billing'

interface Entry {
  id: string
  actor: string
  action: string
  target: string
  type: Type
  ts: string // ISO
  ip?: string
  meta?: string
}

const TYPE_META: Record<Type, { label: string; dot: string; cls: string }> = {
  permission: { label: 'Permission', dot: 'bg-violet-500', cls: 'bg-violet-500/10 text-violet-700 border-violet-200' },
  publish: { label: 'Publish', dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  auth: { label: 'Auth', dot: 'bg-amber-500', cls: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  config: { label: 'Config', dot: 'bg-sky-500', cls: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  crisis: { label: 'Crisis', dot: 'bg-rose-500', cls: 'bg-rose-500/10 text-rose-700 border-rose-200' },
  billing: { label: 'Billing', dot: 'bg-indigo-500', cls: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
}

const isoMinusMin = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const isoMinusHr = (h: number) => isoMinusMin(h * 60)
const isoMinusDay = (d: number) => isoMinusHr(d * 24)

const SAMPLE: Entry[] = [
  { id: 'e1', actor: 'Priya Menon', action: 'updated permissions on', target: 'X Agent', type: 'permission', ts: isoMinusMin(8), ip: '203.0.113.42', meta: 'tools.image=false' },
  { id: 'e2', actor: 'Theo Williams', action: 'published post via', target: 'LinkedIn Agent', type: 'publish', ts: isoMinusMin(34), meta: 'post id LN-9241' },
  { id: 'e3', actor: 'Olivia Park', action: 'approved draft from', target: 'Meta Agent', type: 'publish', ts: isoMinusHr(1), meta: 'draft id DR-7711' },
  { id: 'e4', actor: 'System', action: 'rotated OAuth token for', target: 'TikTok', type: 'auth', ts: isoMinusHr(6) },
  { id: 'e5', actor: 'Demi Laurence', action: 'invited', target: 'maya@yourbrand.app · Editor', type: 'config', ts: isoMinusDay(2) },
  { id: 'e6', actor: 'Demi Laurence', action: 'updated brand kit voice fingerprint', target: '', type: 'config', ts: isoMinusDay(3) },
  { id: 'e7', actor: 'Demi Laurence', action: 'armed Crisis Mode', target: '', type: 'crisis', ts: isoMinusDay(4), meta: 'reason: pricing complaint investigation' },
  { id: 'e8', actor: 'Demi Laurence', action: 'disarmed Crisis Mode', target: '', type: 'crisis', ts: isoMinusDay(4) },
  { id: 'e9', actor: 'System', action: 'auto-published from', target: 'X Agent', type: 'publish', ts: isoMinusDay(5), meta: 'workflow: Friday recap' },
  { id: 'e10', actor: 'Theo Williams', action: 'rejected draft from', target: 'LinkedIn Agent', type: 'publish', ts: isoMinusDay(6), meta: 'reason: rewrite intro' },
  { id: 'e11', actor: 'Demi Laurence', action: 'changed plan to', target: 'Pro · monthly', type: 'billing', ts: isoMinusDay(8) },
  { id: 'e12', actor: 'Olivia Park', action: 'connected', target: 'Outlook', type: 'auth', ts: isoMinusDay(10), ip: '203.0.113.42' },
  { id: 'e13', actor: 'Priya Menon', action: 'updated quiet hours on', target: 'Gmail Agent', type: 'permission', ts: isoMinusDay(12), meta: '21:00 → 07:00' },
  { id: 'e14', actor: 'System', action: 'detected token expiry in 72h for', target: 'TikTok', type: 'auth', ts: isoMinusDay(13) },
  { id: 'e15', actor: 'Demi Laurence', action: 'created workspace', target: 'Northwave Agency', type: 'config', ts: isoMinusDay(20) },
]

const TYPES: { id: Type | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'publish', label: 'Publish' },
  { id: 'permission', label: 'Permission' },
  { id: 'auth', label: 'Auth' },
  { id: 'config', label: 'Config' },
  { id: 'crisis', label: 'Crisis' },
  { id: 'billing', label: 'Billing' },
]

const RANGES: { id: '24h' | '7d' | '30d' | 'all'; label: string; ms: number }[] = [
  { id: '24h', label: 'Last 24 hours', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: 'Last 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: 'Last 30 days', ms: 30 * 24 * 60 * 60 * 1000 },
  { id: 'all', label: 'All time', ms: Number.POSITIVE_INFINITY },
]

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'just now'
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function fmtAbsolute(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AuditLogPage() {
  const [type, setType] = useState<Type | 'all'>('all')
  const [range, setRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const cutoff = Date.now() - (RANGES.find((r) => r.id === range)?.ms ?? Number.POSITIVE_INFINITY)
    const query = q.trim().toLowerCase()
    return SAMPLE.filter((e) => {
      if (type !== 'all' && e.type !== type) return false
      if (new Date(e.ts).getTime() < cutoff) return false
      if (!query) return true
      return (
        e.actor.toLowerCase().includes(query) ||
        e.action.toLowerCase().includes(query) ||
        e.target.toLowerCase().includes(query) ||
        (e.meta?.toLowerCase().includes(query) ?? false)
      )
    })
  }, [type, range, q])

  function exportCsv() {
    const rows = [
      ['timestamp', 'actor', 'action', 'target', 'type', 'meta', 'ip'],
      ...filtered.map((e) => [e.ts, e.actor, e.action, e.target, e.type, e.meta ?? '', e.ip ?? '']),
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    if (typeof window === 'undefined') return
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported audit log', { description: `${filtered.length} entries.` })
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Audit log"
        description="Every action that mattered, who did it, and when. Stream to your SIEM via webhook on Business plans."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/dashboard/developers">Stream to SIEM →</Link>
            </Button>
            <Button
              size="sm"
              onClick={exportCsv}
              style={{ background: 'var(--brand-gradient)' }}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="border-b border-border/60 bg-card/30 px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search audit log"
            placeholder="Search actor, action, target…"
            className="h-8 pl-9 text-xs"
          />
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
          aria-label="Time range"
          className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs font-medium"
        >
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                type === t.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-sm font-semibold">No entries match.</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a longer time range or different filter.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        When
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Actor
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Event
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Meta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => {
                      const meta = TYPE_META[e.type]
                      return (
                        <tr key={e.id} className={cn('align-top', i % 2 === 0 ? '' : 'bg-muted/15')}>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-xs font-medium">{fmtRelative(e.ts)}</div>
                            <div className="text-[10px] text-muted-foreground tabular-nums">{fmtAbsolute(e.ts)}</div>
                          </td>
                          <td className="px-5 py-3 text-xs font-semibold whitespace-nowrap">{e.actor}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs text-muted-foreground">{e.action}</span>{' '}
                            {e.target && <span className="text-xs font-semibold">{e.target}</span>}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <Badge className={cn('text-[10px] px-1.5 py-0 border', meta.cls)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full mr-1.5 inline-block', meta.dot)} />
                              {meta.label}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-[11px] text-muted-foreground font-mono">
                            {e.meta || '—'}
                            {e.ip && <span className="ml-2 text-muted-foreground/70">({e.ip})</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Audit log retained for 13 months on Pro · 7 years on Business · custom on Enterprise.
        </p>
      </div>
    </div>
  )
}
