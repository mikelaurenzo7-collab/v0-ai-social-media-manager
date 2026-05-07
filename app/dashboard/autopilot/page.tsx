'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// ── Types ──────────────────────────────────────────────────────────────────────

type PlatformId = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook'
type FeedType = 'published' | 'generating' | 'scheduled' | 'analyzing' | 'success'

interface Automation {
  id: string
  name: string
  agentId: string
  agentAvatar: string
  agentColor: string
  platform: PlatformId
  schedule: string
  topic: string
  active: boolean
  postsPublished: number
  lastRan: string
  nextRun: string
  engagementAvg: number
}

interface FeedItem {
  id: string
  type: FeedType
  message: string
  agent: string
  platform?: PlatformId
  ts: Date
}

// ── Static data ────────────────────────────────────────────────────────────────

const PLATFORM_CFG: Record<PlatformId, { label: string; color: string; bg: string; text: string }> = {
  twitter:   { label: 'X/Twitter', color: '#1D9BF0', bg: '#EFF9FF', text: '#1D9BF0' },
  instagram: { label: 'Instagram', color: '#E1306C', bg: '#FFF0F6', text: '#E1306C' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', bg: '#EFF6FF', text: '#0A66C2' },
  tiktok:    { label: 'TikTok',    color: '#6366F1', bg: '#F0F0FF', text: '#6366F1' },
  facebook:  { label: 'Facebook',  color: '#1877F2', bg: '#EEF2FF', text: '#1877F2' },
}

const SEED_AUTOMATIONS: Automation[] = [
  {
    id: 'a1',
    name: 'Daily LinkedIn Thought Leadership',
    agentId: 'strategist',
    agentAvatar: '🎯',
    agentColor: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
    platform: 'linkedin',
    schedule: 'Mon–Fri · 8:30 AM',
    topic: 'creator economy, content strategy, growth mindset',
    active: true,
    postsPublished: 47,
    lastRan: '2 hours ago',
    nextRun: 'Tomorrow 8:30 AM',
    engagementAvg: 5.8,
  },
  {
    id: 'a2',
    name: 'TikTok Hook Machine',
    agentId: 'viral',
    agentAvatar: '⚡',
    agentColor: 'linear-gradient(135deg, #EA580C 0%, #EAB308 100%)',
    platform: 'tiktok',
    schedule: 'Mon, Wed, Fri · 5:00 PM',
    topic: 'viral hooks, productivity, mindset shifts',
    active: true,
    postsPublished: 28,
    lastRan: '45 minutes ago',
    nextRun: 'Today 5:00 PM',
    engagementAvg: 11.4,
  },
  {
    id: 'a3',
    name: 'Weekly Twitter Thread',
    agentId: 'voice',
    agentAvatar: '🎙️',
    agentColor: 'linear-gradient(135deg, #A855F7 0%, #DB2777 100%)',
    platform: 'twitter',
    schedule: 'Sundays · 10:00 AM',
    topic: 'deep dives, long-form insights, personal stories',
    active: false,
    postsPublished: 12,
    lastRan: '6 days ago',
    nextRun: 'Sunday 10:00 AM',
    engagementAvg: 7.2,
  },
  {
    id: 'a4',
    name: 'Instagram Story + Caption',
    agentId: 'community',
    agentAvatar: '🤝',
    agentColor: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)',
    platform: 'instagram',
    schedule: 'Daily · 12:00 PM',
    topic: 'community building, audience engagement, user stories',
    active: true,
    postsPublished: 63,
    lastRan: '3 hours ago',
    nextRun: 'Today 12:00 PM',
    engagementAvg: 8.9,
  },
]

