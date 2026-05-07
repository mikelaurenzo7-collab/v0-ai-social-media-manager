'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'profile', title: 'About you', desc: 'Quick context so we tune the AI to you' },
  { id: 'goals', title: 'Your goals', desc: 'What does success look like?' },
  { id: 'voice', title: 'Voice', desc: 'Paste anything you\'ve written that sounds like you' },
  { id: 'connect', title: 'Connect', desc: 'Hook up your channels (skip if testing)' },
  { id: 'done', title: 'Ready', desc: 'Your AI co-pilot is ready' },
]

const GOALS = [
  { id: 'growth', label: 'Grow my audience', emoji: '📈' },
  { id: 'leads', label: 'Generate leads', emoji: '🎯' },
  { id: 'authority', label: 'Build authority', emoji: '👑' },
  { id: 'community', label: 'Engage my community', emoji: '💬' },
  { id: 'sales', label: 'Drive sales', emoji: '💰' },
  { id: 'recruit', label: 'Recruit talent', emoji: '🤝' },
]

const ROLES = [
  'Founder / CEO',
  'Marketer',
  'Creator',
  'Agency owner',
  'Salesperson',
  'Other',
]

const PLATFORMS_LIST = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'gmail', 'outlook'] as const

export default function WelcomePage() {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(0)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [niche, setNiche] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [voice, setVoice] = useState('')
  const [connected, setConnected] = useState<string[]>([])

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1
  const canNext = (() => {
    if (stepIdx === 0) return name.trim() && role
    if (stepIdx === 1) return goals.length > 0
    return true
  })()

  function next() {
    if (isLast) {
      router.push('/dashboard')
      return
    }
    setStepIdx((s) => Math.min(STEPS.length - 1, s + 1))
  }

  function toggleGoal(id: string) {
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
  }

  function toggleConnect(p: string) {
    setConnected((c) => (c.includes(p) ? c.filter((x) => x !== p) : [...c, p]))
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, oklch(0.99 0.005 60), oklch(0.97 0.025 50))' }}>
      {/* Top bar */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Logo size={28} wordmark />
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Skip setup →
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                i < stepIdx
                  ? 'bg-orange-500'
                  : i === stepIdx
                    ? 'bg-orange-500/60'
                    : 'bg-muted',
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Step {stepIdx + 1} of {STEPS.length}</span>
          <span>{step.title}</span>
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <Card className="w-full max-w-2xl shadow-xl border-border/40">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{step.title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
            </div>

            {step.id === 'profile' && (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs">What should we call you?</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Demi" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">What do you do?</Label>
                  <div className="mt-1.5 grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all',
                          role === r
                            ? 'border-orange-500 bg-orange-500/10 text-foreground'
                            : 'border-border/60 hover:border-border bg-card',
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">What&apos;s your niche or industry? <span className="text-muted-foreground/70">(optional but helpful)</span></Label>
                  <Input
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. dev tools, indie creator economy, sustainable fashion…"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {step.id === 'goals' && (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                {GOALS.map((g) => {
                  const selected = goals.includes(g.id)
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGoal(g.id)}
                      className={cn(
                        'rounded-2xl border p-5 text-left transition-all',
                        selected
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-border/60 bg-card hover:border-border',
                      )}
                    >
                      <div className="text-3xl mb-2">{g.emoji}</div>
                      <p className="text-sm font-bold">{g.label}</p>
                      {selected && (
                        <Badge className="mt-2 text-[9px] bg-orange-500 text-white">Selected</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {step.id === 'voice' && (
              <div className="space-y-4">
                <Textarea
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Paste a recent post, an email you sent, a section of a blog. The AI will pick up your rhythm, vocabulary, and tone."
                  rows={9}
                />
                <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4 flex items-start gap-3">
                  <span className="text-xl shrink-0">💡</span>
                  <div>
                    <p className="text-sm font-semibold">Don&apos;t have anything to paste?</p>
                    <p className="text-xs text-muted-foreground mt-1">No problem. We&apos;ll start with general best practices and refine your voice from your first few posts.</p>
                  </div>
                </div>
              </div>
            )}

            {step.id === 'connect' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Tap a platform to start the OAuth flow. You can do this later from <strong>Accounts</strong>.
                </p>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                  {PLATFORMS_LIST.map((p) => {
                    const isConnected = connected.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => toggleConnect(p)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-3 transition-all text-left',
                          isConnected ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/60 hover:border-border bg-card',
                        )}
                      >
                        <PlatformIcon platform={p} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold capitalize truncate">
                            {p === 'twitter' ? 'X' : p}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{isConnected ? '✓ Connected' : 'Not connected'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step.id === 'done' && (
              <div className="text-center py-4">
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  ✨
                </div>
                <h2 className="text-2xl font-black">You&apos;re all set{name ? `, ${name}` : ''}.</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Your AI agents are warming up. We&apos;ve drafted 3 starter posts based on your voice — let&apos;s open them.
                </p>
                <div className="mt-6 grid gap-2 max-w-sm mx-auto text-left">
                  {[
                    voice.trim()
                      ? 'Voice trained on your sample'
                      : 'Voice: starting from best-practice defaults',
                    `${goals.length} goal${goals.length === 1 ? '' : 's'} locked in`,
                    `${connected.length} platform${connected.length === 1 ? '' : 's'} connected`,
                    '6 specialist agents online',
                  ].map((line) => (
                    <div key={line} className="flex items-center gap-2 text-xs">
                      <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-muted-foreground">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer nav */}
            <div className="mt-8 flex items-center justify-between gap-3 pt-5 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                disabled={stepIdx === 0}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={next}
                disabled={!canNext}
                className="px-6"
                style={{ background: 'var(--brand-gradient)' }}
              >
                {isLast ? 'Open dashboard →' : 'Continue →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
