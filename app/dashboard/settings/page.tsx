'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
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

const POSTING_FREQUENCIES = [
  { id: 'daily',   label: 'Daily',      desc: '1 post per day' },
  { id: '3x_week', label: '3× / week',  desc: 'Mon, Wed, Fri' },
  { id: '5x_week', label: '5× / week',  desc: 'Weekdays only' },
  { id: 'custom',  label: 'Custom',     desc: 'Set your own schedule' },
]

const DEFAULT_BRAND_KEYWORDS = ['SaaS', 'Productivity', 'Remote work', 'Startups']
const DEFAULT_BRAND_VOICE = 'I write for founders and operators who want to grow online without the fluff. Direct, practical, and occasionally witty. Never corporate.'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SettingsPage() {
  const { data: savedSettings, isLoading: settingsLoading } = useSWR('/api/settings', fetcher)
  const { data: sessionData } = useSWR('/api/auth/session', fetcher)

  const [name, setName]                     = useState('Demo User')
  const [defaultTone, setDefaultTone]       = useState('casual')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest]     = useState(true)
  const [brandVoice, setBrandVoice]         = useState(DEFAULT_BRAND_VOICE)
  const [postingFrequency, setPostingFrequency] = useState('3x_week')
  const [preferredContentTypes, setPreferredContentTypes] = useState<string[]>(['educational', 'thought-leadership'])
  const [brandKeywords, setBrandKeywords]   = useState<string[]>(DEFAULT_BRAND_KEYWORDS)
  const [newKeyword, setNewKeyword]         = useState('')
  const [hashtagStyle, setHashtagStyle]     = useState<'minimal' | 'moderate' | 'heavy'>('minimal')

  const [savingProfile, setSavingProfile]           = useState(false)
  const [savingBrandVoice, setSavingBrandVoice]     = useState(false)
  const [savingPreferences, setSavingPreferences]   = useState(false)
  const [clearingDrafts, setClearingDrafts]         = useState(false)

  // Populate from saved settings once loaded.
  // NOTE: Use existence checks (not truthy/length) so persisted empty arrays
  // and empty strings overwrite the defaults — otherwise clearing all
  // keywords or content types silently snaps back to seed values on reload.
  useEffect(() => {
    if (!savedSettings || Object.keys(savedSettings).length === 0) return
    if (typeof savedSettings.name === 'string')                       setName(savedSettings.name)
    if (typeof savedSettings.brandVoice === 'string')                 setBrandVoice(savedSettings.brandVoice)
    if (Array.isArray(savedSettings.brandKeywords))                   setBrandKeywords(savedSettings.brandKeywords)
    if (typeof savedSettings.defaultTone === 'string')                setDefaultTone(savedSettings.defaultTone)
    if (typeof savedSettings.hashtagStyle === 'string')               setHashtagStyle(savedSettings.hashtagStyle)
    if (Array.isArray(savedSettings.preferredContentTypes))           setPreferredContentTypes(savedSettings.preferredContentTypes)
    if (typeof savedSettings.postingFrequency === 'string')           setPostingFrequency(savedSettings.postingFrequency)
    if (typeof savedSettings.emailNotifications === 'boolean')        setEmailNotifications(savedSettings.emailNotifications)
    if (typeof savedSettings.weeklyDigest === 'boolean')              setWeeklyDigest(savedSettings.weeklyDigest)
  }, [savedSettings])

  // Populate name from session
  useEffect(() => {
    if (sessionData?.user?.name && !savedSettings?.name) {
      setName(sessionData.user.name)
    }
  }, [sessionData, savedSettings])

  const userEmail = sessionData?.user?.email ?? 'demo@postpilot.ai'

  async function patchSettings(partial: Record<string, unknown>) {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await patchSettings({ name })
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveBrandVoice = async () => {
    setSavingBrandVoice(true)
    try {
      await patchSettings({ brandVoice, brandKeywords })
      toast.success('Brand voice saved!')
    } catch {
      toast.error('Failed to save brand voice')
    } finally {
      setSavingBrandVoice(false)
    }
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    try {
      await patchSettings({
        defaultTone,
        hashtagStyle,
        preferredContentTypes,
        postingFrequency,
        emailNotifications,
        weeklyDigest,
      })
      toast.success('Preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleClearDrafts = async () => {
    if (!confirm('This will permanently delete all your drafts and threads. Are you sure?')) return
    setClearingDrafts(true)
    try {
      const res = await fetch('/api/drafts?all=true', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('All drafts cleared')
    } catch {
      toast.error('Failed to clear drafts')
    } finally {
      setClearingDrafts(false)
    }
  }

  const toggleContentType = (id: string) => {
    setPreferredContentTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const addKeyword = () => {
    const trimmed = newKeyword.trim()
    if (trimmed && !brandKeywords.includes(trimmed)) {
      setBrandKeywords((prev) => [...prev, trimmed])
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw: string) => {
    setBrandKeywords((prev) => prev.filter((k) => k !== kw))
  }

  if (settingsLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Settings" description="Personalize PostPilot to match your brand and workflow." />
        <div className="p-6 space-y-6 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl border border-border/60 bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        description="Personalize PostPilot to match your brand and workflow."
      />

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
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card"
                    style={{ background: '#22C55E' }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  <span className="mt-1 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Free Plan · 25 generations left
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userEmail} disabled />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingProfile}
                className="font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
              >
                {savingProfile ? (
                  <>
                    <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Brand Voice ─────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Brand Voice</CardTitle>
            <CardDescription>
              Describe your unique voice. AI agents use this to match your style automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="brandVoice">Voice Description</Label>
              <Textarea
                id="brandVoice"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                rows={3}
                className="resize-none text-sm leading-relaxed"
                placeholder="Describe your brand voice, audience, and communication style..."
              />
              <p className="text-xs text-muted-foreground">
                Tip: Include your audience, your tone, and what you want to avoid.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Brand Keywords & Topics</Label>
              <div className="flex flex-wrap gap-1.5">
                {brandKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-orange-400 hover:text-orange-700 transition-colors leading-none"
                      aria-label={`Remove keyword ${kw}`}
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
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add a keyword or topic…"
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addKeyword}
                  className="shrink-0"
                  disabled={!newKeyword.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="font-medium"
              onClick={handleSaveBrandVoice}
              disabled={savingBrandVoice}
            >
              {savingBrandVoice ? (
                <>
                  <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Save Brand Voice'}
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

            {/* Default tone */}
            <div className="space-y-2">
              <Label>Default Tone</Label>
              <Select value={defaultTone} onValueChange={setDefaultTone}>
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

            {/* Hashtag style */}
            <div className="space-y-2">
              <Label>Hashtag Style</Label>
              <div className="flex gap-2">
                {(['minimal', 'moderate', 'heavy'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setHashtagStyle(style)}
                    className={cn(
                      'flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all duration-200',
                      hashtagStyle === style
                        ? 'text-white border-transparent shadow-sm'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    )}
                    style={
                      hashtagStyle === style
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

            {/* Preferred content types */}
            <div className="space-y-2">
              <Label>Preferred Content Types</Label>
              <p className="text-xs text-muted-foreground">AI will bias suggestions toward these types.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = preferredContentTypes.includes(ct.id)
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => toggleContentType(ct.id)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'text-white border-transparent shadow-sm'
                          : 'border-border/60 text-muted-foreground hover:text-foreground'
                      )}
                      style={
                        isSelected
                          ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                          : undefined
                      }
                    >
                      {ct.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Posting frequency */}
            <div className="space-y-2">
              <Label>Posting Frequency</Label>
              <p className="text-xs text-muted-foreground">Agents will plan content around this cadence.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {POSTING_FREQUENCIES.map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setPostingFrequency(freq.id)}
                    className={cn(
                      'flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-200',
                      postingFrequency === freq.id
                        ? 'border-transparent text-white shadow-md'
                        : 'border-border/60 hover:border-orange-200'
                    )}
                    style={
                      postingFrequency === freq.id
                        ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                        : undefined
                    }
                  >
                    <span className="text-sm font-bold">{freq.label}</span>
                    <span className={cn('mt-0.5 text-[10px]', postingFrequency === freq.id ? 'text-white/70' : 'text-muted-foreground')}>
                      {freq.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <Label>Notifications</Label>
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
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.onChange} />
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="font-medium"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
            >
              {savingPreferences ? (
                <>
                  <svg className="mr-1.5 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* ── Subscription Plan ───────────────────────────────────── */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Current Plan</CardTitle>
            <CardDescription>Manage your PostPilot subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="relative overflow-hidden rounded-xl p-5"
              style={{ background: 'oklch(0.135 0.018 48)' }}
            >
              <div className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.15), transparent 60%)' }} />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">Free Plan</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                      Current
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/60">25 AI generations · 4 agents · Basic features</p>
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

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                'Unlimited generations',
                'All 4 premium agents',
                'Priority support',
                'Custom agent training',
              ].map((feat) => (
                <div key={feat} className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-sm">✓</span>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{feat}</p>
                </div>
              ))}
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
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleClearDrafts}
                disabled={clearingDrafts}
              >
                {clearingDrafts ? 'Clearing…' : 'Clear Drafts'}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button asChild variant="destructive" size="sm" className="shrink-0">
                <a href="mailto:support@postpilot.ai?subject=Delete%20Account%20Request">
                  Delete Account
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
