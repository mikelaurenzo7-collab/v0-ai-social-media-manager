'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface ApiKey {
  id: string
  name: string
  scope: 'read' | 'read-write' | 'admin'
  prefix: string
  preview: string
  createdAt: string
  lastUsed: string
}

interface Webhook {
  id: string
  url: string
  events: string[]
  enabled: boolean
  lastDelivery: string
  successRate: number
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production · server-side',
    scope: 'read-write',
    prefix: 'pp_live_sk',
    preview: 'pp_live_sk_••••••••••••••94f2',
    createdAt: 'Apr 12, 2026',
    lastUsed: '4m ago',
  },
  {
    id: 'k2',
    name: 'Staging',
    scope: 'read-write',
    prefix: 'pp_test_sk',
    preview: 'pp_test_sk_••••••••••••••2c7e',
    createdAt: 'Mar 28, 2026',
    lastUsed: '2h ago',
  },
  {
    id: 'k3',
    name: 'Read-only · Looker dashboard',
    scope: 'read',
    prefix: 'pp_live_pk',
    preview: 'pp_live_pk_••••••••••••••11ab',
    createdAt: 'Feb 4, 2026',
    lastUsed: '1d ago',
  },
]

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: 'wh-1',
    url: 'https://hooks.yourbrand.app/postpilot/published',
    events: ['post.published', 'post.failed'],
    enabled: true,
    lastDelivery: '12m ago · 200',
    successRate: 99.4,
  },
  {
    id: 'wh-2',
    url: 'https://api.yourbrand.app/webhooks/approvals',
    events: ['approval.requested', 'approval.decided'],
    enabled: true,
    lastDelivery: '1h ago · 200',
    successRate: 100,
  },
  {
    id: 'wh-3',
    url: 'https://siem.yourbrand.app/audit',
    events: ['audit.*'],
    enabled: false,
    lastDelivery: '5d ago · 503',
    successRate: 87.1,
  },
]

const ALL_EVENTS = [
  { id: 'post.published', desc: 'A post was published successfully' },
  { id: 'post.failed', desc: 'A post failed to publish' },
  { id: 'approval.requested', desc: 'An agent submitted a draft for approval' },
  { id: 'approval.decided', desc: 'A pending draft was approved/rejected/sent back' },
  { id: 'connection.expiring', desc: 'An OAuth token will expire in 72h' },
  { id: 'audit.*', desc: 'All audit-log events (Business plan)' },
] as const

const SCOPE_STYLE: Record<ApiKey['scope'], string> = {
  read: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  'read-write': 'bg-orange-500/15 text-orange-700 border-orange-200',
  admin: 'bg-rose-500/15 text-rose-700 border-rose-200',
}

const QUICKSTART_SAMPLES: { id: string; label: string; lang: string; code: string }[] = [
  {
    id: 'curl',
    label: 'cURL',
    lang: 'bash',
    code: `curl https://api.postpilot.app/v1/posts \\
  -H "Authorization: Bearer $POSTPILOT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "linkedin",
    "text": "We just shipped Auto-Pilot. Here's what we learned…",
    "schedule_for": "2026-05-09T14:00:00Z"
  }'`,
  },
  {
    id: 'node',
    label: 'Node',
    lang: 'ts',
    code: `import PostPilot from '@postpilot/sdk'

const pp = new PostPilot({ apiKey: process.env.POSTPILOT_API_KEY })

const draft = await pp.posts.create({
  agent: 'linkedin',
  text: "We just shipped Auto-Pilot. Here's what we learned…",
  scheduleFor: new Date('2026-05-09T14:00:00Z'),
})

console.log(draft.id, draft.status)`,
  },
  {
    id: 'python',
    label: 'Python',
    lang: 'py',
    code: `import os, postpilot

pp = postpilot.Client(api_key=os.environ["POSTPILOT_API_KEY"])

draft = pp.posts.create(
    agent="linkedin",
    text="We just shipped Auto-Pilot. Here's what we learned…",
    schedule_for="2026-05-09T14:00:00Z",
)

print(draft.id, draft.status)`,
  },
]

