'use client'

import { cn } from '@/lib/utils'
import { PLATFORMS, type PlatformId } from '@/lib/constants/platforms'
import { PlatformIcon } from './platform-selector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PlatformPreviewProps {
  content: string
  hashtags: string[]
  platforms: PlatformId[]
  /** Real display name for the post author. Defaults to a placeholder. */
  displayName?: string
  /** Real handle (no @). Defaults to a placeholder. */
  userName?: string
}

interface PreviewProps {
  content: string
  displayName: string
  userName: string
}

export function PlatformPreview({
  content,
  hashtags,
  platforms,
  displayName = 'Your Brand',
  userName = 'yourbrand',
}: PlatformPreviewProps) {
  const hashtagString = hashtags.map((t) => `#${t}`).join(' ')
  const fullContent = hashtags.length > 0 ? `${content}\n\n${hashtagString}` : content

  if (platforms.length === 0) return null

  const subprops = { displayName, userName }

  return (
    <Tabs defaultValue={platforms[0]} className="w-full">
      <TabsList className="w-full justify-start bg-muted/40 border border-border/40 p-1">
        {platforms.map((platformId) => (
          <TabsTrigger key={platformId} value={platformId} className="gap-2 text-xs">
            <PlatformIcon platform={platformId} className="h-3.5 w-3.5" />
            {PLATFORMS[platformId].shortName}
          </TabsTrigger>
        ))}
      </TabsList>

      {platforms.map((platformId) => (
        <TabsContent key={platformId} value={platformId} className="mt-4">
          {platformId === 'twitter'   && <TwitterPreview   content={fullContent} {...subprops} />}
          {platformId === 'instagram' && <InstagramPreview content={fullContent} {...subprops} />}
          {platformId === 'facebook'  && <FacebookPreview  content={fullContent} {...subprops} />}
          {platformId === 'linkedin'  && <LinkedInPreview  content={fullContent} {...subprops} />}
          {platformId === 'tiktok'    && <TikTokPreview    content={content}     {...subprops} />}
          <PreviewFooter />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function PreviewFooter() {
  return (
    <p className="mt-2 text-[10px] text-muted-foreground italic text-center">
      Preview only — engagement counts are illustrative and won&apos;t reflect real metrics.
    </p>
  )
}

function TwitterPreview({ content, displayName, userName }: PreviewProps) {
  const charCount = content.length
  const isOver = charCount > 280
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold">{displayName}</span>
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8.52 3.59a3.34 3.34 0 0 1 6.96 0c1.2.07 2.29.69 3.06 1.86a3.34 3.34 0 0 1 4.52 4.52 3.34 3.34 0 0 1 0 4.06 3.34 3.34 0 0 1-4.52 4.52 3.34 3.34 0 0 1-4.06 0 3.34 3.34 0 0 1-4.52-4.52c-.07-1.2-.69-2.29-1.86-3.06a3.34 3.34 0 0 1 0-4.92c1.17-.77 1.79-1.86 1.86-3.06Z M10.47 12.97l2.91-4.65a.56.56 0 0 1 .95.59l-3.5 5.6a.56.56 0 0 1-.84.11l-2.1-2.1a.56.56 0 0 1 .79-.79l1.79 1.24Z" />
            </svg>
            <span className="text-muted-foreground">@{userName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">now</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{content}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-4 text-muted-foreground/60">
              <span className="flex items-center gap-1 text-xs" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                —
              </span>
              <span className="flex items-center gap-1 text-xs" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                —
              </span>
              <span className="flex items-center gap-1 text-xs" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                —
              </span>
            </div>
            <span className={cn('text-xs tabular-nums font-medium', isOver ? 'text-destructive' : charCount > 240 ? 'text-amber-500' : 'text-muted-foreground')}>
              {charCount}/280
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstagramPreview({ content, displayName, userName }: PreviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="h-8 w-8 rounded-full" style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold">{userName}</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="mx-auto h-12 w-12 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-sm opacity-60">Your image here</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-3">
        {[
          "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
          "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z",
          "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
        ].map((path, i) => (
          <svg key={i} className={cn('h-6 w-6', i === 2 && 'ml-auto')} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
          </svg>
        ))}
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </div>
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold">{userName}</span>{' '}
          <span className="whitespace-pre-wrap">{content}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{displayName} · Just now</p>
      </div>
    </div>
  )
}

function FacebookPreview({ content, displayName }: PreviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full" style={{ background: '#1877F2' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">Just now · Public</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-sm">{content}</p>
      </div>
      <div className="flex border-t">
        {(['Like', 'Comment', 'Share'] as const).map((label) => (
          <span
            key={label}
            className="flex flex-1 items-center justify-center gap-2 py-3 text-sm text-muted-foreground/60"
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function LinkedInPreview({ content, displayName }: PreviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div
          className="h-12 w-12 shrink-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">Your Title · Just now</p>
          <p className="text-xs text-muted-foreground">Anyone</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
      <div className="flex border-t">
        {(['Like', 'Comment', 'Repost', 'Send'] as const).map((label) => (
          <span
            key={label}
            className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium text-muted-foreground/60"
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function TikTokPreview({ content, userName }: PreviewProps) {
  const hookChars = Array.from(content)
  const hook = hookChars.slice(0, 125).join('')
  const charCount = hookChars.length
  const isOverMax = charCount > 2200
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Video area */}
      <div className="relative aspect-[9/16] max-h-72 bg-gradient-to-b from-neutral-900 to-black flex items-end">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/30">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            <p className="text-xs">Your video here</p>
          </div>
        </div>
        {hook && (
          <div className="absolute inset-x-0 top-1/3 px-4">
            <p className="text-white text-sm font-bold text-center leading-tight line-clamp-3 drop-shadow-lg">
              {hook}
            </p>
          </div>
        )}
        {/* Bottom info */}
        <div className="relative z-10 w-full px-3 pb-3">
          <p className="text-white text-xs font-semibold">@{userName}</p>
          <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{content}</p>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-t">
        <span className="font-medium">Caption <span className="opacity-60">(optimal ≤150)</span></span>
        <span className={cn('tabular-nums', isOverMax ? 'text-destructive font-medium' : '')}>{charCount}/2200</span>
      </div>
    </div>
  )
}
