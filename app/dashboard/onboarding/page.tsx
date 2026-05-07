'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Briefcase, Sparkles, User2, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { UserMode, UserGoal, UserProfile } from '@/lib/user-profile'
import { saveUserProfile, loadUserProfile } from '@/lib/user-profile'

// ── Step config ─────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4

const MODES: Array<{ id: UserMode; title: string; copy: string; icon: typeof Briefcase }> = [
  {
    id: 'business',
    title: 'Business / Brand',
    copy: 'I run a company or manage a brand. Optimize for ROI and consistency.',
    icon: Briefcase,
  },
  {
    id: 'creator',
    title: 'Creator / Influencer',
    copy: 'I build an audience and monetize my voice. Optimize for growth and engagement.',
    icon: Sparkles,
  },
  {
    id: 'personal',
    title: 'Personal',
    copy: 'I just want to post sometimes without it feeling like a job.',
    icon: User2,
  },
]

const GOALS: Array<{ id: UserGoal; label: string; hint: string }> = [
  { id: 'growth', label: 'Grow audience', hint: 'Followers, reach, awareness' },
  { id: 'leads', label: 'Generate leads', hint: 'Sign-ups, demos, inbound interest' },
  { id: 'sales', label: 'Drive sales', hint: 'Direct revenue and conversions' },
  { id: 'community', label: 'Build community', hint: 'Engagement, retention, belonging' },
  { id: 'authority', label: 'Establish authority', hint: 'Thought leadership, credibility' },
  { id: 'monetization', label: 'Monetize content', hint: 'Sponsorships, ad revenue' },
  { id: 'personal-brand', label: 'Personal brand', hint: 'Career capital, networking' },
  { id: 'recruiting', label: 'Recruit talent', hint: 'Hiring and employer brand' },
  { id: 'support', label: 'Customer support', hint: 'Replies, help, service' },
]

const TONE_PRESETS = ['Professional', 'Conversational', 'Witty', 'Bold', 'Warm', 'Authoritative', 'Playful', 'Minimal']

// ── Page ────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Form state — single object, hydrate from existing profile if any
  const [form, setForm] = useState<Partial<UserProfile>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { profile: (UserProfile & { onboardingComplete: boolean; onboardingStep: number }) | null }
          if (data.profile) {
            // If they already completed onboarding, send them home
            if (data.profile.onboardingComplete) {
              router.replace('/dashboard')
              return
            }
            if (!cancelled) {
              setForm(data.profile)
              setStep(Math.max(1, data.profile.onboardingStep || 1))
            }
          }
        }
      } catch {
        // Unauthenticated or offline — fall back to localStorage
        const local = loadUserProfile()
        if (!cancelled) setForm(local)
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const persistStep = async (nextStep: number, complete = false) => {
    const payload = { ...form, onboardingStep: nextStep, onboardingComplete: complete }
    // Optimistic local save so the wizard works offline / unauthenticated
    saveUserProfile({ ...loadUserProfile(), ...payload })
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Soft-fail. Local copy still works for the chat route fallback.
    }
  }

  const canAdvance = useMemo(() => {
    if (step === 1) return !!form.mode
    if (step === 2) return !!form.brandName?.trim() && !!form.audience?.trim()
    if (step === 3) return (form.goals?.length ?? 0) > 0 && (form.contentPillars?.length ?? 0) >= 2
    if (step === 4) return !!form.brandVoice?.trim() && !!form.defaultTone?.trim()
    return false
  }, [step, form])

  const handleNext = async () => {
    if (!canAdvance) return
    setSubmitting(true)
    if (step < TOTAL_STEPS) {
      await persistStep(step + 1, false)
      setStep((s) => s + 1)
      setSubmitting(false)
    } else {
      await persistStep(TOTAL_STEPS, true)
      setSubmitting(false)
      toast.success('Profile saved. Your agents will use this on every message.')
      router.replace('/dashboard')
    }
  }

  const handleBack = () => setStep((s) => Math.max(1, s - 1))

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12 sm:py-20">
        {/* Progress */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
              Step {step} of {TOTAL_STEPS}
            </span>
            <button
              onClick={() => router.replace('/dashboard')}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Skip for now
            </button>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </header>

        {/* Steps */}
        <div className="space-y-8">
          {step === 1 && <StepMode form={form} update={update} />}
          {step === 2 && <StepBrand form={form} update={update} />}
          {step === 3 && <StepGoals form={form} update={update} />}
          {step === 4 && <StepVoice form={form} update={update} />}
        </div>

        {/* Nav */}
        <div className="mt-12 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canAdvance || submitting} className="gap-2">
            {step === TOTAL_STEPS ? 'Finish' : 'Continue'}
            {step === TOTAL_STEPS ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </main>
  )
}

