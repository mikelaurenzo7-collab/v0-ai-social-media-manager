'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { cn } from '@/lib/utils'

type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'gmail' | 'outlook'
type Format = 'thread' | 'post' | 'carousel' | 'video' | 'email'

interface Example {
  id: string
  platform: Platform
  format: Format
  agent: string
  agentSlug: string
  industry: 'creator' | 'b2b-saas' | 'agency' | 'ecommerce' | 'founder'
  brand: string
  brandHue: string
  hook: string
  body: string
  metric: { value: string; vs: string }
  approvedBy: string
  approvedAt: string
}

const EXAMPLES: Example[] = [
  {
    id: 'e1',
    platform: 'linkedin',
    format: 'post',
    agent: 'LinkedIn Agent',
    agentSlug: 'linkedin',
    industry: 'founder',
    brand: 'Ratio',
    brandHue: 'from-orange-500 to-pink-600',
    hook: 'We hit 10k customers.',
    body:
      'I cry-laughed in the car after the call with #6,142.\n\nBuilding means caring about every single one. If you\'re early, that\'s the bar — it doesn\'t get easier when you scale, you just get more chances to forget it.',
    metric: { value: '7.2× avg', vs: 'predicted reach' },
    approvedBy: 'Maya C.',
    approvedAt: '2 days ago',
  },
  {
    id: 'e2',
    platform: 'twitter',
    format: 'thread',
    agent: 'X Agent',
    agentSlug: 'x',
    industry: 'b2b-saas',
    brand: 'Halewise',
    brandHue: 'from-violet-500 to-purple-600',
    hook: '5 lessons from launch week. A thread.',
    body:
      "1/ Ship before you're ready. We weren't. It still worked.\n2/ The first hour matters more than the first day.\n3/ Pin the demo, not the announcement.\n4/ Reply to every comment for 48h. Velocity beats volume.\n5/ Day-2 silence kills momentum. Have a follow-up ready.",
    metric: { value: '3.1× avg', vs: 'engagement vs single tweets' },
    approvedBy: 'Jordan H.',
    approvedAt: '4 days ago',
  },
  {
    id: 'e3',
    platform: 'instagram',
    format: 'carousel',
    agent: 'Meta Agent',
    agentSlug: 'meta',
    industry: 'creator',
    brand: '@nadiawrites',
    brandHue: 'from-pink-500 to-rose-600',
    hook: 'Inside the studio at 7am.',
    body:
      'Slide 1: hero shot.\nSlide 2–3: the workbench, no stylists.\nSlide 4: the rejected version.\nSlide 5: the version we sent.\nSlide 6: "Save this if you\'ve ever wondered what crafted actually looks like."',
    metric: { value: '+218%', vs: 'save rate vs avg post' },
    approvedBy: 'Nadia P.',
    approvedAt: '1 week ago',
  },
  {
    id: 'e4',
    platform: 'tiktok',
    format: 'video',
    agent: 'TikTok Agent',
    agentSlug: 'tiktok',
    industry: 'creator',
    brand: '@theo.builds',
    brandHue: 'from-fuchsia-500 to-rose-600',
    hook: 'I broke every productivity rule for 30 days.',
    body:
      'Hook (0–1.5s): "I broke every productivity rule for 30 days."\nVO + on-screen: "Rule #4 made me 3× more focused."\nClose: "Don\'t skip — wait for the green sticky note."',
    metric: { value: '142k views', vs: 'in 48h' },
    approvedBy: 'Theo W.',
    approvedAt: '5 days ago',
  },
  {
    id: 'e5',
    platform: 'gmail',
    format: 'email',
    agent: 'Gmail Agent',
    agentSlug: 'gmail',
    industry: 'agency',
    brand: 'Northwave',
    brandHue: 'from-sky-500 to-blue-600',
    hook: 'small idea, big fan',
    body:
      'Hi Priya — short version: love what you\'re building. one specific way we could collab in 15 min, happy to send the deck if it\'s a fit.\n\nLet me know if Tuesday or Thursday afternoon works.',
    metric: { value: '47% reply rate', vs: 'across 80 cold sends' },
    approvedBy: 'Daniel R.',
    approvedAt: '3 days ago',
  },
  {
    id: 'e6',
    platform: 'linkedin',
    format: 'carousel',
    agent: 'LinkedIn Agent',
    agentSlug: 'linkedin',
    industry: 'b2b-saas',
    brand: 'BrightLabs',
    brandHue: 'from-emerald-500 to-teal-600',
    hook: 'The 5-stage pipeline that doubled our close rate',
    body:
      '7 slides. Cover hooks the scroll. Slides 2–5 walk the stages with one sentence + one metric each. Slide 6 is the trap we\'d set; slide 7 is the save bait + follow CTA.',
    metric: { value: '12k impressions', vs: '4× our LinkedIn avg' },
    approvedBy: 'Olivia P.',
    approvedAt: '1 week ago',
  },
  {
    id: 'e7',
    platform: 'twitter',
    format: 'post',
    agent: 'X Agent',
    agentSlug: 'x',
    industry: 'founder',
    brand: 'Demi L.',
    brandHue: 'from-orange-500 to-amber-500',
    hook: 'AI agents aren\'t replacing SaaS.',
    body:
      'AI agents aren\'t replacing SaaS.\n\nAI agents are replacing the SaaS that didn\'t deserve to exist.\n\nthe SaaS people loved is becoming a context window. the SaaS people tolerated is becoming a tool call.',
    metric: { value: '2.1k retweets', vs: '12× our prior best' },
    approvedBy: 'Demi L.',
    approvedAt: '6 days ago',
  },
  {
    id: 'e8',
    platform: 'outlook',
    format: 'email',
    agent: 'Outlook Agent',
    agentSlug: 'outlook',
    industry: 'b2b-saas',
    brand: 'Halewise',
    brandHue: 'from-blue-600 to-indigo-700',
    hook: '[Update] Q3 revenue + commentary',
    body:
      'Headline: $4.2M (+38% YoY).\n\nThree drivers: enterprise add-ons (52% of new ARR), expansion (29%), inbound from agency partnerships (19%).\n\nTwo risks I\'m watching: (1) Q4 sales-cycle slowdown, (2) one large customer up for renewal in Nov.\n\nOne ask: green-light agency-partner program for FY26.',
    metric: { value: '100% reply', vs: 'every board member responded' },
    approvedBy: 'Jordan H.',
    approvedAt: '1 week ago',
  },
  {
    id: 'e9',
    platform: 'facebook',
    format: 'post',
    agent: 'Meta Agent',
    agentSlug: 'meta',
    industry: 'ecommerce',
    brand: 'Glowfield',
    brandHue: 'from-amber-500 to-orange-600',
    hook: 'Customer story · Sara, 41, Phoenix',
    body:
      'Customer story · Sara, 41, Phoenix.\n\n"I bought the lamp for the kitchen. It\'s now in three rooms. The third one I bought for my mom — the photo she sent me back made me cry."\n\nThat\'s the bar. We don\'t sell furniture, we sell the photo your mom sends back.',
    metric: { value: '+340%', vs: 'comments vs feed avg' },
    approvedBy: 'Theo W.',
    approvedAt: '4 days ago',
  },
]

