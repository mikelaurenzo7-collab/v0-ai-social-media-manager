import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

const PLATFORMS = new Set(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'snapchat'])

export async function GET(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const platform = url.searchParams.get('platform') ?? undefined
  if (platform && !PLATFORMS.has(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }
  const window = url.searchParams.get('window') ?? '30d'
  const days = window === '7d' ? 7 : window === '90d' ? 90 : 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const posts = await prisma.publishedPost.findMany({
    where: {
      userId,
      ...(platform ? { platform } : {}),
      publishedAt: { gte: since },
      status: 'published',
    },
    orderBy: { publishedAt: 'desc' },
    take: 200,
  })

  type EngMetadata = {
    likes?: number
    comments?: number
    shares?: number
    saves?: number
    impressions?: number
    views?: number
  }

  // Aggregate engagement from `metadata` (set by the publisher when available)
  let totalEngagement = 0
  let totalImpressions = 0
  const ranked = posts.map((p) => {
    const meta = (p.metadata as EngMetadata | null) ?? {}
    const eng =
      (meta.likes ?? 0) +
      (meta.comments ?? 0) +
      (meta.shares ?? 0) +
      (meta.saves ?? 0)
    const impr = meta.impressions ?? meta.views ?? 0
    totalEngagement += eng
    totalImpressions += impr
    return {
      id: p.id,
      platform: p.platform,
      publishedAt: p.publishedAt,
      excerpt: p.content.slice(0, 140),
      engagement: eng,
      impressions: impr,
      likes: meta.likes ?? 0,
      comments: meta.comments ?? 0,
      shares: meta.shares ?? 0,
      saves: meta.saves ?? 0,
    }
  })

  ranked.sort((a, b) => b.engagement - a.engagement)
  const topPosts = ranked.slice(0, 10)

  return NextResponse.json({
    summary: {
      window,
      platform: platform ?? 'all',
      totalPosts: posts.length,
      totalEngagement,
      totalImpressions,
      avgEngagementPerPost: posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0,
    },
    topPosts,
  })
}