// ── Steps ───────────────────────────────────────────────────────────────────

function StepHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-2 text-sm sm:text-base text-muted-foreground text-pretty">{copy}</p>
    </div>
  )
}

function StepMode({
  form,
  update,
}: {
  form: Partial<UserProfile>
  update: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}) {
  return (
    <>
      <StepHeader
        title="How are you using PostPilot?"
        copy="This is the most important signal. It changes how every agent talks, what it prioritizes, and how often it posts."
      />
      <div className="grid gap-3">
        {MODES.map((m) => {
          const Icon = m.icon
          const selected = form.mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => update('mode', m.id)}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition ${
                selected
                  ? 'border-foreground bg-muted/40 ring-1 ring-foreground/20'
                  : 'border-border hover:border-foreground/40 hover:bg-muted/20'
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  selected ? 'bg-foreground text-background' : 'bg-muted text-foreground'
                }`}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{m.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{m.copy}</p>
              </div>
              {selected && <Check className="size-5 text-foreground shrink-0 mt-1" />}
            </button>
          )
        })}
      </div>
    </>
  )
}

function StepBrand({
  form,
  update,
}: {
  form: Partial<UserProfile>
  update: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}) {
  return (
    <>
      <StepHeader
        title="Who are you and who's listening?"
        copy="Specifics beat generalities. The sharper your audience, the sharper every draft."
      />
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="brandName">
            {form.mode === 'business' ? 'Business or brand name' : 'Your name or handle'}
          </Label>
          <Input
            id="brandName"
            placeholder={form.mode === 'business' ? 'Acme Inc.' : '@alexkim'}
            value={form.brandName ?? ''}
            onChange={(e) => update('brandName', e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            placeholder="https://acme.com"
            value={form.website ?? ''}
            onChange={(e) => update('website', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Target audience</Label>
          <Textarea
            id="audience"
            rows={3}
            placeholder="e.g. Marketing managers at mid-sized e-commerce brands, US/Canada, $5M–$50M revenue"
            value={form.audience ?? ''}
            onChange={(e) => update('audience', e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Be specific. Role + industry + size + location works better than &ldquo;everyone&rdquo;.
          </p>
        </div>
      </div>
    </>
  )
}

function StepGoals({
  form,
  update,
}: {
  form: Partial<UserProfile>
  update: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}) {
  const goals = form.goals ?? []
  const pillars = form.contentPillars ?? []
  const [pillarInput, setPillarInput] = useState('')

  const toggleGoal = (id: UserGoal) => {
    const next = goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]
    update('goals', next)
  }

  const addPillar = () => {
    const v = pillarInput.trim()
    if (!v || pillars.includes(v) || pillars.length >= 5) return
    update('contentPillars', [...pillars, v])
    setPillarInput('')
  }

  const removePillar = (p: string) => update('contentPillars', pillars.filter((x) => x !== p))

  return (
    <>
      <StepHeader
        title="What does success look like?"
        copy="Pick what you're optimizing for and the 3–5 themes you actually post about."
      />
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Goals (pick all that apply)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOALS.map((g) => {
              const on = goals.includes(g.id)
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                    on
                      ? 'border-foreground bg-muted/40'
                      : 'border-border hover:border-foreground/40 hover:bg-muted/20'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                      on ? 'border-foreground bg-foreground' : 'border-muted-foreground/40'
                    }`}
                  >
                    {on && <Check className="size-3 text-background" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{g.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{g.hint}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pillar">
            Content pillars <span className="text-muted-foreground font-normal">({pillars.length}/5)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="pillar"
              placeholder="e.g. AI productivity"
              value={pillarInput}
              onChange={(e) => setPillarInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPillar()
                }
              }}
              disabled={pillars.length >= 5}
            />
            <Button onClick={addPillar} variant="secondary" disabled={!pillarInput.trim() || pillars.length >= 5}>
              Add
            </Button>
          </div>
          {pillars.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {pillars.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {p}
                  <button
                    onClick={() => removePillar(p)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${p}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Add at least 2. Agents stay inside these themes unless you ask them to roam.
          </p>
        </div>
      </div>
    </>
  )
}

function StepVoice({
  form,
  update,
}: {
  form: Partial<UserProfile>
  update: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void
}) {
  const doWords = form.doWords ?? []
  const dontWords = form.dontWords ?? []
  const [doInput, setDoInput] = useState('')
  const [dontInput, setDontInput] = useState('')

  const addDo = () => {
    const v = doInput.trim()
    if (!v || doWords.includes(v)) return
    update('doWords', [...doWords, v])
    setDoInput('')
  }
  const addDont = () => {
    const v = dontInput.trim()
    if (!v || dontWords.includes(v)) return
    update('dontWords', [...dontWords, v])
    setDontInput('')
  }
  const removeDo = (w: string) => update('doWords', doWords.filter((x) => x !== w))
  const removeDont = (w: string) => update('dontWords', dontWords.filter((x) => x !== w))

  return (
    <>
      <StepHeader
        title="How do you sound?"
        copy="A few sentences and a handful of words. Your agents will sound like you, not like a generic AI."
      />
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brandVoice">Describe your voice</Label>
          <Textarea
            id="brandVoice"
            rows={3}
            placeholder="e.g. Direct and a little dry. We don't use exclamation points. Always prefer numbers over adjectives."
            value={form.brandVoice ?? ''}
            onChange={(e) => update('brandVoice', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Default tone</Label>
          <div className="flex flex-wrap gap-2">
            {TONE_PRESETS.map((t) => {
              const on = form.defaultTone === t
              return (
                <button
                  key={t}
                  onClick={() => update('defaultTone', t)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    on
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-foreground hover:border-foreground/60'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Do words */}
          <div className="space-y-2">
            <Label htmlFor="doInput" className="text-emerald-700">
              Words to USE
            </Label>
            <div className="flex gap-2">
              <Input
                id="doInput"
                placeholder="add a word"
                value={doInput}
                onChange={(e) => setDoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addDo()
                  }
                }}
              />
              <Button variant="secondary" onClick={addDo} disabled={!doInput.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {doWords.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 px-2.5 py-0.5 text-xs"
                >
                  {w}
                  <button onClick={() => removeDo(w)} className="opacity-60 hover:opacity-100" aria-label={`Remove ${w}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Don't words */}
          <div className="space-y-2">
            <Label htmlFor="dontInput" className="text-rose-700">
              Words to NEVER USE
            </Label>
            <div className="flex gap-2">
              <Input
                id="dontInput"
                placeholder="add a word"
                value={dontInput}
                onChange={(e) => setDontInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addDont()
                  }
                }}
              />
              <Button variant="secondary" onClick={addDont} disabled={!dontInput.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {dontWords.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-800 ring-1 ring-rose-200 px-2.5 py-0.5 text-xs"
                >
                  {w}
                  <button onClick={() => removeDont(w)} className="opacity-60 hover:opacity-100" aria-label={`Remove ${w}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
