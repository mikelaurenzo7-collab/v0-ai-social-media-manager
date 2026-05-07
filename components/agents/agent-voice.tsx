'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Agent } from '@/lib/agents'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AgentVoiceSettings {
  formal: number
  energy: number
  depth: number
  humor: number
  niche: number
  archetypes: string[]
  rules: Record<string, boolean>
  tagline: string
}

const AGENT_DEFAULTS: Record<string, AgentVoiceSettings> = {
  strategist: {
    formal: 60, energy: 55, depth: 80, humor: 20, niche: 65,
    archetypes: ['The Analyst', 'The Expert'],
    rules: { hooks: true, emojis: false, questions: true, bullets: true, short_sentences: false, data: true, stories: false },
    tagline: 'Sharp, data-backed, built to earn attention on LinkedIn',
  },
  viral: {
    formal: 10, energy: 95, depth: 35, humor: 70, niche: 45,
    archetypes: ['The Provocateur', 'The Creator'],
    rules: { hooks: true, emojis: true, questions: false, bullets: false, short_sentences: true, data: false, stories: true },
    tagline: 'Loud hooks, zero fluff — built to stop the scroll',
  },
  voice: {
    formal: 20, energy: 50, depth: 75, humor: 40, niche: 55,
    archetypes: ['The Storyteller', 'The Friend'],
    rules: { hooks: true, emojis: false, questions: true, bullets: false, short_sentences: true, data: false, stories: true },
    tagline: 'Authentic, personal, and impossible to ignore on Twitter',
  },
  community: {
    formal: 15, energy: 70, depth: 45, humor: 60, niche: 40,
    archetypes: ['The Friend', 'The Creator'],
    rules: { hooks: true, emojis: true, questions: true, bullets: false, short_sentences: true, data: false, stories: true },
    tagline: 'Warm, inviting, and designed to spark conversations',
  },
}

const DIMENSIONS = [
  { key: 'formal' as const, low: 'Casual',     high: 'Formal',     color: '#3B82F6' },
  { key: 'energy' as const, low: 'Measured',   high: 'Electric',   color: '#EA580C' },
  { key: 'depth'  as const, low: 'Accessible', high: 'Deep',       color: '#8B5CF6' },
  { key: 'humor'  as const, low: 'Serious',    high: 'Playful',    color: '#F59E0B' },
  { key: 'niche'  as const, low: 'Broad',      high: 'Niche',      color: '#22C55E' },
]

const ARCHETYPES = [
  { id: 'The Educator',    icon: '📚', color: '#3B82F6' },
  { id: 'The Storyteller', icon: '📖', color: '#A855F7' },
  { id: 'The Provocateur', icon: '⚡', color: '#EA580C' },
  { id: 'The Analyst',     icon: '📊', color: '#0EA5E9' },
  { id: 'The Creator',     icon: '🎨', color: '#F59E0B' },
  { id: 'The Friend',      icon: '🤝', color: '#22C55E' },
  { id: 'The Expert',      icon: '🎯', color: '#1D4ED8' },
  { id: 'The Builder',     icon: '🔧', color: '#6B7280' },
]

const RULES = [
  { id: 'hooks',           label: 'Open with a hook',         icon: '🎣' },
  { id: 'emojis',          label: 'Use emojis',               icon: '✨' },
  { id: 'questions',       label: 'End with a question',      icon: '❓' },
  { id: 'bullets',         label: 'Use bullet lists',         icon: '•' },
  { id: 'short_sentences', label: 'Short, punchy sentences',  icon: '⚡' },
  { id: 'data',            label: 'Back claims with data',    icon: '📊' },
  { id: 'stories',         label: 'Weave in personal stories', icon: '📖' },
]

function storageKey(agentId: string) {
  return `postpilot_voice_${agentId}`
}

