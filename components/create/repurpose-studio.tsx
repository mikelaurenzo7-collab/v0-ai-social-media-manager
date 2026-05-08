'use client'

import { useState, useCallback } from 'react'
import { experimental_useObject } from '@ai-sdk/react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/dashboard/header'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Schema mirrors the API ────────────────────────────────────────────────────

const repurposeSchema = z.object({
  key_insight: z.string().optional(),
  suggested_hook: z.string().optional(),
  twitter_thread: z
    .object({
      tweets: z.array(z.object({ n: z.number().optional(), content: z.string().optional() })).optional(),
    })
    .optional(),
  linkedin: z
    .object({ full_post: z.string().optional(), hashtags: z.array(z.string()).optional() })
    .optional(),
  instagram: z
    .object({
      caption: z.string().optional(),
      carousel_titles: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
    })
    .optional(),
  tiktok: z
    .object({
      hook: z.string().optional(),
      script_beats: z
        .array(z.object({ timing: z.string().optional(), direction: z.string().optional() }))
        .optional(),
      caption: z.string().optional(),
      on_screen_text: z.string().optional(),
    })
    .optional(),
  facebook: z.object({ post: z.string().optional() }).optional(),
})

type RepurposeOutput = z.infer<typeof repurposeSchema>

// ── Constants ─────────────────────────────────────────────────────────────────

const SOURCE_TYPES = [
  { value: 'blog_post', label: 'Blog Post' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'youtube_transcript', label: 'YouTube Transcript' },
  { value: 'podcast_notes', label: 'Podcast Notes' },
  { value: 'article', label: 'Article' },
  { value: 'tweet', label: 'Tweet / Short Post' },
  { value: 'idea', label: 'Idea / Concept' },
] as const

const PLATFORM_TABS = [
  { id: 'twitter', label: 'X Thread', color: '#1D9BF0', emoji: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', emoji: 'in' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸' },
  { id: 'tiktok', label: 'TikTok', color: '#6366F1', emoji: '▶' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', emoji: 'f' },
] as const

type PlatformTab = (typeof PLATFORM_TABS)[number]['id']

// ── Copy helper ───────────────────────────────────────────────────────────────

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = useCallback(
    (text: string, key: string) => {
      if (!navigator.clipboard?.writeText) {
        toast.error('Clipboard is not available in this browser.')
        return
      }
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedKey(key)
          toast.success('Copied to clipboard')
          setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000)
        })
        .catch(() => {
          toast.error('Unable to copy to clipboard.')
        })
    },
    []
  )
  return { copiedKey, copy }
}

// ── Skeleton lines ────────────────────────────────────────────────────────────

