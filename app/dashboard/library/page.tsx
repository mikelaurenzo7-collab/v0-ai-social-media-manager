'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type AssetType = 'image' | 'video' | 'gif' | 'template'

interface Asset {
  id: string
  type: AssetType
  name: string
  preview: string // emoji stand-in for thumb in this scaffold
  hue: string
  size: string
  dimensions?: string
  duration?: string
  tags: string[]
  used: number
  uploadedAt: string
}

const SAMPLE: Asset[] = [
  {
    id: 'asset-1',
    type: 'image',
    name: 'Launch hero · v3.png',
    preview: '🚀',
    hue: 'from-orange-500 to-pink-600',
    size: '2.4 MB',
    dimensions: '1920×1080',
    tags: ['launch', 'hero', 'banner'],
    used: 12,
    uploadedAt: '2 days ago',
  },
  {
    id: 'asset-2',
    type: 'image',
    name: 'Studio behind-the-scenes.jpg',
    preview: '🎬',
    hue: 'from-violet-500 to-purple-600',
    size: '1.8 MB',
    dimensions: '1440×1800',
    tags: ['BTS', 'studio', 'team'],
    used: 7,
    uploadedAt: '5 days ago',
  },
  {
    id: 'asset-3',
    type: 'video',
    name: 'Q3 product walkthrough.mp4',
    preview: '🎥',
    hue: 'from-sky-500 to-blue-600',
    size: '24 MB',
    dimensions: '1080×1920',
    duration: '0:42',
    tags: ['product', 'demo', 'walkthrough'],
    used: 4,
    uploadedAt: '1 week ago',
  },
  {
    id: 'asset-4',
    type: 'image',
    name: 'Logo dark · square.png',
    preview: '🟧',
    hue: 'from-zinc-700 to-zinc-900',
    size: '94 KB',
    dimensions: '512×512',
    tags: ['logo', 'brand'],
    used: 89,
    uploadedAt: '3 months ago',
  },
  {
    id: 'asset-5',
    type: 'gif',
    name: 'Loading orange.gif',
    preview: '✨',
    hue: 'from-amber-500 to-orange-600',
    size: '320 KB',
    dimensions: '480×480',
    duration: '2.1s loop',
    tags: ['ui', 'loading', 'web'],
    used: 23,
    uploadedAt: '1 month ago',
  },
  {
    id: 'asset-6',
    type: 'template',
    name: 'Weekly recap thread',
    preview: '🧵',
    hue: 'from-emerald-500 to-teal-600',
    size: '—',
    tags: ['x', 'thread', 'weekly'],
    used: 14,
    uploadedAt: '2 weeks ago',
  },
  {
    id: 'asset-7',
    type: 'template',
    name: 'IG carousel · 5-slide listicle',
    preview: '📚',
    hue: 'from-pink-500 to-rose-600',
    size: '—',
    tags: ['instagram', 'carousel', 'listicle'],
    used: 31,
    uploadedAt: '3 weeks ago',
  },
  {
    id: 'asset-8',
    type: 'image',
    name: 'Customer quote · Maya.png',
    preview: '💬',
    hue: 'from-indigo-500 to-violet-600',
    size: '420 KB',
    dimensions: '1080×1080',
    tags: ['quote', 'social proof'],
    used: 6,
    uploadedAt: '4 days ago',
  },
]

const TYPE_LABEL: Record<AssetType, string> = {
  image: 'Images',
  video: 'Videos',
  gif: 'GIFs',
  template: 'Templates',
}

const TYPE_EMOJI: Record<AssetType, string> = {
  image: '🖼️',
  video: '🎥',
  gif: '✨',
  template: '📝',
}

export default function LibraryPage() {
  const [filter, setFilter] = useState<AssetType | 'all'>('all')
  const [q, setQ] = useState('')

  const counts = useMemo(() => {
    const c: Record<AssetType | 'all', number> = { image: 0, video: 0, gif: 0, template: 0, all: SAMPLE.length }
    for (const a of SAMPLE) c[a.type]++
    return c
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return SAMPLE.filter((a) => {
      if (filter !== 'all' && a.type !== filter) return false
      if (!query) return true
      return (
        a.name.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
      )
    })
  }, [filter, q])

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Asset Library"
        description="Images, video, GIFs, and reusable templates — searchable, taggable, ready to drop into any agent."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Generate with AI
            </Button>
            <Button
              size="sm"
              style={{ background: 'var(--brand-gradient)' }}
              onClick={() =>
                toast.message('Upload coming soon', {
                  description: 'Drag-and-drop and S3-backed storage land in the next release.',
                })
              }
            >
              + Upload
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Search + filter row */}
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
              placeholder="Search assets and tags…"
              aria-label="Search asset library"
              className="h-9 pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {(['all', 'image', 'video', 'gif', 'template'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                aria-pressed={filter === t}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  filter === t
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {t === 'all' ? 'All' : TYPE_LABEL[t]}
                <span className={cn('ml-1.5 text-[10px] tabular-nums', filter === t ? 'opacity-80' : 'opacity-60')}>
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone hint */}
        <button
          type="button"
          onClick={() =>
            toast.message('Upload coming soon', {
              description: 'Drag-and-drop and S3-backed storage land in the next release.',
            })
          }
          className="w-full rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-6 text-center transition-colors hover:border-orange-500/50 hover:bg-orange-500/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        >
          <p className="text-sm font-semibold">Drag and drop files here, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            PNG / JPG / MP4 / MOV / GIF · max 50 MB · automatically tagged by your agents
          </p>
        </button>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-sm font-semibold">No assets match.</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different filter or search term.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a) => (
              <AssetCard key={a.id} asset={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <div
        className={`relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br ${asset.hue}`}
      >
        <span className="text-5xl drop-shadow-md">{asset.preview}</span>
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge className="text-[9px] px-1.5 py-0 bg-black/40 text-white border-white/20 backdrop-blur-sm uppercase tracking-widest">
            {TYPE_EMOJI[asset.type]} {asset.type}
          </Badge>
        </div>
        {asset.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 text-white px-1.5 py-0.5 text-[10px] font-mono backdrop-blur-sm">
            {asset.duration}
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <CardContent className="p-3">
        <p className="text-xs font-bold truncate" title={asset.name}>
          {asset.name}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {asset.size}
          {asset.dimensions ? ` · ${asset.dimensions}` : ''}
        </p>
        {asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted text-[9px] font-semibold uppercase tracking-widest text-muted-foreground px-1.5 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Used {asset.used}×</span>
          <span>{asset.uploadedAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}
