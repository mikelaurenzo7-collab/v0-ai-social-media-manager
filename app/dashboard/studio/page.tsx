'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type Format = 'post' | 'thread' | 'carousel' | 'video' | 'image' | 'email'

interface FormatToggle {
  id: Format
  label: string
  desc: string
  emoji: string
  agent: string
}

const FORMATS: FormatToggle[] = [
  { id: 'post', label: 'Single post', desc: 'X / LinkedIn / Instagram caption', emoji: '✏️', agent: 'X Agent' },
  { id: 'thread', label: 'Thread', desc: 'Multi-tweet / multi-post breakdown', emoji: '🧵', agent: 'X Agent' },
  { id: 'carousel', label: 'Carousel', desc: '5–10 slide storyboard', emoji: '📚', agent: 'Meta Agent' },
  { id: 'video', label: 'Video script', desc: 'Hook + shot list + VO + on-screen text', emoji: '🎬', agent: 'TikTok Agent' },
  { id: 'image', label: 'Image brief', desc: 'Subject, composition, palette', emoji: '🎨', agent: 'Any agent' },
  { id: 'email', label: 'Email', desc: 'Cold outreach, follow-up, executive note', emoji: '✉️', agent: 'Gmail / Outlook Agent' },
]

const SAMPLE_OUTPUT = {
  post: {
    platform: 'LinkedIn',
    text:
      'We hit 10k customers this morning.\n\nI cry-laughed in the car after the call with #6,142.\n\nBuilding means caring about every single one. If you\'re early, that\'s the bar — it doesn\'t get any easier when you scale, you just get more chances to forget it.',
    hook: 'Personal milestone',
    metrics: { hookScore: 8.4, predictedReach: '7.2× avg', readability: 'Grade 6' },
    hashtags: ['#buildinpublic', '#startups', '#founders'],
  },
  thread: {
    platform: 'X',
    tweets: [
      '5 lessons from launch week. A thread.',
      '1/ Ship before you\'re ready. We weren\'t. It still worked.',
      '2/ The first hour matters more than the first day.',
      '3/ Pin the demo, not the announcement.',
      '4/ Reply to every comment for 48h. Velocity beats volume.',
      '5/ Day-2 silence kills momentum. Have a follow-up ready.',
    ],
  },
  carousel: {
    platform: 'Instagram',
    title: 'Inside our launch week',
    slides: [
      { type: 'cover', headline: '5 launch-week lessons', body: 'No fluff. The stuff we actually learned.' },
      { type: 'value', headline: 'Ship before you\'re ready', body: 'We weren\'t. It still worked.' },
      { type: 'value', headline: 'First hour > first day', body: 'Pin the demo. Reply for 48h.' },
      { type: 'example', headline: 'Day-2 silence kills', body: 'Have a follow-up ready before you launch.' },
      { type: 'cta', headline: 'Save this for your launch', body: 'Follow for the post-mortem next week →' },
    ],
    saveBait: 'Save for the day before your next launch.',
  },
  video: {
    platform: 'TikTok',
    duration: '24s',
    hook: '"They told us not to launch on a Tuesday. We launched on a Tuesday."',
    shots: [
      { duration: '0–3s', text: 'They told us not to launch on a Tuesday.', vo: null },
      { duration: '3–10s', text: 'Reasons everyone gives.', vo: 'No press. No buzz. Wrong news cycle.' },
      { duration: '10–18s', text: 'Here\'s what actually happened.', vo: 'We hit our 90-day goal in the first afternoon.' },
      { duration: '18–24s', text: 'Tuesday. Don\'t skip it.', vo: 'Save this for your launch checklist.' },
    ],
    audio: 'Trending: "calm-piano-crescendo"',
  },
  image: {
    aspectRatio: '4:5',
    subject: 'Hands holding a notebook with the number 10,000 written in marker; warm window light from the right',
    composition: 'Top-down shot, hands enter from bottom of frame, notebook centered with white space above for caption',
    style: ['warm natural light', 'shallow depth of field', 'minimal staging', 'human texture'],
    palette: ['#1A120E', '#EA580C', '#DB2777', '#FCD7A1'],
    overlay: '10,000',
  },
  email: {
    subject: 'small idea, big fan',
    body:
      'Hi Priya,\n\nshort version — love what you\'re building. one specific way we could collab in 15 min, happy to send the deck if it\'s a fit.\n\nLet me know if Tuesday or Thursday afternoon works.\n\n—',
  },
} as const

