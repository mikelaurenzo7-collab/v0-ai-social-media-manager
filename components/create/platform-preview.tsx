'use client'

import { cn } from '@/lib/utils'
import { PLATFORMS, type PlatformId } from '@/lib/constants/platforms'
import { PlatformIcon } from './platform-selector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PlatformPreviewProps {
  content: string
  hashtags: string[]
  platforms: PlatformId[]
}

export function PlatformPreview({ content, hashtags, platforms }: PlatformPreviewProps) {
  const hashtagString = hashtags.map((t) => `#${t}`).join(' ')
  const fullContent = hashtags.length > 0 ? `${content}\n\n${hashtagString}` : content

  if (platforms.length === 0) return null

  return (
    <Tabs defaultValue={platforms[0]} className="w-full">
      <TabsList className="w-full justify-start">
        {platforms.map((platformId) => (
          <TabsTrigger key={platformId} value={platformId} className="gap-2">
            <PlatformIcon platform={platformId} className="h-4 w-4" />
            {PLATFORMS[platformId].shortName}
          </TabsTrigger>
        ))}
      </TabsList>

      {platforms.map((platformId) => (
        <TabsContent key={platformId} value={platformId} className="mt-4">
          {platformId === 'twitter' && <TwitterPreview content={fullContent} />}
          {platformId === 'instagram' && <InstagramPreview content={fullContent} />}
          {platformId === 'facebook' && <FacebookPreview content={fullContent} />}
          {platformId === 'linkedin' && <LinkedInPreview content={fullContent} />}
          {platformId === 'tiktok' && <TikTokPreview content={content} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}

function TwitterPreview({ content }: { content: string }) {
  const charCount = content.length
  const isOver = charCount > 280
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/40" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-bold">Your Brand</span>
            <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.52 3.59a3.34 3.34 0 0 1 6.96 0c1.2.07 2.29.69 3.06 1.86a3.34 3.34 0 0 1 4.52 4.52 3.34 3.34 0 0 1 0 4.06 3.34 3.34 0 0 1-4.52 4.52 3.34 3.34 0 0 1-4.06 0 3.34 3.34 0 0 1-4.52-4.52c-.07-1.2-.69-2.29-1.86-3.06a3.34 3.34 0 0 1 0-4.92c1.17-.77 1.79-1.86 1.86-3.06Z M10.47 12.97l2.91-4.65a.56.56 0 0 1 .95.59l-3.5 5.6a.56.56 0 0 1-.84.11l-2.1-2.1a.56.56 0 0 1 .79-.79l1.79 1.24Z" />
            </svg>
            <span className="text-muted-foreground">@yourbrand</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">now</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{content}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-4 text-muted-foreground">
              <button className="flex items-center gap-1 text-xs hover:text-blue-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                12
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-green-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                </svg>
                8
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-red-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                42
              </button>
              <button className="flex items-center gap-1 text-xs hover:text-blue-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
            </div>
            <span className={cn('text-xs tabular-nums font-medium', isOver ? 'text-destructive' : charCount > 240 ? 'text-yellow-500' : 'text-muted-foreground')}>
              {charCount}/280
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstagramPreview({ content }: { content: string }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
        <div className="flex-1">
          <p className="text-sm font-semibold">yourbrand</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-sm">Your image here</p>
        </div>
      </div>
      <div className="flex items-center gap-4 p-3">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        <svg className="ml-auto h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      </div>
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold">yourbrand</span>{' '}
          <span className="whitespace-pre-wrap">{content}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">View all 24 comments</p>
        <p className="mt-1 text-xs text-muted-foreground uppercase">Just now</p>
      </div>
    </div>
  )
}

function FacebookPreview({ content }: { content: string }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full bg-[#1877F2]" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Your Brand</p>
          <p className="text-xs text-muted-foreground">Just now · 🌐 Public</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap text-sm">{content}</p>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="h-4 w-4 rounded-full bg-blue-500 ring-1 ring-white" />
            <div className="h-4 w-4 rounded-full bg-red-500 ring-1 ring-white" />
          </div>
          <span>125</span>
        </div>
        <div className="flex gap-3">
          <span>12 comments</span>
          <span>3 shares</span>
        </div>
      </div>
      <div className="flex border-t">
        {(['Like', 'Comment', 'Share'] as const).map((label) => (
          <button key={label} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:bg-muted">
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function LinkedInPreview({ content }: { content: string }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-start gap-3 p-4">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[#0A66C2]" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Your Name</p>
          <p className="text-xs text-muted-foreground">Your Title · Just now</p>
          <p className="text-xs text-muted-foreground">🌐 Anyone</p>
        </div>
        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      </div>
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0A66C2]">
            <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
            </svg>
          </div>
          <span>247 reactions</span>
        </div>
        <div className="flex gap-3">
          <span>18 comments</span>
          <span>5 reposts</span>
        </div>
      </div>
      <div className="flex border-t">
        {(['Like', 'Comment', 'Repost', 'Send'] as const).map((label) => (
          <button key={label} className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium text-muted-foreground hover:bg-muted">
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TikTokPreview({ content }: { content: string }) {
  const hook = content.slice(0, 125)
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Video area */}
      <div className="relative aspect-[9/16] max-h-72 bg-gradient-to-b from-neutral-900 to-black flex items-end">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/40">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            <p className="text-xs">Your video here</p>
          </div>
        </div>
        {/* On-screen hook text overlay */}
        {hook && (
          <div className="absolute inset-x-0 top-1/3 px-4">
            <p className="text-white text-sm font-bold text-center leading-tight line-clamp-3 drop-shadow-lg">
              {hook}
            </p>
          </div>
        )}
        {/* Right-side action buttons */}
        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <span className="text-white text-[10px]">24.5K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
            </div>
            <span className="text-white text-[10px]">1.2K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <span className="text-white text-[10px]">Share</span>
          </div>
        </div>
        {/* Bottom info */}
        <div className="relative z-10 w-full px-3 pb-3">
          <p className="text-white text-xs font-semibold">@yourbrand</p>
          <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{content}</p>
          <div className="mt-1 flex items-center gap-1">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" stroke="none"/>
            </svg>
            <p className="text-white/70 text-[10px]">Trending Sound Name</p>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground border-t">
        <span className="font-medium">Caption preview</span>
        <span className={cn('tabular-nums', content.length > 150 ? 'text-yellow-500' : '')}>{content.length}/150</span>
      </div>
    </div>
  )
}
