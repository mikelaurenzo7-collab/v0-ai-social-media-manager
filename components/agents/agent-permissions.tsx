'use client'

import { useEffect, useState } from 'react'
import type { Agent } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type PostingMode = 'autopublish' | 'approval' | 'draft-only'

interface Permissions {
  postingMode: PostingMode
  scopes: {
    read: boolean
    post: boolean
    reply: boolean
    dm: boolean
    delete: boolean
  }
  approvers: string[]
  maxPostsPerDay: number
  maxPostsPerWeek: number
  quietHours: { start: string; end: string; enabled: boolean }
  tools: { web: boolean; brandKit: boolean; analytics: boolean; calendar: boolean; image: boolean }
  rateLimitedAlerts: boolean
}

const DEFAULTS: Permissions = {
  postingMode: 'approval',
  scopes: { read: true, post: true, reply: true, dm: false, delete: false },
  approvers: ['Workspace owner'],
  maxPostsPerDay: 4,
  maxPostsPerWeek: 14,
  quietHours: { start: '21:00', end: '07:00', enabled: true },
  tools: { web: true, brandKit: true, analytics: true, calendar: true, image: true },
  rateLimitedAlerts: true,
}

const POSTING_MODES: { id: PostingMode; label: string; desc: string }[] = [
  {
    id: 'autopublish',
    label: 'Auto-publish',
    desc: 'Agent drafts and publishes automatically. Highest reach, lowest control.',
  },
  {
    id: 'approval',
    label: 'Approval required',
    desc: 'Agent drafts; a human approves before anything goes out. Recommended.',
  },
  {
    id: 'draft-only',
    label: 'Draft only',
    desc: 'Agent saves drafts only — never publishes. You move things forward.',
  },
]

const APPROVER_OPTIONS = [
  'Workspace owner',
  'Any admin',
  'Marketing manager',
  'Brand lead',
  'Specific reviewer',
]

const TOOL_DEFS: { key: keyof Permissions['tools']; label: string; desc: string; emoji: string }[] = [
  { key: 'web', label: 'Web search', desc: 'Lookup trending topics, fact-check claims', emoji: '🌐' },
  { key: 'brandKit', label: 'Brand Kit', desc: 'Voice, palette, hashtag groups, snippets', emoji: '🎨' },
  { key: 'analytics', label: 'Analytics', desc: 'Read engagement data on past posts', emoji: '📊' },
  { key: 'calendar', label: 'Calendar', desc: 'Schedule posts, see existing queue', emoji: '📅' },
  { key: 'image', label: 'Image generation', desc: 'Create images that match the brand palette', emoji: '🖼️' },
]