export default function StudioPage() {
  const [prompt, setPrompt] = useState(
    "Our launch week lessons. Personal voice. Grounded, no hype. We hit 10k customers and I want it to feel earned.",
  )
  const [enabled, setEnabled] = useState<Record<Format, boolean>>({
    post: true,
    thread: true,
    carousel: true,
    video: true,
    image: true,
    email: false,
  })
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)

  function toggle(id: Format) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function generate() {
    if (!prompt.trim()) {
      toast.error('Add a prompt — what should agents make from?')
      return
    }
    if (!Object.values(enabled).some(Boolean)) {
      toast.error('Pick at least one format')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setGenerated(true)
      setGenerating(false)
      toast.success('Studio remix ready', {
        description: 'Your agents collaborated. Open any output to refine.',
      })
    }, 1100)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Creative Studio"
        description="One prompt. Every format. Each channel agent contributes its own take — you pick what ships."
        action={
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
            Multi-agent · in preview
          </Badge>
        }
      />

      <div className="p-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* LEFT — Prompt + format toggles */}
        <div className="space-y-5 lg:sticky lg:top-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your seed</CardTitle>
              <CardDescription>One prompt — agents read your Brand Kit and tailor each format.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="seed" className="sr-only">
                Seed prompt
              </Label>
              <Textarea
                id="seed"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="What story or idea are we working with? Speak naturally — agents will translate."
                className="text-sm"
              />
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={generate}
                  disabled={generating}
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  {generating ? 'Remixing…' : '✨ Remix into selected formats'}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Tip: paste a transcript, a customer quote, a journal entry, or a screenshot caption.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formats</CardTitle>
              <CardDescription>Toggle what each channel agent should produce.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {FORMATS.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                    enabled[f.id] ? 'border-orange-500 bg-orange-500/5' : 'border-border/60 bg-card',
                  )}
                >
                  <span className="text-2xl shrink-0">{f.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {f.desc} · <span className="italic">{f.agent}</span>
                    </p>
                  </div>
                  <Switch
                    checked={enabled[f.id]}
                    onCheckedChange={() => toggle(f.id)}
                    aria-label={`Enable ${f.label}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Outputs */}
        <div className="space-y-6">
          {!generated ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                  🪄
                </div>
                <p className="text-sm font-bold">Ready when you are</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  Click <strong>Remix</strong> on the left. Your channel agents will collaborate on whichever
                  formats you toggled on. Each one inherits the Brand Kit, your voice samples, and any per-agent
                  customization.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {enabled.post && <PostOutput />}
              {enabled.thread && <ThreadOutput />}
              {enabled.carousel && <CarouselOutput />}
              {enabled.video && <VideoOutput />}
              {enabled.image && <ImageOutput />}
              {enabled.email && <EmailOutput />}
              <SyncFooter />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OutputShell({
  agent,
  emoji,
  title,
  meta,
  children,
  href,
}: {
  agent: string
  emoji: string
  title: string
  meta: string
  children: React.ReactNode
  href?: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{emoji}</span>
          <p className="text-sm font-bold">{title}</p>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {agent}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{meta}</span>
          {href && (
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href={href}>Open in agent →</Link>
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-5 space-y-3">{children}</CardContent>
      <div className="px-5 pb-4 pt-0 flex items-center gap-2">
        <Button size="sm" className="text-xs" style={{ background: 'var(--brand-gradient)' }}>
          Send to Approvals
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          Refine
        </Button>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Save as template
        </Button>
      </div>
    </Card>
  )
}

function PostOutput() {
  const p = SAMPLE_OUTPUT.post
  return (
    <OutputShell agent="LinkedIn Agent" emoji="✏️" title="Single post" meta={`Hook: ${p.hook}`} href="/dashboard/agents/linkedin">
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{p.text}</p>
      <div className="flex flex-wrap gap-1">
        {p.hashtags.map((h) => (
          <span key={h} className="rounded-full bg-muted text-[10px] font-mono text-muted-foreground px-1.5 py-0.5">
            {h}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hook</p>
          <p className="text-sm font-bold tabular-nums">{p.metrics.hookScore}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Predicted</p>
          <p className="text-sm font-bold text-emerald-600">{p.metrics.predictedReach}</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Readability</p>
          <p className="text-sm font-bold">{p.metrics.readability}</p>
        </div>
      </div>
    </OutputShell>
  )
}

function ThreadOutput() {
  const t = SAMPLE_OUTPUT.thread
  return (
    <OutputShell agent="X Agent" emoji="🧵" title="Thread" meta={`${t.tweets.length} tweets`} href="/dashboard/agents/x">
      <div className="space-y-2">
        {t.tweets.map((tweet, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">{tweet}</p>
            </div>
            <p className="mt-1.5 text-[10px] tabular-nums text-muted-foreground text-right">
              {tweet.length}/280
            </p>
          </div>
        ))}
      </div>
    </OutputShell>
  )
}

function CarouselOutput() {
  const c = SAMPLE_OUTPUT.carousel
  return (
    <OutputShell agent="Meta Agent" emoji="📚" title={c.title} meta={`${c.slides.length} slides · IG`} href="/dashboard/agents/meta">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {c.slides.map((s, i) => (
            <div
              key={i}
              className="w-44 shrink-0 rounded-xl border border-border/60 p-3 bg-gradient-to-br from-orange-500/5 to-pink-500/5 flex flex-col"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {i + 1} · {s.type}
              </span>
              <p className="text-sm font-bold leading-snug">{s.headline}</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] italic text-muted-foreground">💾 {c.saveBait}</p>
    </OutputShell>
  )
}

function VideoOutput() {
  const v = SAMPLE_OUTPUT.video
  return (
    <OutputShell agent="TikTok Agent" emoji="🎬" title="Video script" meta={`${v.platform} · ${v.duration}`} href="/dashboard/agents/tiktok">
      <p className="text-sm font-bold leading-snug">🎬 {v.hook}</p>
      <div className="space-y-2">
        {v.shots.map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                Shot {i + 1} · {s.duration}
              </span>
            </div>
            <p className="text-xs font-semibold">📺 {s.text}</p>
            {s.vo && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                <span className="font-bold uppercase tracking-widest text-[9px] mr-1.5">VO</span>
                {s.vo}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground italic">{v.audio}</p>
    </OutputShell>
  )
}

function ImageOutput() {
  const i = SAMPLE_OUTPUT.image
  return (
    <OutputShell agent="Meta Agent" emoji="🎨" title="Image brief" meta={`Aspect ${i.aspectRatio}`}>
      <div className="rounded-xl overflow-hidden border border-border/60">
        <div className="aspect-[4/5] flex items-center justify-center bg-gradient-to-br from-orange-500/15 via-pink-500/10 to-violet-500/15 relative">
          <span className="text-6xl opacity-60">🎨</span>
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/45 px-3 py-2 text-center text-white backdrop-blur-sm">
            <p className="text-2xl font-black tracking-tight">{i.overlay}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</p>
        <p className="text-xs leading-relaxed">{i.subject}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Composition</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{i.composition}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Style</p>
          <div className="flex flex-wrap gap-1">
            {i.style.map((s) => (
              <span key={s} className="rounded-full bg-muted text-[9px] font-semibold uppercase tracking-widest text-muted-foreground px-1.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Palette</p>
          <div className="flex gap-1">
            {i.palette.map((hex) => (
              <div key={hex} className="flex-1">
                <div className="h-7 rounded-md ring-1 ring-border/50" style={{ background: hex }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </OutputShell>
  )
}

function EmailOutput() {
  const e = SAMPLE_OUTPUT.email
  return (
    <OutputShell agent="Gmail Agent" emoji="✉️" title="Email draft" meta="Cold intro" href="/dashboard/agents/gmail">
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border/40 text-[11px] text-muted-foreground">
          <strong className="text-foreground">Subject:</strong> {e.subject}
        </div>
        <pre className="px-3 py-2 text-[12.5px] font-mono leading-relaxed whitespace-pre-wrap text-foreground/90">
          {e.body}
        </pre>
      </div>
    </OutputShell>
  )
}

function SyncFooter() {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: 'linear-gradient(135deg, oklch(0.652 0.214 36 / 0.06), oklch(0.588 0.238 352 / 0.04))',
        borderColor: 'oklch(0.652 0.214 36 / 0.25)',
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">
        Studio handoff
      </p>
      <p className="mt-1 text-sm font-bold">Send everything to one place</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-2xl">
        Drop the whole remix into the Pipeline as one campaign card. Each format becomes its own
        approval; the Brand Kit travels with them; analytics roll up under one banner.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" style={{ background: 'var(--brand-gradient)' }}>
          Send all to Pipeline
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/approvals">Open Approvals →</Link>
        </Button>
      </div>
    </div>
  )
}
