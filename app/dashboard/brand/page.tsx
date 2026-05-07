'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────

interface VoiceSettings {
  formal: number        // 0 = casual, 100 = formal
  energy: number        // 0 = calm, 100 = electric
  depth: number         // 0 = surface, 100 = deep
  humor: number         // 0 = serious, 100 = playful
  niche: number         // 0 = broad appeal, 100 = niche
  archetypes: string[]
  rules: Record<string, boolean>
  name: string
  tagline: string
}

const DEFAULT_SETTINGS: VoiceSettings = {
  formal: 25,
  energy: 68,
  depth: 72,
  humor: 42,
  niche: 58,
  archetypes: ['The Educator', 'The Provocateur'],
  rules: {
    hooks: true,
    emojis: false,
    questions: true,
    bullets: false,
    short_sentences: true,
    data: false,
    stories: true,
  },
  name: 'My Brand Voice',
  tagline: 'Clear, direct, and worth reading',
}

// ── Archetypes ─────────────────────────────────────────────────────────────────

const ARCHETYPES = [
  {
    id: 'The Educator',
    icon: '📚',
    desc: 'You teach. Your content breaks down complex ideas and makes them accessible.',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  },
  {
    id: 'The Storyteller',
    icon: '📖',
    desc: 'You narrate. Personal anecdotes and case studies are your superpower.',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  },
  {
    id: 'The Provocateur',
    icon: '⚡',
    desc: 'You challenge. You take contrarian stances and make people think.',
    gradient: 'linear-gradient(135deg, #EA580C 0%, #EF4444 100%)',
  },
  {
    id: 'The Analyst',
    icon: '📊',
    desc: 'You dissect. Data, frameworks, and structured thinking define your POV.',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%)',
  },
  {
    id: 'The Creator',
    icon: '🎨',
    desc: 'You inspire. Creativity, craft, and the maker\'s journey run through everything.',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  },
  {
    id: 'The Friend',
    icon: '🤝',
    desc: 'You connect. Warm, direct, and real — like advice from someone who cares.',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)',
  },
  {
    id: 'The Expert',
    icon: '🎯',
    desc: 'You command authority. Years of experience translate into sharp, confident takes.',
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
  },
  {
    id: 'The Builder',
    icon: '🔧',
    desc: 'You show the work. Process, systems, and behind-the-scenes content is your core.',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
  },
]

// ── Writing Rules ──────────────────────────────────────────────────────────────

const RULES = [
  { id: 'hooks',           label: 'Always open with a hook',        icon: '🎣' },
  { id: 'emojis',          label: 'Use emojis freely',              icon: '✨' },
  { id: 'questions',       label: 'End with a question',            icon: '❓' },
  { id: 'bullets',         label: 'Use bullet lists',               icon: '•' },
  { id: 'short_sentences', label: 'Keep sentences short & punchy',  icon: '⚡' },
  { id: 'data',            label: 'Back claims with data / stats',  icon: '📊' },
  { id: 'stories',         label: 'Weave in personal stories',      icon: '📖' },
]

// ── Voice Dimensions ───────────────────────────────────────────────────────────

const DIMENSIONS = [
  { key: 'formal' as const,  low: 'Casual & Conversational', high: 'Formal & Professional', color: '#3B82F6' },
  { key: 'energy' as const,  low: 'Calm & Measured',         high: 'Electric & Urgent',      color: '#EA580C' },
  { key: 'depth'  as const,  low: 'Light & Accessible',      high: 'Deep & Analytical',      color: '#8B5CF6' },
  { key: 'humor'  as const,  low: 'Serious & Direct',        high: 'Playful & Witty',        color: '#F59E0B' },
  { key: 'niche'  as const,  low: 'Broad Appeal',            high: 'Deeply Niche',           color: '#22C55E' },
]

// ── Voice DNA bar ──────────────────────────────────────────────────────────────

function VoiceDNABar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Slider ─────────────────────────────────────────────────────────────────────

function VoiceSlider({
  dim,
  value,
  onChange,
}: {
  dim: (typeof DIMENSIONS)[number]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{dim.low}</span>
        <span
          className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
          style={{ background: `${dim.color}20`, color: dim.color }}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground text-right">{dim.high}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${dim.color} ${value}%, var(--muted) ${value}%)`,
        }}
      />
    </div>
  )
}

// ── Sample post generator ──────────────────────────────────────────────────────