const FEED_POOL: Omit<FeedItem, 'id' | 'ts'>[] = [
  { type: 'analyzing', agent: 'Viral Agent',       message: 'Scanning TikTok trending topics for high-velocity hooks…',              platform: 'tiktok' },
  { type: 'generating', agent: 'Viral Agent',      message: 'Drafting hook: "Stop optimizing for reach. Do this instead:"',          platform: 'tiktok' },
  { type: 'success',   agent: 'Viral Agent',       message: 'Hook scored 9.2/10 — queued for 5:00 PM today',                         platform: 'tiktok' },
  { type: 'analyzing', agent: 'Strategist Agent',  message: 'Checking LinkedIn engagement window for optimal post time…',            platform: 'linkedin' },
  { type: 'generating', agent: 'Strategist Agent', message: 'Drafting LinkedIn post on "The creator plateau problem"',               platform: 'linkedin' },
  { type: 'scheduled', agent: 'Strategist Agent',  message: 'Scheduled to LinkedIn · Tomorrow 8:30 AM',                             platform: 'linkedin' },
  { type: 'published', agent: 'Community Agent',   message: 'Published to Instagram · "The real reason your engagement is dropping"', platform: 'instagram' },
  { type: 'analyzing', agent: 'Voice Coach',       message: 'Analyzing top-performing threads from the past 30 days…',              platform: 'twitter' },
  { type: 'generating', agent: 'Voice Coach',      message: 'Writing Sunday thread: "7 rules I follow that most creators ignore"',  platform: 'twitter' },
  { type: 'success',   agent: 'Community Agent',   message: 'Instagram caption optimized · Engagement score: 8.1/10',               platform: 'instagram' },
  { type: 'published', agent: 'Strategist Agent',  message: 'Published to LinkedIn · "Building in public is the most underrated growth strategy"', platform: 'linkedin' },
  { type: 'analyzing', agent: 'Viral Agent',       message: 'Running virality analysis on scheduled TikTok content…',              platform: 'tiktok' },
  { type: 'scheduled', agent: 'Community Agent',   message: 'Scheduled Instagram post · This Friday 6:00 PM (peak window)',         platform: 'instagram' },
  { type: 'generating', agent: 'Strategist Agent', message: 'Adapting top LinkedIn post for Twitter thread format…',                platform: 'twitter' },
  { type: 'published', agent: 'Viral Agent',       message: 'Published to TikTok · Reached 8,400 in first 2 hours',                platform: 'tiktok' },
]

