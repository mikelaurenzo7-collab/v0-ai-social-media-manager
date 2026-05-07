'use client'

import { useState } from 'react'
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

const BRAND_KEYWORDS = ['SaaS', 'Productivity', 'Remote work', 'Startups']

export default function SettingsPage() {
  const [name, setName] = useState('Demo User')
  const [defaultTone, setDefaultTone] = useState('casual')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [brandVoice, setBrandVoice] = useState(
    'I write for founders and operators who want to grow online without the fluff. Direct, practical, and occasionally witty. Never corporate.'
  )
  const [postingFrequency, setPostingFrequency] = useState('3x_week')
  const [preferredContentTypes, setPreferredContentTypes] = useState<string[]>(['educational', 'thought-leadership'])
  const [brandKeywords, setBrandKeywords] = useState<string[]>(BRAND_KEYWORDS)
  const [newKeyword, setNewKeyword] = useState('')
  const [hashtagStyle, setHashtagStyle] = useState<'minimal' | 'moderate' | 'heavy'>('minimal')
  const [timezone, setTimezone] = useState('America/New_York')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Profile saved!')
  }

  const handleSavePreferences = () => {
    toast.success('Preferences saved!')
  }

  const handleSaveBrandVoice = () => {
    toast.success('Brand voice saved!')
  }

  const toggleContentType = (id: string) => {
    setPreferredContentTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const addKeyword = () => {
    const trimmed = newKeyword.trim()
    if (trimmed && !brandKeywords.includes(trimmed)) {
      setBrandKeywords(prev => [...prev, trimmed])
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw: string) => {
    setBrandKeywords(prev => prev.filter(k => k !== kw))
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
            <form onSubmit={handleSave} className="space-y-5">
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
                  <p className="text-sm text-muted-foreground">demo@postpilot.ai</p>
                  <span className="mt-1 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Free Plan · 25 generations left
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="demo@postpilot.ai" disabled />
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

            <Button
              type="button"
              variant="outline"
              className="font-medium"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* ── Posting Frequency ───────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">Posting Frequency</CardTitle>
            <CardDescription>How often do you want to post? Agents will plan around this.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <p className="text-xs text-muted-foreground">
              AI agents use this to build more accurate content calendars for you.
            </p>
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
              <Select value={timezone} onValueChange={setTimezone}>
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
              <p className="text-xs text-muted-foreground">
                All scheduled posts and analytics will use this timezone.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Current time: </span>
                {new Date().toLocaleTimeString('en-US', { 
                  timeZone: timezone, 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })} ({TIMEZONES.find(t => t.id === timezone)?.label})
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
                { feat: 'Unlimited generations', pro: true },
                { feat: 'All 4 premium agents', pro: true },
                { feat: 'Priority support', pro: true },
                { feat: 'Custom agent training', pro: true },
              ].map((f) => (
                <div key={f.feat} className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-center">
                  <span className="text-sm">✓</span>
                  <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{f.feat}</p>
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
