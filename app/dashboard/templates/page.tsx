'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'

interface Template {
  id: string
  title: string
  blurb: string
  platform: Platform
  category: 'launch' | 'engagement' | 'thought-leadership' | 'sales' | 'community' | 'recap'
  uses: number
  scaffold: string
  tags: string[]
  builtIn?: boolean
}

const TEMPLATES: Template[] = [
  {
    id: 't-launch-thread',
    title: 'Launch-week thread',
    blurb: 'Five lessons in five tweets. Hook → 4 lessons → CTA.',
    platform: 'twitter',
    category: 'launch',
    uses: 47,
    scaffold:
      "5 lessons from launch week. A thread.\n\n1/ {Lesson #1 — counterintuitive}\n2/ {Lesson #2 — concrete number}\n3/ {Lesson #3 — what surprised you}\n4/ {Lesson #4 — what you'd do again}\n5/ {Closing — one ask or follow CTA}",
    tags: ['launch', 'thread', 'lessons'],
    builtIn: true,
  },
  {
    id: 't-personal-story',
    title: '10k milestone post',
    blurb: 'Personal-voice LinkedIn post — vulnerability beats polish.',
    platform: 'linkedin',
    category: 'thought-leadership',
    uses: 32,
    scaffold:
      "We hit {milestone}.\n\n{Personal moment in plain language — where you were, who you talked to, what you felt.}\n\n{The lesson distilled in one sentence.}",
    tags: ['milestone', 'personal', 'authority'],
    builtIn: true,
  },
  {
    id: 't-bts-carousel',
    title: 'BTS carousel — 6 slides',
    blurb: 'Behind-the-scenes carousel with save-bait close.',
    platform: 'instagram',
    category: 'community',
    uses: 28,
    scaffold:
      'Slide 1: "Inside {your space} at 7am." (hero shot)\nSlide 2–3: the actual workbench, no stylists\nSlide 4: the rejected version\nSlide 5: the version we sent\nSlide 6: "Save this if you\'ve ever wondered what {craft} looks like."',
    tags: ['carousel', 'BTS', 'craft'],
    builtIn: true,
  },
  {
    id: 't-tiktok-rule',
    title: 'I broke every {rule} for 30 days',
    blurb: 'TikTok hook + 3-shot payoff.',
    platform: 'tiktok',
    category: 'engagement',
    uses: 19,
    scaffold:
      'Hook: "I broke every {rule} for 30 days."\nShot 1 (0–3s): on-screen text — "Rule #4 changed everything."\nShot 2 (3–18s): the 3 rules and the surprise outcome\nShot 3 (18–24s): "Don\'t skip — wait for {payoff}." + caption with light irony',
    tags: ['hook', 'series', 'POV'],
    builtIn: true,
  },
  {
    id: 't-cold-intro',
    title: 'Cold intro — small idea, big fan',
    blurb: 'Gmail cold note that earns a reply.',
    platform: 'gmail',
    category: 'sales',
    uses: 64,
    scaffold:
      'subject: small idea, big fan\n\nHi {first name},\n\nshort version — love what you\'re building. one specific way we could collab in 15 min, happy to send the deck if it\'s a fit.\n\nLet me know if {Tuesday} or {Thursday} afternoon works.\n\n— {your name}',
    tags: ['cold', 'partnership', 'short'],
    builtIn: true,
  },
  {
    id: 't-board-update',
    title: '[Update] Q{N} revenue',
    blurb: 'Outlook board update — headline + drivers + ask.',
    platform: 'outlook',
    category: 'sales',
    uses: 11,
    scaffold:
      'Subject: [Update] Q{N} revenue + commentary\n\nHeadline: ${X}M ({+/-}{X}% YoY).\n\nThree drivers:\n1) {driver}\n2) {driver}\n3) {driver}\n\nTwo risks I\'m watching:\n1) {risk}\n2) {risk}\n\nOne ask: {ask in one sentence}.',
    tags: ['executive', 'board', 'briefing'],
    builtIn: true,
  },
  {
    id: 't-friday-recap',
    title: 'Friday recap thread',
    blurb: 'Weekly cadence post for X. Wins / lessons / next week.',
    platform: 'twitter',
    category: 'recap',
    uses: 23,
    scaffold:
      "this week:\n\n→ {one shipping win, with a number}\n→ {one lesson learned the hard way}\n→ {one open question for the audience}\n\nnext week: {one specific commitment}",
    tags: ['weekly', 'cadence', 'recap'],
    builtIn: true,
  },
  {
    id: 't-trend-jump',
    title: 'Pounce on a trend',
    blurb: 'Take + your specific angle on something hot.',
    platform: 'twitter',
    category: 'engagement',
    uses: 9,
    scaffold:
      "everyone\'s talking about {trend}.\n\nthe part nobody\'s saying: {your specific angle, with a number or example}\n\nhere\'s why that matters for {your audience}.",
    tags: ['trend', 'hot-take'],
    builtIn: true,
  },
]

