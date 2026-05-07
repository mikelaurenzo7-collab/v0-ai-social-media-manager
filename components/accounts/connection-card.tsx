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
        'group relative overflow-hidden border-border/60 transition-all duration-200',
        isConnected && 'border-primary/30 ring-1 ring-primary/15',
        !isConnected && 'hover:shadow-lg hover:-translate-y-0.5',
      )}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ background: platform.bg }}
          >
            <PlatformIcon platform={platform.id} className="h-5 w-5" />
          </div>

          {isConnected ? (
            needsReauth ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Reconnect needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
              Coming Soon
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold">{platform.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{platform.description}</p>
        </div>

        {isConnected ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {connection.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={connection.avatarUrl} alt={connection.displayName ?? platform.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-foreground/60">
                  {(connection.displayName ?? connection.username ?? platform.name).slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {connection.displayName ?? connection.username ?? 'Connected'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {connection.email ?? (connection.username ? `@${connection.username}` : '—')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {platform.features.map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1 w-1 rounded-full shrink-0 bg-primary" />
                {feat}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {isConnected ? (
            <>
              {needsReauth ? (
                <Button
                  className="flex-1 text-xs"
                  onClick={connect}
                  disabled={busy}
                >
                  Reconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={connect}
                  disabled={busy}
                >
                  Refresh permissions
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={disconnect}
                disabled={busy}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              className="flex-1 text-xs"
              onClick={connect}
              disabled={!platform.available || busy}
            >
              {platform.available ? `Connect ${platform.name}` : 'Coming Soon'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