const AGENT_STATUS = [
  { id: 'viral',      name: 'Viral Agent',       avatar: '⚡', color: 'linear-gradient(135deg, #EA580C 0%, #EAB308 100%)', status: 'active', lastRan: '45 min ago',  nextRun: 'Today 5:00 PM', postsWeek: 6 },
  { id: 'strategist', name: 'Strategist Agent',  avatar: '🎯', color: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', status: 'active', lastRan: '2 hrs ago',   nextRun: 'Tomorrow 8:30 AM', postsWeek: 5 },
  { id: 'community',  name: 'Community Agent',   avatar: '🤝', color: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)', status: 'active', lastRan: '3 hrs ago',   nextRun: 'Today 12:00 PM', postsWeek: 7 },
  { id: 'voice',      name: 'Voice Coach',       avatar: '🎙️', color: 'linear-gradient(135deg, #A855F7 0%, #DB2777 100%)', status: 'idle',   lastRan: '6 days ago',  nextRun: 'Sunday 10:00 AM', postsWeek: 1 },
]

// ── Feed item component ────────────────────────────────────────────────────────

const FEED_ICONS: Record<FeedType, React.ReactNode> = {
  published: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  generating: (
    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  scheduled: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  analyzing: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  ),
  success: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
}

const FEED_COLORS: Record<FeedType, { icon: string; bg: string; border: string }> = {
  published:  { icon: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
  generating: { icon: '#EA580C', bg: '#FFF8F5', border: '#FDDCCA' },
  scheduled:  { icon: '#6366F1', bg: '#F5F3FF', border: '#DDD6FE' },
  analyzing:  { icon: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD' },
  success:    { icon: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8' },
}

function relativeTime(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 5)  return 'just now'
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

// ── Create Automation Modal ────────────────────────────────────────────────────

function CreateAutomationModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Automation) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('twitter')
  const [topic, setTopic] = useState('')
  const [scheduleType, setScheduleType] = useState<'daily' | '3x' | 'weekly'>('daily')
  const [time, setTime] = useState('09:00')
  const [isCreating, setIsCreating] = useState(false)

  const agentOptions = [
    { id: 'viral',      name: 'Viral Agent',      avatar: '⚡', desc: 'Hooks, virality, TikTok',   color: 'linear-gradient(135deg, #EA580C 0%, #EAB308 100%)' },
    { id: 'strategist', name: 'Strategist Agent', avatar: '🎯', desc: 'LinkedIn, thought leadership', color: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
    { id: 'community',  name: 'Community Agent',  avatar: '🤝', desc: 'Engagement, Instagram',      color: 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)' },
    { id: 'voice',      name: 'Voice Coach',      avatar: '🎙️', desc: 'Threads, long-form, Twitter', color: 'linear-gradient(135deg, #A855F7 0%, #DB2777 100%)' },
  ]

  const scheduleLabels = { daily: 'Daily', '3x': 'Mon · Wed · Fri', weekly: 'Weekly (Sundays)' }

  const handleCreate = async () => {
    setIsCreating(true)
    await new Promise((r) => setTimeout(r, 1200))
    const agent = agentOptions.find((a) => a.id === selectedAgent)!
    const newAuto: Automation = {
      id: `auto-${Date.now()}`,
      name: `${scheduleLabels[scheduleType]} ${PLATFORM_CFG[selectedPlatform].label} ${topic ? `— ${topic.slice(0, 20)}` : ''}`,
      agentId: selectedAgent,
      agentAvatar: agent.avatar,
      agentColor: agent.color,
      platform: selectedPlatform,
      schedule: `${scheduleLabels[scheduleType]} · ${time}`,
      topic,
      active: true,
      postsPublished: 0,
      lastRan: 'Never',
      nextRun: 'Next scheduled run',
      engagementAvg: 0,
    }
    onCreated(newAuto)
    toast.success('Automation created!', { description: 'Your agent will start posting on schedule.' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, oklch(0.652 0.214 36 / 0.08) 0%, transparent 100%)', borderBottom: '1px solid hsl(var(--border))' }}
        >
          <div>
            <h2 className="text-sm font-bold">Create Automation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%`, background: 'linear-gradient(90deg, #EA580C, #DB2777)' }}
          />
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1: Choose Agent */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose your AI agent</p>
              <div className="grid grid-cols-2 gap-2">
                {agentOptions.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
                      selectedAgent === agent.id
                        ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-400'
                        : 'border-border/60 hover:border-border'
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: agent.color }}>
                      {agent.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Platform + Topic */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Platform</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PLATFORM_CFG) as PlatformId[]).map((p) => {
                    const cfg = PLATFORM_CFG[p]
                    const active = selectedPlatform === p
                    return (
                      <button
                        key={p}
                        onClick={() => setSelectedPlatform(p)}
                        className={cn('rounded-full border px-3 py-1 text-xs font-bold transition-all', active ? 'text-white border-transparent' : 'border-border text-muted-foreground')}
                        style={active ? { background: cfg.color } : {}}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Theme (optional)</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. productivity, creator economy, SaaS growth, personal branding…"
                  className="w-full resize-none rounded-xl border bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-300/50 min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Frequency</p>
                <div className="space-y-2">
                  {(['daily', '3x', 'weekly'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScheduleType(s)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                        scheduleType === s ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-400' : 'border-border/60 hover:border-border'
                      )}
                    >
                      <span className={cn('flex h-4 w-4 shrink-0 rounded-full border-2', scheduleType === s ? 'border-orange-500' : 'border-border')}>
                        {scheduleType === s && <span className="m-auto h-2 w-2 rounded-full bg-orange-500" />}
                      </span>
                      <div>
                        <p className="text-xs font-bold">{scheduleLabels[s]}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {s === 'daily' ? '7 posts/week' : s === '3x' ? '3 posts/week' : '1 post/week'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Posting time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5 gap-3">
          <Button variant="outline" size="sm" onClick={() => step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : onClose()}>
            {step === 1 ? 'Cancel' : '← Back'}
          </Button>
          {step < 3 ? (
            <Button
              size="sm"
              disabled={step === 1 && !selectedAgent}
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              Continue →
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isCreating}
              onClick={handleCreate}
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              {isCreating ? (
                <>
                  <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating…
                </>
              ) : '🚀 Launch Automation'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AutoPilotPage() {
  const [autopilotOn, setAutopilotOn] = useState(true)
  const [automations, setAutomations] = useState<Automation[]>(SEED_AUTOMATIONS)
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    FEED_POOL.slice(0, 5).map((f, i) => ({
      ...f,
      id: `init-${i}`,
      ts: new Date(Date.now() - (4 - i) * 90_000),
    }))
  )
  const [showCreateModal, setShowCreateModal] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const feedIndex = useRef(5)

  // Simulate live feed
  useEffect(() => {
    if (!autopilotOn) return
    const interval = setInterval(() => {
      const next = FEED_POOL[feedIndex.current % FEED_POOL.length]
      feedIndex.current += 1
      setFeed((prev) => [
        { ...next, id: `live-${Date.now()}`, ts: new Date() },
        ...prev.slice(0, 19),
      ])
    }, 7000 + Math.random() * 5000)
    return () => clearInterval(interval)
  }, [autopilotOn])

  // Auto-scroll feed to top when new item arrives
  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [feed.length])

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    )
  }, [])

  const deleteAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id))
    toast.success('Automation removed')
  }, [])

  const activeCount = automations.filter((a) => a.active).length
  const totalPosts = automations.reduce((s, a) => s + a.postsPublished, 0)
  const avgEng = +(automations.filter((a) => a.engagementAvg > 0).reduce((s, a, _, arr) => s + a.engagementAvg / arr.length, 0)).toFixed(1)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Auto-Pilot"
        description="Your AI agents post autonomously — you just set the strategy"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{autopilotOn ? 'Active' : 'Paused'}</span>
              <button
                onClick={() => {
                  setAutopilotOn((v) => !v)
                  toast(autopilotOn ? '⏸ Auto-Pilot paused' : '▶ Auto-Pilot active', {
                    description: autopilotOn ? 'No posts will be published until you resume.' : 'Your agents are back to work.',
                  })
                }}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  autopilotOn ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                )}
                role="switch"
                aria-checked={autopilotOn}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
                    autopilotOn ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              + New Automation
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Status hero ───────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.135 0.018 48) 0%, oklch(0.185 0.020 38) 100%)' }}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #EA580C, transparent)' }} />
          <div className="pointer-events-none absolute -bottom-10 left-20 h-32 w-32 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #DB2777, transparent)' }} />

          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Pulse indicator */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: 'oklch(0.22 0.016 48)' }}>
                {autopilotOn && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                )}
                <div className={cn('h-5 w-5 rounded-full', autopilotOn ? 'bg-emerald-400' : 'bg-muted-foreground/50')} />
              </div>
              <div>
                <p className="text-base font-black">
                  {autopilotOn ? 'Auto-Pilot is LIVE' : 'Auto-Pilot is Paused'}
                </p>
                <p className="text-sm text-white/60 mt-0.5">
                  {autopilotOn
                    ? `${activeCount} automation${activeCount !== 1 ? 's' : ''} running across ${new Set(automations.filter(a => a.active).map(a => a.platform)).size} platforms`
                    : 'No posts will be published until you resume'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {[
                { label: 'Posts auto-published', value: totalPosts },
                { label: 'Avg engagement',       value: `${avgEng}%` },
                { label: 'Time saved',            value: '4.2 hrs' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Left: Automations + Agent status ──────────────────────── */}
          <div className="space-y-5">

            {/* Automations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold">Active Automations</h2>
                <span className="text-xs text-muted-foreground">{activeCount} of {automations.length} running</span>
              </div>
              <div className="space-y-3">
                {automations.map((auto) => {
                  const pCfg = PLATFORM_CFG[auto.platform]
                  return (
                    <div
                      key={auto.id}
                      className={cn(
                        'group rounded-2xl border p-4 transition-all',
                        auto.active ? 'border-border/60 bg-card shadow-sm hover:shadow-md' : 'border-border/40 bg-muted/20 opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Agent avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: auto.agentColor }}>
                          {auto.agentAvatar}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{auto.name}</p>
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={{ background: pCfg.bg, color: pCfg.text }}
                                >
                                  {pCfg.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {auto.schedule}
                                </span>
                              </div>
                            </div>

                            {/* Toggle */}
                            <button
                              onClick={() => toggleAutomation(auto.id)}
                              className={cn(
                                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150',
                                auto.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                              )}
                            >
                              <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform', auto.active ? 'translate-x-4' : 'translate-x-0')} />
                            </button>
                          </div>

                          {/* Stats row */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span><strong className="text-foreground">{auto.postsPublished}</strong> published</span>
                            {auto.engagementAvg > 0 && (
                              <span><strong className="text-emerald-600">{auto.engagementAvg}%</strong> avg eng</span>
                            )}
                            <span>Last ran: {auto.lastRan}</span>
                            {auto.active && <span className="text-orange-500 font-medium">Next: {auto.nextRun}</span>}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteAutomation(auto.id)}
                          className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Add automation CTA */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full rounded-2xl border border-dashed border-border/60 py-5 text-center hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-orange-600 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-sm font-medium">Add Automation</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Agent status grid */}
            <div>
              <h2 className="text-sm font-bold mb-3">Agent Status</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {AGENT_STATUS.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 hover:shadow-md hover:border-border transition-all group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base" style={{ background: agent.color }}>
                      {agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{agent.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            agent.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                          )}
                        />
                        <span className={cn('text-[10px] font-medium', agent.status === 'active' ? 'text-emerald-600' : 'text-muted-foreground')}>
                          {agent.status === 'active' ? 'Active' : 'Idle'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">· {agent.postsWeek} posts this week</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Next: {agent.nextRun}</p>
                    </div>
                    <svg className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Live Activity Feed ──────────────────────────────── */}
          <div className="space-y-4">

            {/* Feed header */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={cn('h-2 w-2 rounded-full', autopilotOn ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                {autopilotOn && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
              </div>
              <h2 className="text-sm font-bold">Live Activity</h2>
              <span className="ml-auto text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {autopilotOn ? 'REAL-TIME' : 'PAUSED'}
              </span>
            </div>

            {/* Feed */}
            <div
              ref={feedRef}
              className="rounded-2xl border border-border/60 bg-card overflow-y-auto"
              style={{ maxHeight: '520px' }}
            >
              {/* Terminal-style header */}
              <div
                className="flex items-center gap-1.5 px-3 py-2 sticky top-0"
                style={{ background: 'oklch(0.135 0.018 48)', borderBottom: '1px solid oklch(0.22 0.016 48)' }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 text-[10px] font-mono text-white/40">postpilot · agent-runtime</span>
              </div>

              <div className="p-3 space-y-2">
                {feed.map((item, idx) => {
                  const cfg = FEED_COLORS[item.type]
                  const pCfg = item.platform ? PLATFORM_CFG[item.platform] : null
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-start gap-2.5 rounded-lg border p-2.5 transition-all',
                        idx === 0 && 'animate-in slide-in-from-top-2 duration-300'
                      )}
                      style={{ background: cfg.bg, borderColor: cfg.border }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{ background: cfg.icon + '20', color: cfg.icon }}
                      >
                        {FEED_ICONS[item.type]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-foreground">{item.agent}</span>
                          {pCfg && (
                            <span className="rounded-full px-1.5 py-0 text-[9px] font-bold" style={{ background: pCfg.bg, color: pCfg.text }}>
                              {pCfg.label}
                            </span>
                          )}
                          <span className="ml-auto text-[9px] text-muted-foreground shrink-0">{relativeTime(item.ts)}</span>
                        </div>
                        <p className="text-xs text-foreground leading-snug">{item.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick stats below feed */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Today', value: '6 posts', color: '#EA580C' },
                { label: 'This week', value: '28 posts', color: '#DB2777' },
                { label: 'Success rate', value: '99.2%', color: '#10B981' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card p-3 text-center">
                  <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              className="relative overflow-hidden rounded-2xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #1A1210 0%, #2C1A12 100%)' }}
            >
              <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-full opacity-20 blur-xl" style={{ background: 'radial-gradient(circle, #EA580C, transparent)' }} />
              <div className="relative">
                <p className="text-xs font-bold mb-1">Want smarter automations?</p>
                <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                  Talk to your Strategist Agent to fine-tune topics, posting cadence, and content goals.
                </p>
                <Link href="/dashboard/agents/strategist" className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: '#FB923C' }}>
                  Open Strategist Agent →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateAutomationModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(a) => setAutomations((prev) => [a, ...prev])}
        />
      )}
    </div>
  )
}