const CATEGORIES: { id: Template['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'launch', label: 'Launch' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'thought-leadership', label: 'Thought leadership' },
  { id: 'sales', label: 'Sales' },
  { id: 'community', label: 'Community' },
  { id: 'recap', label: 'Recap' },
]

export default function TemplatesPage() {
  const [filter, setFilter] = useState<Template['category'] | 'all'>('all')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false
      if (platform !== 'all' && t.platform !== platform) return false
      if (!query) return true
      return (
        t.title.toLowerCase().includes(query) ||
        t.blurb.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [filter, platform, q])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: TEMPLATES.length }
    for (const t of TEMPLATES) c[t.category] = (c[t.category] ?? 0) + 1
    return c
  }, [])

  function copyScaffold(t: Template) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(t.scaffold)
        .then(() => toast.success('Template copied', { description: 'Paste into the composer or Studio.' }))
        .catch(() => toast.error('Could not copy'))
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Templates"
        description="Reusable post structures. Built-in starters today; saved templates you create live alongside."
        action={
          <Button
            size="sm"
            style={{ background: 'var(--brand-gradient)' }}
            onClick={() =>
              toast.message('Save as template', {
                description: 'Send any draft from the composer to Templates — coming next.',
              })
            }
          >
            + New template
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search templates"
              placeholder="Search templates and tags…"
              className="h-9 pl-9 text-sm"
            />
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
            aria-label="Filter by platform"
            className="h-9 rounded-md border border-border/60 bg-background px-3 text-xs font-medium"
          >
            <option value="all">All channels</option>
            <option value="twitter">X</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                filter === c.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              {c.label}
              <span className={cn('ml-1.5 text-[10px] tabular-nums', filter === c.id ? 'opacity-80' : 'opacity-60')}>
                {counts[c.id]}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-sm font-semibold">No templates match.</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different filter or search term.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} onCopy={() => copyScaffold(t)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateCard({ template, onCopy }: { template: Template; onCopy: () => void }) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <PlatformIcon platform={template.platform} size="sm" />
          <p className="text-sm font-bold truncate">{template.title}</p>
        </div>
        {template.builtIn && (
          <Badge variant="outline" className="text-[9px] shrink-0">
            Built-in
          </Badge>
        )}
      </div>
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <p className="text-xs text-muted-foreground leading-relaxed">{template.blurb}</p>
        <pre
          className="rounded-lg border border-border/50 bg-muted/30 p-3 text-[12px] font-mono leading-relaxed text-foreground/85 whitespace-pre-wrap line-clamp-6 max-h-36 overflow-hidden"
          aria-label="Template scaffold preview"
        >
          {template.scaffold}
        </pre>
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted text-[9px] font-semibold uppercase tracking-widest text-muted-foreground px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            asChild
            size="sm"
            className="flex-1 text-xs"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <Link href={`/dashboard/create?topic=${encodeURIComponent(template.title)}`}>
              Use template →
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={onCopy}>
            Copy
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Used {template.uses}× in this workspace</p>
      </CardContent>
    </Card>
  )
}