function generateSamplePost(settings: VoiceSettings): string {
  const isFormed = settings.archetypes.length > 0
  const archetype = settings.archetypes[0] ?? 'The Educator'
  const isCasual = settings.formal < 40
  const isHighEnergy = settings.energy > 65
  const isDeep = settings.depth > 60
  const isPlayful = settings.humor > 55
  const hasHook = settings.rules.hooks
  const hasEmojis = settings.rules.emojis
  const hasQuestion = settings.rules.questions

  const hooks = {
    'The Educator':    'The thing nobody tells you about growing an audience:',
    'The Provocateur': 'Hot take: consistency is the worst advice in content.',
    'The Storyteller': 'Two years ago I had 47 followers. Here\'s what changed.',
    'The Analyst':     '3 data points that changed how I approach content strategy:',
    'The Creator':     'The best creative work I\'ve ever done came from constraints.',
    'The Friend':      'I\'m going to save you 18 months of trial and error right now.',
    'The Expert':      'After 10 years in this space, this is my honest take:',
    'The Builder':     'The system I use to go from idea to published post in 45 minutes:',
  }

  const bodies = {
    'The Educator':    isCasual
      ? `Most people focus on posting more often. That\'s not it.\n\nThe real unlock? Posting for a specific person — not for everyone.`
      : `Volume is rarely the limiting factor. Specificity and intentional targeting drive meaningful audience growth.`,
    'The Provocateur': isDeep
      ? `Consistency creates predictability. Predictability creates habit. But habit is the enemy of surprise — and surprise is what makes people share.`
      : `Posting every day doesn\'t build an audience. Having something worth saying does.`,
    'The Storyteller': `I posted the same type of content for 8 months and barely moved.\n\nOne shift changed everything: I stopped writing for \'everyone\' and started writing for one person — the version of me from 3 years ago.`,
    'The Analyst':     `1. Posts that open with a question get 2.1x more comments\n2. Hooks under 8 words outperform longer ones by 34%\n3. Posting Tuesday–Thursday sees 28% higher reach on average`,
    'The Creator':     isPlayful
      ? `I gave myself one rule: publish before it feels ready. Best thing I ever did. Turns out \'ready\' is just a disguise for fear.`
      : `The work that matters most rarely arrives perfect. It\'s shaped by iteration and the willingness to ship.`,
    'The Friend':      `Here\'s the real talk: you don\'t need a bigger audience. You need a more focused one. 500 people who genuinely care will take you further than 50,000 who barely remember your name.`,
    'The Expert':      `The brands winning on social right now all have one thing in common: a point of view. Not just information — a perspective people can either champion or push back on.`,
    'The Builder':     `1/ Write the idea (don\'t edit)\n2/ Record a voice note walking through it\n3/ Transcribe + cut to the essentials\n4/ Write the hook last\n5/ Schedule 24 hours in advance`,
  }

  const hook = hasHook ? (hooks[archetype as keyof typeof hooks] ?? hooks['The Educator']) : ''
  const body = bodies[archetype as keyof typeof bodies] ?? bodies['The Educator']
  const emoji = hasEmojis ? ' 🔥' : ''
  const question = hasQuestion ? '\n\nWhat\'s the one shift that\'s made the biggest difference for your content?' : ''
  const energy = isHighEnergy ? ' The gap is closing fast.' : ''

  return `${hook}${emoji}\n\n${body}${energy}${question}`
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function BrandVoicePage() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [samplePost, setSamplePost] = useState('')

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem('postpilot_brand_voice')
      if (raw) setSettings(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    setSamplePost(generateSamplePost(settings))
  }, [settings])

  const updateDimension = useCallback((key: keyof Pick<VoiceSettings, 'formal' | 'energy' | 'depth' | 'humor' | 'niche'>, v: number) => {
    setSettings((s) => ({ ...s, [key]: v }))
    setSaved(false)
  }, [])

  const toggleArchetype = useCallback((id: string) => {
    setSettings((s) => {
      const has = s.archetypes.includes(id)
      if (has) return { ...s, archetypes: s.archetypes.filter((a) => a !== id) }
      if (s.archetypes.length >= 3) {
        toast.info('Pick up to 3 archetypes')
        return s
      }
      return { ...s, archetypes: [...s.archetypes, id] }
    })
    setSaved(false)
  }, [])

  const toggleRule = useCallback((id: string) => {
    setSettings((s) => ({ ...s, rules: { ...s.rules, [id]: !s.rules[id] } }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('postpilot_brand_voice', JSON.stringify(settings))
      setSaved(true)
      toast.success('Brand voice saved', {
        description: 'Your AI will now write in this style across all features',
      })
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Save failed')
    }
  }, [settings])

  const primaryArchetype = ARCHETYPES.find((a) => a.id === settings.archetypes[0])

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Brand Voice Studio"
        description="Train your AI to write exactly like you"
        action={
          <Button
            onClick={handleSave}
            style={saved ? { background: '#22C55E', border: 'none' } : { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
          >
            {saved ? (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Voice Saved
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
                Save Voice
              </>
            )}
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-5">

          {/* ── Left: Configuration ────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Voice Identity */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-sm font-bold mb-4">Voice Identity</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Voice Name</label>
                  <input
                    value={settings.name}
                    onChange={(e) => { setSettings((s) => ({ ...s, name: e.target.value })); setSaved(false) }}
                    placeholder="My Brand Voice"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tagline / Essence</label>
                  <input
                    value={settings.tagline}
                    onChange={(e) => { setSettings((s) => ({ ...s, tagline: e.target.value })); setSaved(false) }}
                    placeholder="Clear, direct, and worth reading"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Voice Dimensions */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-sm font-bold mb-5">Voice Dimensions</h2>
              <div className="space-y-6">
                {DIMENSIONS.map((dim) => (
                  <VoiceSlider
                    key={dim.key}
                    dim={dim}
                    value={settings[dim.key]}
                    onChange={(v) => updateDimension(dim.key, v)}
                  />
                ))}
              </div>
            </div>

            {/* Archetypes */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold">Content Archetypes</h2>
                <span className="text-xs text-muted-foreground">Pick up to 3</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ARCHETYPES.map((arch) => {
                  const isSelected = settings.archetypes.includes(arch.id)
                  return (
                    <button
                      key={arch.id}
                      onClick={() => toggleArchetype(arch.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-200 border',
                        isSelected
                          ? 'border-transparent shadow-sm'
                          : 'border-border/60 hover:border-border hover:bg-muted/30'
                      )}
                      style={isSelected ? { background: `${arch.gradient.replace('linear-gradient(135deg, ', '').split(' ')[0]}15`, border: `1px solid ${arch.gradient.replace('linear-gradient(135deg, ', '').split(' ')[0]}40` } : undefined}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{arch.icon}</span>
                      <div className="min-w-0">
                        <p className={cn('text-xs font-bold leading-tight', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                          {arch.id}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{arch.desc}</p>
                      </div>
                      {isSelected && (
                        <div
                          className="ml-auto shrink-0 flex h-4 w-4 items-center justify-center rounded-full text-white"
                          style={{ background: arch.gradient }}
                        >
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Writing Rules */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-sm font-bold mb-4">Writing Rules</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {RULES.map((rule) => {
                  const isOn = settings.rules[rule.id] ?? false
                  return (
                    <button
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all border',
                        isOn
                          ? 'text-foreground'
                          : 'text-muted-foreground border-border/60 hover:bg-muted/30'
                      )}
                      style={isOn ? {
                        background: 'linear-gradient(135deg, #EA580C10 0%, #DB277710 100%)',
                        border: '1px solid #EA580C30',
                      } : undefined}
                    >
                      <span className="text-base">{rule.icon}</span>
                      <span className="text-xs">{rule.label}</span>
                      <div className={cn(
                        'ml-auto flex h-4 w-7 items-center rounded-full transition-all shrink-0',
                        isOn ? '' : 'bg-muted'
                      )}
                        style={isOn ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' } : undefined}
                      >
                        <div className={cn('h-3 w-3 rounded-full bg-white shadow-sm transition-transform mx-0.5', isOn ? 'translate-x-3' : 'translate-x-0')} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Preview & DNA ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Voice card */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
              style={{ background: primaryArchetype?.gradient ?? 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3), transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-2xl">
                    {primaryArchetype?.icon ?? '🎙️'}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{settings.name || 'My Brand Voice'}</p>
                    <p className="text-xs text-white/70">{settings.tagline || 'Define your essence'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {settings.archetypes.map((a) => (
                    <span key={a} className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                      {a}
                    </span>
                  ))}
                  {settings.archetypes.length === 0 && (
                    <span className="text-xs text-white/50">No archetypes selected</span>
                  )}
                </div>

                <div className="space-y-2">
                  {DIMENSIONS.map((dim) => (
                    <div key={dim.key} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/60 w-16 shrink-0">{settings[dim.key] < 50 ? dim.low.split(' ')[0] : dim.high.split(' ')[0]}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/20">
                        <div className="h-full rounded-full bg-white/70 transition-all duration-300" style={{ width: `${settings[dim.key]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice DNA */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-4">Voice DNA</h3>
              <div className="space-y-3">
                {DIMENSIONS.map((dim) => (
                  <VoiceDNABar
                    key={dim.key}
                    label={settings[dim.key] < 50 ? dim.low : dim.high}
                    value={settings[dim.key]}
                    color={dim.color}
                  />
                ))}
              </div>
            </div>

            {/* Sample Post Preview */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Live Preview</h3>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Updates as you edit
                </span>
              </div>
              <div
                className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line"
                style={{ background: 'oklch(0.97 0.006 68)', border: '1px solid oklch(0.93 0.008 68)' }}
              >
                {mounted ? samplePost : (
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 rounded animate-pulse bg-muted" />
                    <div className="h-3 w-full rounded animate-pulse bg-muted" />
                    <div className="h-3 w-5/6 rounded animate-pulse bg-muted" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                This is a preview — your actual AI output will be more refined.
              </p>
            </div>

            {/* Active rules summary */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold mb-3">Active Rules</h3>
              <div className="flex flex-wrap gap-1.5">
                {RULES.filter((r) => settings.rules[r.id]).map((r) => (
                  <span
                    key={r.id}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: 'linear-gradient(135deg, #EA580C12 0%, #DB277712 100%)', color: '#EA580C', border: '1px solid #EA580C25' }}
                  >
                    {r.icon} {r.label}
                  </span>
                ))}
                {RULES.filter((r) => settings.rules[r.id]).length === 0 && (
                  <p className="text-xs text-muted-foreground">No rules active — toggle some above</p>
                )}
              </div>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              className="w-full"
              style={saved ? { background: '#22C55E', border: 'none' } : { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
            >
              {saved ? '✓ Voice Saved — AI will use this style' : 'Save Brand Voice'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Saved voice applies to Create, Repurpose, and Auto-Pilot
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