export default function DevelopersPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS)
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [sample, setSample] = useState<typeof QUICKSTART_SAMPLES[number]['id']>('curl')

  const activeSample = useMemo(
    () => QUICKSTART_SAMPLES.find((s) => s.id === sample) ?? QUICKSTART_SAMPLES[0],
    [sample],
  )

  function copy(text: string, label: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success(`${label} copied`))
        .catch(() => toast.error('Could not copy'))
    }
  }

  function generateKey() {
    const id = `k${Date.now()}`
    const tail = Math.random().toString(16).slice(2, 6)
    const newKey: ApiKey = {
      id,
      name: 'New API key',
      scope: 'read-write',
      prefix: 'pp_live_sk',
      preview: `pp_live_sk_•••••••••••${tail}`,
      createdAt: 'just now',
      lastUsed: 'never',
    }
    setKeys((prev) => [newKey, ...prev])
    setRevealedId(id)
    toast.success('API key created', {
      description: 'Copy it now — it won\'t be shown in full again.',
    })
  }

  function revokeKey(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast.message('API key revoked')
  }

  function toggleWebhook(id: string) {
    setWebhooks((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        toast.success(w.enabled ? 'Webhook paused' : 'Webhook enabled')
        return { ...w, enabled: !w.enabled }
      }),
    )
  }

  function deleteWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
    toast.message('Webhook removed')
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Developers"
        description="API keys, webhooks, and code samples. Build PostPilot into your stack."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="/security#subprocessors" className="text-xs">
                Compliance →
              </a>
            </Button>
            <Button
              size="sm"
              onClick={generateKey}
              style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
            >
              + Generate API key
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Quickstart code samples */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base">Quickstart</CardTitle>
              <CardDescription>Publish a post in three lines, in your language of choice.</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
              {QUICKSTART_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSample(s.id)}
                  aria-pressed={sample === s.id}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
                    sample === s.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="relative rounded-xl border border-border/60 overflow-hidden"
              style={{ background: 'oklch(0.135 0.018 48)' }}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="text-[10px] font-mono text-white/50">{activeSample.lang}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px] text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => copy(activeSample.code, 'Snippet')}
                >
                  Copy
                </Button>
              </div>
              <pre className="px-4 py-4 text-[12.5px] font-mono leading-relaxed text-white/90 overflow-x-auto whitespace-pre">
                {activeSample.code}
              </pre>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Full reference at{' '}
              <a className="text-orange-600 hover:underline" href="#">
                docs.postpilot.app
              </a>{' '}
              · Rate limits: 600 req/min on Pro, 6,000 req/min on Business.
            </p>
          </CardContent>
        </Card>

        {/* API keys */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API keys</CardTitle>
            <CardDescription>
              Server-side keys (sk) live in your secrets manager only. Public keys (pk) are read-only and safe in
              client code.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {keys.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">No keys yet.</p>
            ) : (
              keys.map((k, i) => {
                const isRevealed = revealedId === k.id
                return (
                  <div
                    key={k.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4',
                      i !== keys.length - 1 && 'border-b border-border/40',
                    )}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                    >
                      🔑
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{k.name}</p>
                        <Badge className={cn('text-[9px] px-1.5 py-0 border', SCOPE_STYLE[k.scope])}>
                          {k.scope}
                        </Badge>
                      </div>
                      <p className="mt-1 font-mono text-[12px] text-muted-foreground select-all">
                        {isRevealed ? `${k.prefix}_${'fake_secret_demo_key_value_'}${k.id}` : k.preview}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Created {k.createdAt} · Last used {k.lastUsed}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setRevealedId(isRevealed ? null : k.id)
                          if (!isRevealed) {
                            copy(`${k.prefix}_demo_value_${k.id}`, 'API key')
                          }
                        }}
                      >
                        {isRevealed ? 'Hide' : 'Reveal & copy'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                        onClick={() => revokeKey(k.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Webhooks</CardTitle>
              <CardDescription>
                Get a signed POST when something happens. We retry with exponential backoff for 24h on non-2xx.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() =>
                toast.message('Webhook builder', {
                  description: 'URL + events picker lands in the next release.',
                })
              }
            >
              + Add endpoint
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {webhooks.map((w, i) => (
              <div
                key={w.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-4',
                  i !== webhooks.length - 1 && 'border-b border-border/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm',
                    w.enabled ? 'bg-emerald-500/15 text-emerald-700' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {w.enabled ? '🟢' : '⏸'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono font-semibold truncate" title={w.url}>
                    {w.url}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {w.events.map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-muted text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-1.5 py-0.5"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Last delivery {w.lastDelivery} · {w.successRate}% success
                  </p>
                </div>
                <Switch
                  checked={w.enabled}
                  onCheckedChange={() => toggleWebhook(w.id)}
                  aria-label={`Toggle ${w.url}`}
                  className="shrink-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                  onClick={() => deleteWebhook(w.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Event reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event reference</CardTitle>
            <CardDescription>The events you can subscribe to from a webhook.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {ALL_EVENTS.map((e, i) => (
              <div
                key={e.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-3',
                  i !== ALL_EVENTS.length - 1 && 'border-b border-border/40',
                )}
              >
                <code className="text-xs font-mono font-semibold text-orange-700">{e.id}</code>
                <span className="text-xs text-muted-foreground">{e.desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Webhook signing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verifying webhook signatures</CardTitle>
            <CardDescription>
              Every payload is signed with HMAC-SHA256 over <code>${'{timestamp}'}.${'{body}'}</code> using your endpoint
              secret. Reject anything older than 5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Endpoint signing secret</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  readOnly
                  value="whsec_demo_••••••••••••••5b3d"
                  aria-label="Webhook signing secret"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={() => copy('whsec_demo_value', 'Signing secret')}
                >
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => toast.message('Rotated', { description: 'New secret will appear here.' })}
                >
                  Rotate
                </Button>
              </div>
            </div>

            <pre
              className="rounded-xl border border-border/60 px-4 py-4 text-[12.5px] font-mono leading-relaxed overflow-x-auto whitespace-pre"
              style={{ background: 'oklch(0.135 0.018 48)', color: 'oklch(0.92 0.005 48)' }}
            >
{`import crypto from 'node:crypto'

export function verify(req: { rawBody: string; headers: Record<string, string> }) {
  const ts = req.headers['x-postpilot-timestamp']
  const sig = req.headers['x-postpilot-signature']
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(\`\${ts}.\${req.rawBody}\`)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