function SkeletonLines({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-muted/70"
          style={{ width: `${75 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  )
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text, id }: { text: string; id: string }) {
  const { copiedKey, copy } = useCopy()
  return (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copiedKey === id ? (
        <>
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

// ── Platform output panels ────────────────────────────────────────────────────

function TwitterOutput({ data }: { data: RepurposeOutput['twitter_thread'] }) {
  const tweets = data?.tweets ?? []
  if (!tweets.length) return <SkeletonLines count={6} />
  return (
    <div className="space-y-3">
      {tweets.map((tweet, i) => (
        <div key={i} className="group relative rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              {tweet.n ?? i + 1}
            </span>
            <p className="flex-1 text-sm leading-relaxed text-foreground">{tweet.content}</p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {(tweet.content?.length ?? 0)} / 280
            </span>
            <CopyButton text={tweet.content ?? ''} id={`tweet-${i}`} />
          </div>
        </div>
      ))}
      <CopyButton
        text={tweets.map((t, i) => `${i + 1}/${tweets.length} ${t.content}`).join('\n\n')}
        id="full-thread"
      />
    </div>
  )
}

function LinkedInOutput({ data }: { data: RepurposeOutput['linkedin'] }) {
  if (!data?.full_post) return <SkeletonLines count={8} />
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.full_post}</p>
      </div>
      {data.hashtags && data.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.hashtags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      <CopyButton
        text={[data.full_post, '', ...(data.hashtags?.map((h) => `#${h}`) ?? [])].join('\n')}
        id="linkedin-post"
      />
    </div>
  )
}

function InstagramOutput({ data }: { data: RepurposeOutput['instagram'] }) {
  if (!data?.caption) return <SkeletonLines count={6} />
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.caption}</p>
      </div>
      {data.carousel_titles && data.carousel_titles.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Carousel Slide Titles
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.carousel_titles.map((title, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-gradient-to-r from-pink-500/10 to-orange-500/10 px-3 py-2"
              >
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-foreground">{title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.hashtags && data.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.hashtags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
      <CopyButton
        text={[data.caption, '', ...(data.hashtags?.map((h) => `#${h}`) ?? [])].join('\n')}
        id="instagram-post"
      />
    </div>
  )
}

function TikTokOutput({ data }: { data: RepurposeOutput['tiktok'] }) {
  if (!data?.hook) return <SkeletonLines count={6} />
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 p-4 dark:border-violet-800/40 dark:bg-violet-950/20">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Opening Hook (0-3s)
        </p>
        <p className="text-sm font-semibold text-foreground">&ldquo;{data.hook}&rdquo;</p>
      </div>

      {data.script_beats && data.script_beats.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Script Breakdown
          </p>
          <div className="space-y-2">
            {data.script_beats.map((beat, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="shrink-0 text-[10px] font-mono font-bold text-violet-500 mt-0.5 w-14">
                  {beat.timing}
                </span>
                <p className="text-xs text-foreground">{beat.direction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.on_screen_text && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            On-Screen Text Overlay
          </p>
          <p className="text-sm font-bold text-foreground">{data.on_screen_text}</p>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Caption
        </p>
        <p className="text-sm text-foreground">{data.caption}</p>
      </div>

      <CopyButton
        text={[
          `Hook: "${data.hook}"`,
          '',
          'Script:',
          ...(data.script_beats?.map((b) => `[${b.timing}] ${b.direction}`) ?? []),
          '',
          `Caption: ${data.caption}`,
        ].join('\n')}
        id="tiktok-script"
      />
    </div>
  )
}

function FacebookOutput({ data }: { data: RepurposeOutput['facebook'] }) {
  if (!data?.post) return <SkeletonLines count={5} />
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.post}</p>
      </div>
      <CopyButton text={data.post} id="facebook-post" />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RepurposeStudio() {
  const [content, setContent] = useState('')
  const [sourceType, setSourceType] = useState<string>('blog_post')
  const [niche, setNiche] = useState('')
  const [activeTab, setActiveTab] = useState<PlatformTab>('twitter')

  const { object, submit, isLoading, stop } = experimental_useObject({
    api: '/api/repurpose',
    schema: repurposeSchema,
    onFinish: () => {
      toast.success('Content repurposed across all 5 platforms!')
    },
    onError: () => {
      toast.error('Failed to repurpose content. Please try again.')
    },
  })

  // True when any partial output has arrived — keeps the panel visible after Stop
  const hasOutput = Boolean(
    object?.key_insight ||
    object?.suggested_hook ||
    object?.twitter_thread?.tweets?.length ||
    object?.linkedin?.full_post ||
    object?.linkedin?.hashtags?.length ||
    object?.instagram?.caption ||
    object?.instagram?.carousel_titles?.length ||
    object?.instagram?.hashtags?.length ||
    object?.tiktok?.hook ||
    object?.tiktok?.script_beats?.length ||
    object?.tiktok?.caption ||
    object?.tiktok?.on_screen_text ||
    object?.facebook?.post
  )

  const handleSubmit = useCallback(() => {
    if (!content.trim() || content.trim().length < 50) {
      toast.error('Please paste at least 50 characters of source content.')
      return
    }
    submit({ content: content.trim(), sourceType, niche: niche.trim() || undefined })
  }, [content, sourceType, niche, submit])

  const activePlatform = PLATFORM_TABS.find((p) => p.id === activeTab)!
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Repurpose Studio"
        description="Paste any content and instantly transform it into platform-native posts for every channel."
      />

      <div className="p-6 space-y-6">
        {/* Input section */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                    >
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    Source Content
                  </CardTitle>
                  {wordCount > 0 && (
                    <span className="text-xs text-muted-foreground">{wordCount} words</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your blog post, newsletter, YouTube transcript, podcast notes, or any content here…"
                  className="min-h-[280px] resize-none text-sm leading-relaxed font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select value={sourceType} onValueChange={setSourceType} disabled={isLoading}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Your niche (e.g. SaaS, fitness)"
                      className="h-9 text-sm"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {isLoading ? (
                  <Button
                    onClick={stop}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <svg className="h-4 w-4 animate-pulse text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop Generating
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={content.trim().length < 50}
                    className="w-full gap-2 font-bold"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Repurpose Across All Platforms
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Key insight panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/60 shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  AI Extraction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading || object?.key_insight ? (
                  <>
                    <div className="rounded-xl border border-orange-200/60 bg-orange-50/50 p-4 dark:border-orange-800/30 dark:bg-orange-950/20">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                        Key Insight
                      </p>
                      {object?.key_insight ? (
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {object.key_insight}
                        </p>
                      ) : (
                        <SkeletonLines count={3} />
                      )}
                    </div>
                    <div className="rounded-xl border border-violet-200/60 bg-violet-50/50 p-4 dark:border-violet-800/30 dark:bg-violet-950/20">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        Best Hook Formula
                      </p>
                      {object?.suggested_hook ? (
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {object.suggested_hook}
                        </p>
                      ) : (
                        <SkeletonLines count={2} />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">Ready to repurpose</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-[180px]">
                      Paste your content and hit generate to unlock all 5 platforms
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform output tabs */}
        {(isLoading || hasOutput) && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2 flex-wrap">
                {PLATFORM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as PlatformTab)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                      activeTab === tab.id
                        ? 'text-white shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    style={
                      activeTab === tab.id ? { backgroundColor: tab.color } : undefined
                    }
                  >
                    <span className="text-xs font-black">{tab.emoji}</span>
                    {tab.label}
                    {isLoading && activeTab === tab.id && (
                      <span className="flex gap-0.5">
                        {[0, 100, 200].map((d) => (
                          <span
                            key={d}
                            className="h-1 w-1 rounded-full bg-white animate-bounce"
                            style={{ animationDelay: `${d}ms` }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {activeTab === 'twitter' && <TwitterOutput data={object?.twitter_thread} />}
              {activeTab === 'linkedin' && <LinkedInOutput data={object?.linkedin} />}
              {activeTab === 'instagram' && <InstagramOutput data={object?.instagram} />}
              {activeTab === 'tiktok' && <TikTokOutput data={object?.tiktok} />}
              {activeTab === 'facebook' && <FacebookOutput data={object?.facebook} />}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !hasOutput && (
          <div className="grid gap-4 sm:grid-cols-5">
            {PLATFORM_TABS.map((tab) => (
              <div
                key={tab.id}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-muted/20 py-8 text-center"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold"
                  style={{ backgroundColor: tab.color }}
                >
                  {tab.emoji}
                </div>
                <p className="text-xs font-semibold text-foreground">{tab.label}</p>
                <p className="text-[10px] text-muted-foreground">Ready</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
