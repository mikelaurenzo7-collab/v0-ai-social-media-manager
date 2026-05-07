'use client'

import { useEffect, useState } from 'react'
import type { Agent } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AGENT_CUSTOMIZATION_KEY } from '@/lib/agent-customization'

interface AgentCustomization {
  displayName: string
  avatar: string
  tagline: string
  systemPrompt: string
  voicePreset: string
  responseStyle: 'concise' | 'balanced' | 'detailed'
  signOff: string
  emojiUse: 'never' | 'rare' | 'often'
}

const VOICE_PRESETS = [
  { id: 'brand', label: 'Match Brand Kit', desc: 'Use the workspace voice fingerprint' },
  { id: 'witty', label: 'Witty', desc: 'Clever, playful, sharp' },
  { id: 'professional', label: 'Professional', desc: 'Polished, business-appropriate' },
  { id: 'bold', label: 'Bold', desc: 'Confident, direct, no hedging' },
  { id: 'warm', label: 'Warm', desc: 'Personal, empathetic, human' },
] as const

export function AgentCustomize({ agent }: { agent: Agent }) {
  // Note: keyed only by agent id today. When workspace-scoped persistence
  // ships, switch to AGENT_CUSTOMIZATION_KEY(`${workspaceId}:${agent.id}`).
  const storageKey = AGENT_CUSTOMIZATION_KEY(agent.id)

  const defaults: AgentCustomization = {
    displayName: agent.name,
    avatar: agent.avatar,
    tagline: agent.role,
    systemPrompt: agent.systemPrompt,
    voicePreset: 'brand',
    responseStyle: 'balanced',
    signOff: '',
    emojiUse: 'rare',
  }

  const [c, setC] = useState<AgentCustomization>(defaults)
  const [dirty, setDirty] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AgentCustomization>
        setC({ ...defaults, ...parsed })
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id])

  function update<K extends keyof AgentCustomization>(key: K, value: AgentCustomization[K]) {
    setC((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(c))
      toast.success(`${c.displayName || agent.name} saved`)
      setDirty(false)
    } catch {
      toast.error('Could not save — local storage blocked')
    }
  }

  function reset() {
    setC(defaults)
    setDirty(true)
    toast.message('Reverted to defaults', { description: 'Click Save to commit, or navigate away to discard.' })
  }

  if (!mounted) return null

  const promptCharCount = c.systemPrompt.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Customize {agent.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rewrite the persona, voice, and instructions. Sent with every chat request.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to default
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty}
            style={dirty ? { background: 'var(--brand-gradient)' } : undefined}
          >
            {dirty ? 'Save changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
          <CardDescription>How this agent appears in your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md"
              style={{ background: 'var(--brand-gradient)' }}
              aria-label="Avatar preview"
            >
              {c.avatar.slice(0, 3) || '?'}
            </div>
            <div className="flex-1 grid gap-3 sm:grid-cols-[2fr_1fr]">
              <div>
                <Label htmlFor="agent-name" className="text-xs">Display name</Label>
                <Input
                  id="agent-name"
                  value={c.displayName}
                  onChange={(e) => update('displayName', e.target.value)}
                  placeholder={agent.name}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="agent-avatar" className="text-xs">Avatar (1–3 chars)</Label>
                <Input
                  id="agent-avatar"
                  value={c.avatar}
                  onChange={(e) => update('avatar', e.target.value.slice(0, 3))}
                  maxLength={3}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="agent-tagline" className="text-xs">Role / tagline</Label>
            <Input
              id="agent-tagline"
              value={c.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              placeholder={agent.role}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Shown under the agent name across the app.</p>
          </div>
        </CardContent>
      </Card>

      {/* Voice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice preset</CardTitle>
          <CardDescription>Layered on top of the workspace Brand Kit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {VOICE_PRESETS.map((p) => {
              const selected = c.voicePreset === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update('voicePreset', p.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    selected
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-border/60 bg-card hover:border-border',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold">{p.label}</p>
                    {selected && (
                      <Badge className="text-[9px] px-1.5 py-0 bg-orange-500 text-white border-orange-500">
                        On
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Response style</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border border-border/60 p-1">
                {(['concise', 'balanced', 'detailed'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={c.responseStyle === s}
                    onClick={() => update('responseStyle', s)}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-semibold capitalize transition-colors',
                      c.responseStyle === s
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Emoji use</Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border border-border/60 p-1">
                {(['never', 'rare', 'often'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={c.emojiUse === s}
                    onClick={() => update('emojiUse', s)}
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-semibold capitalize transition-colors',
                      c.emojiUse === s
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Label htmlFor="agent-signoff" className="text-xs">Default sign-off (optional)</Label>
            <Input
              id="agent-signoff"
              value={c.signOff}
              onChange={(e) => update('signOff', e.target.value)}
              placeholder="— Built with care from a tiny team"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* System prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">System prompt</CardTitle>
              <CardDescription>The instructions {c.displayName || agent.name} follows on every turn.</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {promptCharCount} chars
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={c.systemPrompt}
            onChange={(e) => update('systemPrompt', e.target.value)}
            rows={14}
            className="font-mono text-[13px] leading-relaxed"
            aria-label="Agent system prompt"
          />
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2">
            <span className="text-base">⚠</span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Custom system prompts override the platform-tuned defaults. Brand Kit rules (do/don&apos;t) are still
              enforced separately and cannot be bypassed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
