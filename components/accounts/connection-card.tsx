'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './platform-icon'

export interface PlatformDef {
  id: string
  name: string
  description: string
  bg: string
  features: string[]
  category: 'social' | 'email'
  available: boolean
}

interface Connection {
  id: string
  platform: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  scopes: string[]
  expiresAt: string | null
  needsReauth: boolean
  createdAt: string
}

interface Props {
  platform: PlatformDef
  connection: Connection | null
  onChanged: () => void
}

export function ConnectionCard({ platform, connection, onChanged }: Props) {
  const [busy, setBusy] = useState(false)
  const isConnected = !!connection
  const needsReauth = connection?.needsReauth

  async function connect() {
    if (!platform.available) return
    setBusy(true)
    // Full-page redirect to the OAuth initiator
    window.location.href = `/api/oauth/${platform.id}`
  }

  async function disconnect() {
    if (!isConnected) return
    if (!confirm(`Disconnect ${platform.name}? You can always reconnect later.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/connections/${platform.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(`Disconnect failed: ${body.error ?? res.statusText}`)
      } else {
        onChanged()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border/60 transition-all duration-300',
        isConnected
          ? 'border-emerald-500/30 shadow-[inset_0_0_0_1px_oklch(0.65_0.18_152_/_0.18)]'
          : 'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_50px_-20px_oklch(0.652_0.214_36_/_0.25)]',
      )}
    >
      {isConnected && !needsReauth && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(closest-side, oklch(0.7 0.16 152 / 0.5), transparent 70%)',
          }}
        />
      )}
      <CardContent className="relative flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_6px_16px_-4px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5"
            style={{ background: platform.bg }}
          >
            <PlatformIcon platform={platform.id} className="h-5 w-5" />
          </div>

          {isConnected ? (
            needsReauth ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                Reconnect needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Connected
              </span>
            )
          ) : platform.available ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Not connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Coming soon
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg leading-tight tracking-tight text-foreground">{platform.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{platform.description}</p>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-emerald-500/20">
              {connection.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={connection.avatarUrl} alt={connection.displayName ?? platform.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-sm leading-none text-foreground/70">
                  {(connection.displayName ?? connection.username ?? platform.name).slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {connection.displayName ?? connection.username ?? 'Connected'}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {connection.email ?? (connection.username ? `@${connection.username}` : '—')}
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {platform.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <svg className="mt-0.5 h-3 w-3 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-1">
          {isConnected ? (
            <>
              {needsReauth ? (
                <Button
                  className="btn-gradient h-9 flex-1 rounded-full text-xs font-semibold"
                  onClick={connect}
                  disabled={busy}
                >
                  Reconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-9 flex-1 rounded-full border-border/70 text-xs font-semibold"
                  onClick={connect}
                  disabled={busy}
                >
                  Refresh permissions
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full text-xs text-muted-foreground hover:text-destructive"
                onClick={disconnect}
                disabled={busy}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              className={cn(
                'h-9 flex-1 rounded-full text-xs font-semibold',
                platform.available && 'btn-gradient',
              )}
              onClick={connect}
              disabled={!platform.available || busy}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting…
                </span>
              ) : platform.available ? (
                <>Connect {platform.name}</>
              ) : (
                'Coming soon'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