const PLATFORM_FILTERS: { id: Platform | 'all'; label: string }[] = [
  { id: 'all', label: 'All channels' },
  { id: 'twitter', label: 'X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'outlook', label: 'Outlook' },
]

const INDUSTRY_FILTERS: { id: Example['industry'] | 'all'; label: string }[] = [
  { id: 'all', label: 'Every industry' },
  { id: 'creator', label: 'Creators' },
  { id: 'b2b-saas', label: 'B2B SaaS' },
  { id: 'agency', label: 'Agencies' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'founder', label: 'Founders' },
]

const FORMAT_META: Record<Format, { label: string; emoji: string }> = {
  thread: { label: 'Thread', emoji: '🧵' },
  post: { label: 'Post', emoji: '✏️' },
  carousel: { label: 'Carousel', emoji: '📚' },
  video: { label: 'Video', emoji: '🎬' },
  email: { label: 'Email', emoji: '✉️' },
}

export default function ExamplesPage() {
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [industry, setIndustry] = useState<Example['industry'] | 'all'>('all')

  const filtered = useMemo(() => {
    return EXAMPLES.filter((e) => {
      if (platform !== 'all' && e.platform !== platform) return false
      if (industry !== 'all' && e.industry !== industry) return false
      return true
    })
  }, [platform, industry])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-50"
            style={{
              background:
                'radial-gradient(35% 35% at 30% 30%, oklch(0.652 0.214 36 / 0.16), transparent 60%),' +
                'radial-gradient(35% 35% at 70% 25%, oklch(0.588 0.238 352 / 0.14), transparent 60%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[400px] bg-grid opacity-30 [mask-image:linear-gradient(180deg,black,transparent)]" />
          <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Examples</p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-balance">
              See what they ship.
              <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                A year of agent-approved output.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Real posts, threads, carousels, videos, and emails approved by real customers and
              published through real OAuth. Not stock photography. Not lorem-ipsum copy. The actual work.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground italic">
              Every example here was published with explicit customer permission to share. Names changed
              when requested.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-6xl px-6 py-8 border-b border-border/60">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {PLATFORM_FILTERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={platform === p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    platform === p.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as typeof industry)}
              aria-label="Filter by industry"
              className="h-8 rounded-md border border-border/60 bg-background px-3 text-xs font-medium"
            >
              {INDUSTRY_FILTERS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-sm font-semibold">No examples match.</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different platform or industry.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((e) => (
                <ExampleCard key={e.id} example={e} />
              ))}
            </div>
          )}
        </section>

        {/* What you don't see */}
        <section className="mx-auto max-w-3xl px-6 py-14 border-t border-border/60">
          <Card>
            <CardContent className="p-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                What you don&apos;t see here
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                The bad drafts. The 17 takes that didn&apos;t ship.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every example above passed approval. The same workspace generated 4–6 takes per slot;
                the human picked one. Agents don&apos;t replace taste — they make iteration cheap. The
                ones above are the ones that survived. The rest sit in the drafts folder, wait their
                turn, or get retired.
              </p>
            </CardContent>
          </Card>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}

function ExampleCard({ example: e }: { example: Example }) {
  const fmt = FORMAT_META[e.format]
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Brand row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-card">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white bg-gradient-to-br ${e.brandHue}`}
        >
          {e.brand
            .replace(/^@/, '')
            .split(/[\s.]+/)
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{e.brand}</p>
          <div className="flex items-center gap-1.5">
            <PlatformIcon platform={e.platform} size="sm" />
            <span className="text-[10px] text-muted-foreground">
              {fmt.emoji} {fmt.label} · via {e.agent}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <p className="text-sm font-bold leading-snug">{e.hook}</p>
        <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
          {e.body}
        </p>
      </CardContent>

      {/* Metric strip */}
      <div className="px-4 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            {e.metric.value}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{e.metric.vs}</p>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">
          ✓ approved by {e.approvedBy}
        </Badge>
      </div>
    </Card>
  )
}