export function getAgentVoice(agentId: string): AgentVoiceSettings | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(agentId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Voice preview generator ────────────────────────────────────────────────────

function makePreview(settings: AgentVoiceSettings, agentName: string): string {
  const arch = settings.archetypes[0] ?? 'The Educator'
  const hooks: Record<string, string> = {
    'The Educator':    'The thing nobody tells you about growing an audience:',
    'The Provocateur': 'Unpopular opinion: consistency is overrated.',
    'The Storyteller': 'Three years ago I was about to quit. Here\'s what changed.',
    'The Analyst':     '3 stats that changed how I think about content:',
    'The Creator':     'The best work I\'ve ever done came from constraints.',
    'The Friend':      'Let me save you 18 months of trial and error right now.',
    'The Expert':      'After years in this space, here\'s my unfiltered take:',
    'The Builder':     'My exact system for going from idea to published post:',
  }
  const bodies: Record<string, string> = {
    'The Educator':    settings.formal > 50
      ? 'Specificity in targeting outperforms volume in content production metrics consistently.'
      : 'Most people post more. The real unlock? Write for one specific person.',
    'The Provocateur': settings.energy > 70
      ? 'Showing up every day doesn\'t build an audience. Having something worth saying does. Full stop.'
      : 'Volume creates habits. But habit is the enemy of surprise — and surprise is what makes people share.',
    'The Storyteller': 'I posted the same type of content for 8 months and barely moved. One shift changed everything: I stopped writing for \'everyone.\'',
    'The Analyst':     '1. Hooks under 8 words outperform longer ones 34% of the time\n2. Posts with questions get 2x more comments\n3. Tuesday–Thursday sees 28% higher reach',
    'The Creator':     settings.humor > 50
      ? 'I gave myself one rule: publish before it feels ready. Turns out \'ready\' is just fear in a trench coat.'
      : 'The work that matters most rarely arrives polished. It\'s shaped by iteration and the courage to ship.',
    'The Friend':      'Real talk: you don\'t need a bigger audience. You need a more focused one.',
    'The Expert':      'The brands winning on social right now all have one thing in common: a point of view.',
    'The Builder':     '1/ Write the idea (don\'t edit)\n2/ Cut to essentials\n3/ Write the hook last\n4/ Schedule 24hrs out',
  }
  const hook = settings.rules.hooks ? (hooks[arch] ?? hooks['The Educator']) : ''
  const body = bodies[arch] ?? bodies['The Educator']
  const emoji = settings.rules.emojis ? ' 🔥' : ''
  const question = settings.rules.questions ? '\n\nWhat\'s been the biggest shift in your content approach?' : ''
  return `${hook}${emoji}\n\n${body}${question}`
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AgentVoice({ agent }: { agent: Agent }) {
  const defaultSettings = AGENT_DEFAULTS[agent.id] ?? AGENT_DEFAULTS.strategist
  const [settings, setSettings] = useState<AgentVoiceSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getAgentVoice(agent.id)
    if (stored) setSettings(stored)
  }, [agent.id])

  const update = useCallback(<K extends keyof AgentVoiceSettings>(key: K, value: AgentVoiceSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
    setSaved(false)
  }, [])

  const toggleArchetype = useCallback((id: string) => {
    setSettings((s) => {
      if (s.archetypes.includes(id)) return { ...s, archetypes: s.archetypes.filter((a) => a !== id) }
      if (s.archetypes.length >= 3) { toast.info('Max 3 archetypes'); return s }
      return { ...s, archetypes: [...s.archetypes, id] }
    })
    setSaved(false)
  }, [])

  const toggleRule = useCallback((id: string) => {
    setSettings((s) => ({ ...s, rules: { ...s.rules, [id]: !s.rules[id] } }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    localStorage.setItem(storageKey(agent.id), JSON.stringify(settings))
    // Also update global voice key for Repurpose Engine (use last-saved agent voice)
    localStorage.setItem('postpilot_brand_voice', JSON.stringify(settings))
    setSaved(true)
    toast.success(`${agent.name} voice saved`, {
      description: 'Auto-Pilot and Repurpose Engine will use this style',
    })
    setTimeout(() => setSaved(false), 3000)
  }, [agent.id, agent.name, settings])

  const preview = mounted ? makePreview(settings, agent.name) : ''

  return (
    <div className="grid gap-6 lg:grid-cols-5">

      {/* ── Left: Config ────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Tagline */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Voice Tagline</label>
          <input
            value={settings.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            placeholder="How this agent's writing should feel…"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Sliders */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Voice Dimensions</p>
          <div className="space-y-5">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{settings[dim.key] < 50 ? dim.low : dim.high}</span>
                  <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                    style={{ background: `${dim.color}20`, color: dim.color }}>
                    {settings[dim.key]}
                  </span>
                </div>
                <input
                  type="range" min={0} max={100}
                  value={settings[dim.key]}
                  onChange={(e) => update(dim.key, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${dim.color} ${settings[dim.key]}%, var(--muted) ${settings[dim.key]}%)` }}
                />
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground/60">{dim.low}</span>
                  <span className="text-[10px] text-muted-foreground/60">{dim.high}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Archetypes */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Archetypes</p>
            <span className="text-[10px] text-muted-foreground">Up to 3</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ARCHETYPES.map((arch) => {
              const on = settings.archetypes.includes(arch.id)
              return (
                <button key={arch.id} onClick={() => toggleArchetype(arch.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all border',
                    on ? 'text-foreground' : 'text-muted-foreground border-border/60 hover:bg-muted/30'
                  )}
                  style={on ? { background: `${arch.color}15`, border: `1px solid ${arch.color}35` } : undefined}
                >
                  <span className="text-sm">{arch.icon}</span>
                  <span className="truncate">{arch.id}</span>
                  {on && (
                    <div className="ml-auto flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: arch.color }}>
                      <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rules */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Writing Rules</p>
          <div className="grid grid-cols-2 gap-2">
            {RULES.map((rule) => {
              const on = settings.rules[rule.id] ?? false
              return (
                <button key={rule.id} onClick={() => toggleRule(rule.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all border',
                    on ? 'text-foreground' : 'text-muted-foreground border-border/60 hover:bg-muted/30'
                  )}
                  style={on ? { background: 'linear-gradient(135deg, #EA580C0F 0%, #DB27770F 100%)', border: '1px solid #EA580C25' } : undefined}
                >
                  <span>{rule.icon}</span>
                  <span className="truncate">{rule.label}</span>
                  <div className={cn('ml-auto flex h-4 w-7 shrink-0 items-center rounded-full transition-all', on ? '' : 'bg-muted')}
                    style={on ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' } : undefined}>
                    <div className={cn('h-3 w-3 rounded-full bg-white shadow-sm transition-transform mx-0.5', on ? 'translate-x-3' : '')} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Right: Preview ───────────────────────────────── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Voice fingerprint */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Voice DNA</p>
          <div className="space-y-2.5">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{settings[dim.key] < 50 ? dim.low : dim.high}</span>
                  <span className="font-bold tabular-nums" style={{ color: dim.color }}>{settings[dim.key]}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${settings[dim.key]}%`, background: dim.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Preview</p>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Updates live</span>
          </div>
          <div className="rounded-lg p-3 text-sm leading-relaxed whitespace-pre-line text-foreground/80"
            style={{ background: 'oklch(0.97 0.006 68)', border: '1px solid oklch(0.93 0.008 68)' }}>
            {mounted ? preview : <div className="space-y-1.5">
              {[3, 4, 2].map((w, i) => (
                <div key={i} className="h-3 rounded animate-pulse bg-muted" style={{ width: `${w * 25}%` }} />
              ))}
            </div>}
          </div>
        </div>

        {/* Active archetypes */}
        {settings.archetypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {settings.archetypes.map((a) => {
              const arch = ARCHETYPES.find((x) => x.id === a)
              return (
                <span key={a} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: `${arch?.color ?? '#EA580C'}18`, color: arch?.color ?? '#EA580C', border: `1px solid ${arch?.color ?? '#EA580C'}30` }}>
                  {arch?.icon} {a}
                </span>
              )
            })}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={saved
            ? { background: '#22C55E' }
            : { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
        >
          {saved ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Voice Saved
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save {agent.name} Voice
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          This voice applies when {agent.name} generates content in Auto-Pilot and Repurpose
        </p>
      </div>
    </div>
  )
}