export function AgentPermissions({ agent }: { agent: Agent }) {
  const storageKey = `agent_${agent.id}_permissions_v1`

  const [p, setP] = useState<Permissions>(DEFAULTS)
  const [dirty, setDirty] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Permissions>
        setP({ ...DEFAULTS, ...parsed, scopes: { ...DEFAULTS.scopes, ...parsed.scopes }, tools: { ...DEFAULTS.tools, ...parsed.tools }, quietHours: { ...DEFAULTS.quietHours, ...parsed.quietHours } })
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id])

  function update<K extends keyof Permissions>(key: K, value: Permissions[K]) {
    setP((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(p))
      toast.success('Permissions saved', { description: `${agent.name} will follow these on the next request.` })
      setDirty(false)
    } catch {
      toast.error('Could not save — local storage blocked')
    }
  }

  if (!mounted) return null

  const dangerScope = p.scopes.delete

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Permissions for {agent.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Control exactly what this agent can do, when, and on whose approval.
          </p>
        </div>
        <Button
          size="sm"
          onClick={save}
          disabled={!dirty}
          style={dirty ? { background: 'linear-gradient(135deg, #EA580C, #DB2777)' } : undefined}
        >
          {dirty ? 'Save permissions' : 'Saved'}
        </Button>
      </div>

      {/* Posting mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Posting authority</CardTitle>
          <CardDescription>Pick how much rope this agent gets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {POSTING_MODES.map((m) => {
            const selected = p.postingMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => update('postingMode', m.id)}
                className={cn(
                  'w-full text-left rounded-2xl border p-4 transition-all',
                  selected
                    ? 'border-orange-500 bg-orange-500/5'
                    : 'border-border/60 bg-card hover:border-border',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      selected ? 'border-orange-500' : 'border-border',
                    )}
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{m.label}</p>
                      {m.id === 'approval' && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 border-emerald-200">
                          Recommended
                        </Badge>
                      )}
                      {m.id === 'autopublish' && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-700 border-amber-200">
                          Higher risk
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}

          {p.postingMode === 'approval' && (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <Label className="text-xs">Approvers</Label>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Anyone in this list can approve drafts from {agent.name}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {APPROVER_OPTIONS.map((opt) => {
                  const on = p.approvers.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        update(
                          'approvers',
                          on ? p.approvers.filter((x) => x !== opt) : [...p.approvers, opt],
                        )
                      }}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                        on
                          ? 'border-orange-500 bg-orange-500/10 text-foreground'
                          : 'border-border/60 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {on ? '✓ ' : ''}{opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scopes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel scopes</CardTitle>
          <CardDescription>What can this agent touch on its connected channel?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { k: 'read', label: 'Read content', desc: 'View posts, mentions, replies' },
              { k: 'post', label: 'Publish posts', desc: 'Create new posts (subject to posting authority)' },
              { k: 'reply', label: 'Reply on your behalf', desc: 'Comment back on replies and mentions' },
              { k: 'dm', label: 'Send DMs', desc: 'Initiate direct messages to followers' },
              {
                k: 'delete',
                label: 'Delete content',
                desc: 'Remove posts, comments, or DMs. Irreversible.',
                danger: true,
              },
            ] as const
          ).map((s) => (
            <div
              key={s.k}
              className={cn(
                'flex items-start justify-between gap-4 rounded-xl border px-4 py-3',
                'danger' in s && s.danger && p.scopes[s.k] ? 'border-rose-300 bg-rose-50/30 dark:bg-rose-500/5' : 'border-border/60 bg-muted/20',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{s.label}</p>
                  {'danger' in s && s.danger && (
                    <Badge className="text-[9px] px-1.5 py-0 bg-rose-500/15 text-rose-700 border-rose-200">
                      Destructive
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
              <Switch
                checked={p.scopes[s.k]}
                onCheckedChange={(v) => update('scopes', { ...p.scopes, [s.k]: v })}
                aria-label={s.label}
              />
            </div>
          ))}
          {dangerScope && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              ⚠ Delete is enabled. Actions go through your audit log and require approval regardless of posting mode.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate limits</CardTitle>
          <CardDescription>Hard caps the agent will not exceed, even on Auto-Pilot.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="max-day" className="text-xs">Max posts per day</Label>
            <input
              id="max-day"
              type="number"
              min={0}
              max={50}
              value={p.maxPostsPerDay}
              onChange={(e) => update('maxPostsPerDay', Math.max(0, Number(e.target.value) || 0))}
              className="mt-1.5 h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="max-week" className="text-xs">Max posts per week</Label>
            <input
              id="max-week"
              type="number"
              min={0}
              max={200}
              value={p.maxPostsPerWeek}
              onChange={(e) => update('maxPostsPerWeek', Math.max(0, Number(e.target.value) || 0))}
              className="mt-1.5 h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
            />
          </div>
          <div className="sm:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">Quiet hours</p>
                <p className="text-[11px] text-muted-foreground">No posts or DMs in this window.</p>
              </div>
              <Switch
                checked={p.quietHours.enabled}
                onCheckedChange={(v) => update('quietHours', { ...p.quietHours, enabled: v })}
                aria-label="Quiet hours enabled"
              />
            </div>
            <div className={cn('grid grid-cols-2 gap-3', !p.quietHours.enabled && 'opacity-50 pointer-events-none')}>
              <div>
                <Label htmlFor="qh-start" className="text-[11px]">From</Label>
                <input
                  id="qh-start"
                  type="time"
                  value={p.quietHours.start}
                  onChange={(e) => update('quietHours', { ...p.quietHours, start: e.target.value })}
                  className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-sm font-mono"
                />
              </div>
              <div>
                <Label htmlFor="qh-end" className="text-[11px]">To</Label>
                <input
                  id="qh-end"
                  type="time"
                  value={p.quietHours.end}
                  onChange={(e) => update('quietHours', { ...p.quietHours, end: e.target.value })}
                  className="mt-1 h-8 w-full rounded-md border border-border/60 bg-background px-2 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tool access</CardTitle>
          <CardDescription>Which capabilities {agent.name} can call.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {TOOL_DEFS.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-xl shrink-0">{t.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </div>
              </div>
              <Switch
                checked={p.tools[t.key]}
                onCheckedChange={(v) => update('tools', { ...p.tools, [t.key]: v })}
                aria-label={t.label}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alerting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notify me on rate-limit hits</p>
              <p className="text-[11px] text-muted-foreground">
                Get a notification if {agent.name} hits a daily / weekly cap or quiet-hour block.
              </p>
            </div>
            <Switch
              checked={p.rateLimitedAlerts}
              onCheckedChange={(v) => update('rateLimitedAlerts', v)}
              aria-label="Rate limit alerts"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
