'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/dashboard/header'
import { TONES, CONTENT_TYPES } from '@/lib/constants/platforms'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  loadUserProfile,
  saveUserProfile,
  type UserProfile,
  type UserMode,
  type UserGoal,
  type HashtagStyle,
  type PostingFrequency,
} from '@/lib/user-profile'

const POSTING_FREQUENCIES: { id: PostingFrequency; label: string; desc: string }[] = [
  { id: 'daily', label: 'Daily', desc: '1 post per day' },
  { id: '3x_week', label: '3× / week', desc: 'Mon, Wed, Fri' },
  { id: '5x_week', label: '5× / week', desc: 'Weekdays only' },
  { id: 'custom', label: 'Custom', desc: 'Set your own schedule' },
]

const TIMEZONES = [
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/UTC-7' },
  { id: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/UTC-6' },
  { id: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/UTC-5' },
  { id: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/UTC-4' },
  { id: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/UTC+1' },
  { id: 'Europe/Paris', label: 'Central Europe (CET)', offset: 'UTC+1/UTC+2' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 'UTC+10/UTC+11' },
]

const MODES: { id: UserMode; label: string; description: string; bullets: string[] }[] = [
  {
    id: 'business',
    label: 'Business / Brand',
    description: 'You run a company, agency, or brand account.',
    bullets: ['ROI-driven cadence', 'Brand consistency', 'Calendar-led planning'],
  },
  {
    id: 'creator',
    label: 'Creator / Influencer',
    description: 'You build an audience around your work, voice, or niche.',
    bullets: ['Growth-first', 'Trend-responsive', 'Monetization-aware'],
  },
  {
    id: 'personal',
    label: 'Personal',
    description: 'You\u2019re automating personal accounts \u2014 no marketing register.',
    bullets: ['Authentic voice', 'Low-effort cadence', 'Only post when real'],
  },
]

const GOALS: { id: UserGoal; label: string; desc: string }[] = [
  { id: 'growth', label: 'Audience growth', desc: 'Followers, reach, awareness' },
  { id: 'leads', label: 'Lead generation', desc: 'Sign-ups, demos, inbound' },
  { id: 'sales', label: 'Direct sales', desc: 'Conversion, revenue' },
  { id: 'community', label: 'Community', desc: 'Engagement, retention' },
  { id: 'authority', label: 'Authority', desc: 'Thought leadership' },
  { id: 'monetization', label: 'Monetization', desc: 'Sponsorships, ad rev' },
  { id: 'personal-brand', label: 'Personal brand', desc: 'Career capital, network' },
  { id: 'recruiting', label: 'Recruiting', desc: 'Hiring, employer brand' },
  { id: 'support', label: 'Customer support', desc: 'Replies, help, triage' },
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [newKeyword, setNewKeyword] = useState('')
  const [newPillar, setNewPillar] = useState('')
  const [newDoWord, setNewDoWord] = useState('')
  const [newDontWord, setNewDontWord] = useState('')

  // Hydrate from localStorage
  useEffect(() => {
    const loaded = loadUserProfile()
    // If empty, seed with sensible defaults so the page never feels barren
    if (!loaded.name) loaded.name = 'Demo User'
    if (loaded.brandKeywords.length === 0)
      loaded.brandKeywords = ['SaaS', 'Productivity', 'Remote work', 'Startups']
    if (!loaded.brandVoice)
      loaded.brandVoice =
        'I write for founders and operators who want to grow online without the fluff. Direct, practical, and occasionally witty. Never corporate.'
    setProfile(loaded)
  }, [])

  if (!profile) {
    return (
      <div className="flex flex-col">
        <Header title="Settings" description="Personalize PostPilot to match your brand and workflow." />
        <div className="p-6 text-sm text-muted-foreground">Loading your profile…</div>
      </div>
    )
  }

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const persist = (next?: UserProfile) => {
    const target = next ?? profile
    if (!target) return
    saveUserProfile(target)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    persist()
    toast.success('Profile saved')
  }

  const handleSaveSection = (label: string) => {
    persist()
    toast.success(`${label} saved`)
  }

  const toggleGoal = (id: UserGoal) => {
    if (!profile) return
    const next = profile.goals.includes(id)
      ? profile.goals.filter((g) => g !== id)
      : [...profile.goals, id]
    const updated = { ...profile, goals: next }
    setProfile(updated)
    persist(updated)
  }

  const toggleContentType = (id: string) => {
    if (!profile) return
    const next = profile.preferredContentTypes.includes(id)
      ? profile.preferredContentTypes.filter((t) => t !== id)
      : [...profile.preferredContentTypes, id]
    const updated = { ...profile, preferredContentTypes: next }
    setProfile(updated)
    persist(updated)
  }

  const addToList = (
    listKey: 'brandKeywords' | 'contentPillars' | 'doWords' | 'dontWords',
    value: string,
    clear: () => void,
  ) => {
    if (!profile) return
    const trimmed = value.trim()
    if (!trimmed) return
    const current = profile[listKey] as string[]
    if (current.includes(trimmed)) return
    const updated = { ...profile, [listKey]: [...current, trimmed] }
    setProfile(updated)
    persist(updated)
    clear()
  }

  const removeFromList = (
    listKey: 'brandKeywords' | 'contentPillars' | 'doWords' | 'dontWords',
    value: string,
  ) => {
    if (!profile) return
    const updated = { ...profile, [listKey]: (profile[listKey] as string[]).filter((v) => v !== value) }
    setProfile(updated)
    persist(updated)
  }

  return (
    <div className="flex flex-col">
      <Header title="Settings" description="Personalize PostPilot to match your brand and workflow." />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* ── Profile ─────────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    {(profile.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card"
                    style={{ background: '#22C55E' }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">demo@postpilot.ai</p>
                  <span className="mt-1 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Free Plan · 25 generations left
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand / Business name</Label>
                  <Input
                    id="brandName"
                    value={profile.brandName ?? ''}
                    onChange={(e) => update('brandName', e.target.value)}
                    placeholder="Optional — leave blank for personal"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website ?? ''}
                    onChange={(e) => update('website', e.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
              >
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Mode ────────────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">How are you using PostPilot?</CardTitle>
            <CardDescription>
              This is the most important setting. Every agent adapts its voice, cadence, and goals to match.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {MODES.map((m) => {
                const selected = profile.mode === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, mode: m.id }
                      setProfile(updated)
                      persist(updated)
                    }}
                    className={cn(
                      'flex flex-col text-left rounded-xl border p-4 transition-all duration-200',
                      selected
                        ? 'border-transparent text-white shadow-md'
                        : 'border-border/60 hover:border-orange-200',
                    )}
                    style={selected ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' } : undefined}
                  >
                    <span className="text-sm font-bold">{m.label}</span>
                    <span className={cn('mt-1 text-xs', selected ? 'text-white/80' : 'text-muted-foreground')}>
                      {m.description}
                    </span>
                    <ul className={cn('mt-3 space-y-1 text-[11px]', selected ? 'text-white/70' : 'text-muted-foreground')}>
                      {m.bullets.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Goals ───────────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Goals</CardTitle>
            <CardDescription>Pick the outcomes that matter. Agents bias every draft toward these.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {GOALS.map((g) => {
                const selected = profile.goals.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={cn(
                      'flex flex-col items-start text-left rounded-xl border px-4 py-3 transition-all duration-200',
                      selected
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-border/60 hover:border-orange-200',
                    )}
                    style={selected ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' } : undefined}
                  >
                    <span className="text-sm font-semibold">{g.label}</span>
                    <span className={cn('text-[11px]', selected ? 'text-white/70' : 'text-muted-foreground')}>
                      {g.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Audience & Pillars ──────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Audience &amp; Content Pillars</CardTitle>
            <CardDescription>
              Tell agents who you write for and the 3–5 themes you keep coming back to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Textarea
                id="audience"
                rows={2}
                value={profile.audience}
                onChange={(e) => update('audience', e.target.value)}
                placeholder="e.g. Marketing managers at mid-sized e-commerce brands ($5–50M revenue)"
                className="resize-none text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label>Content Pillars</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.contentPillars.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removeFromList('contentPillars', p)}
                      className="text-orange-400 hover:text-orange-700 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {profile.contentPillars.length === 0 && (
                  <p className="text-xs text-muted-foreground">No pillars yet. Add 3–5 themes you post about.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPillar}
                  onChange={(e) => setNewPillar(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addToList('contentPillars', newPillar, () => setNewPillar('')))
                  }
                  placeholder="e.g. Founder lessons, B2B growth, Remote leadership…"
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToList('contentPillars', newPillar, () => setNewPillar(''))}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Brand Keywords</Label>
              <div className="flex flex-wrap gap-1.5">
                {profile.brandKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeFromList('brandKeywords', kw)}
                      className="text-orange-400 hover:text-orange-700 transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addToList('brandKeywords', newKeyword, () => setNewKeyword('')))
                  }
                  placeholder="Add a keyword or topic…"
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToList('brandKeywords', newKeyword, () => setNewKeyword(''))}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Brand Voice ─────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Brand Voice</CardTitle>
            <CardDescription>
              Describe your unique voice. Lock in the words you love and the words you can&apos;t stand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="brandVoice">Voice Description</Label>
              <Textarea
                id="brandVoice"
                value={profile.brandVoice}
                onChange={(e) => update('brandVoice', e.target.value)}
                rows={3}
                className="resize-none text-sm leading-relaxed"
                placeholder="Direct, dry-witty, no exclamation marks. We sound like a sharp friend, never a corporation."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-emerald-700">Words / phrases to USE</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {profile.doWords.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {w}
                      <button
                        type="button"
                        onClick={() => removeFromList('doWords', w)}
                        className="text-emerald-400 hover:text-emerald-700 transition-colors leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newDoWord}
                    onChange={(e) => setNewDoWord(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addToList('doWords', newDoWord, () => setNewDoWord('')))
                    }
                    placeholder="e.g. ship, craft, compounding"
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addToList('doWords', newDoWord, () => setNewDoWord(''))}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-rose-700">Words / phrases to NEVER use</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {profile.dontWords.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/60 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      {w}
                      <button
                        type="button"
                        onClick={() => removeFromList('dontWords', w)}
                        className="text-rose-400 hover:text-rose-700 transition-colors leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newDontWord}
                    onChange={(e) => setNewDontWord(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), addToList('dontWords', newDontWord, () => setNewDontWord('')))
                    }
                    placeholder="e.g. leverage, unlock, synergy"
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addToList('dontWords', newDontWord, () => setNewDontWord(''))}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="font-medium"
              onClick={() => handleSaveSection('Brand voice')}
            >
              Save Brand Voice
            </Button>
          </CardContent>
        </Card>

        {/* ── AI Preferences ──────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">AI Preferences</CardTitle>
            <CardDescription>Configure defaults for all content generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Default Tone</Label>
              <Select
                value={profile.defaultTone}
                onValueChange={(v) => {
                  const updated = { ...profile, defaultTone: v }
                  setProfile(updated)
                  persist(updated)
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      {tone.name} — {tone.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Pre-selected when you open the Create page.</p>
            </div>

            <div className="space-y-2">
              <Label>Hashtag Style</Label>
              <div className="flex gap-2">
                {(['minimal', 'moderate', 'heavy'] as HashtagStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, hashtagStyle: style }
                      setProfile(updated)
                      persist(updated)
                    }}
                    className={cn(
                      'flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all duration-200',
                      profile.hashtagStyle === style
                        ? 'text-white border-transparent shadow-sm'
                        : 'border-border/60 text-muted-foreground hover:text-foreground',
                    )}
                    style={
                      profile.hashtagStyle === style
                        ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                        : undefined
                    }
                  >
                    {style}
                    <span className="block text-[10px] opacity-70 font-normal mt-0.5">
                      {style === 'minimal' ? '1–3 tags' : style === 'moderate' ? '4–8 tags' : '9–15 tags'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Content Types</Label>
              <p className="text-xs text-muted-foreground">AI biases suggestions toward these.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = profile.preferredContentTypes.includes(ct.id)
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => toggleContentType(ct.id)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'text-white border-transparent shadow-sm'
                          : 'border-border/60 text-muted-foreground hover:text-foreground',
                      )}
                      style={
                        isSelected ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' } : undefined
                      }
                    >
                      {ct.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Posting Frequency ───────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Posting Frequency</CardTitle>
            <CardDescription>How often do you want to post? Agents plan around this.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {POSTING_FREQUENCIES.map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...profile, postingFrequency: freq.id }
                    setProfile(updated)
                    persist(updated)
                  }}
                  className={cn(
                    'flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-200',
                    profile.postingFrequency === freq.id
                      ? 'border-transparent text-white shadow-md'
                      : 'border-border/60 hover:border-orange-200',
                  )}
                  style={
                    profile.postingFrequency === freq.id
                      ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                      : undefined
                  }
                >
                  <span className="text-sm font-bold">{freq.label}</span>
                  <span
                    className={cn(
                      'mt-0.5 text-[10px]',
                      profile.postingFrequency === freq.id ? 'text-white/70' : 'text-muted-foreground',
                    )}
                  >
                    {freq.desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">AI agents use this to build content calendars.</p>
          </CardContent>
        </Card>

        {/* ── Timezone ──────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Timezone</CardTitle>
            <CardDescription>Set your timezone for accurate scheduling and analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Timezone</Label>
              <Select
                value={profile.timezone}
                onValueChange={(v) => {
                  const updated = { ...profile, timezone: v }
                  setProfile(updated)
                  persist(updated)
                }}
              >
                <SelectTrigger className="w-full sm:w-[320px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.id} value={tz.id}>
                      <div className="flex items-center gap-2">
                        <span>{tz.label}</span>
                        <span className="text-xs text-muted-foreground">({tz.offset})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">All scheduled posts and analytics will use this timezone.</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Current time: </span>
                {new Date().toLocaleTimeString('en-US', {
                  timeZone: profile.timezone,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}{' '}
                ({TIMEZONES.find((t) => t.id === profile.timezone)?.label})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Notifications ───────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Notifications</CardTitle>
            <CardDescription>Control how and when PostPilot reaches you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: 'Email Notifications',
                desc: 'Tips, product updates, and feature announcements',
                value: emailNotifications,
                onChange: setEmailNotifications,
              },
              {
                label: 'Weekly Performance Digest',
                desc: 'A summary of your content performance every Monday',
                value: weeklyDigest,
                onChange: setWeeklyDigest,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.value} onCheckedChange={item.onChange} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Subscription Plan ───────────────────────────────────── */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Current Plan</CardTitle>
            <CardDescription>Manage your PostPilot subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative overflow-hidden rounded-xl p-5" style={{ background: 'oklch(0.135 0.018 48)' }}>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.15), transparent 60%)' }}
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">Free Plan</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                      Current
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">25 AI generations · 10 agents · Basic features</p>
                  <div className="mt-2 flex gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: '40%', background: 'linear-gradient(90deg, #EA580C, #DB2777)' }}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-white/40">10 of 25 generations used</p>
                </div>
                <Button
                  className="shrink-0 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
                >
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Danger Zone ─────────────────────────────────────────── */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-destructive">Danger Zone</CardTitle>
            <CardDescription>These actions are irreversible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium">Clear All Drafts</p>
                <p className="text-xs text-muted-foreground">Permanently delete all saved posts and threads</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10">
                Clear Drafts
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm" className="shrink-0">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
