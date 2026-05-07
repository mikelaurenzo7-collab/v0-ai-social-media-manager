import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

const PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'snapchat'] as const

const CreateBody = z.object({
  // Accept either single `platform` (chat-tool path) or `platforms[]` (UI path)
  platform: z.enum(PLATFORMS).optional(),
  platforms: z.array(z.enum(PLATFORMS)).optional(),
  // Accept either `text` (chat-tool path) or `content` (UI path)
  text: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  // Accept either `scheduledAt` or `scheduledFor`
  scheduledAt: z.string().optional(),
  scheduledFor: z.string().optional(),
  timezone: z.string().optional(),
  agentId: z.string().optional(),
  draftId: z.string().optional(),
})

export async function GET(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status') ?? undefined
  const platform = url.searchParams.get('platform') ?? undefined
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 200)

  const posts = await prisma.scheduledPost.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(platform ? { platforms: { has: platform } } : {}),
    },
    orderBy: { scheduledFor: 'asc' },
    take: limit,
  })

  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateBody.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 })
  }

  // Normalize platforms[] and content
  const platforms =
    parsed.data.platforms && parsed.data.platforms.length > 0
      ? parsed.data.platforms
      : parsed.data.platform
      ? [parsed.data.platform]
      : null
  if (!platforms) return NextResponse.json({ error: 'platform or platforms[] required' }, { status: 400 })

  const content = parsed.data.content ?? parsed.data.text
  if (!content) return NextResponse.json({ error: 'content or text required' }, { status: 400 })

  // Normalize scheduledFor
  const whenISO = parsed.data.scheduledFor ?? parsed.data.scheduledAt
  if (!whenISO) return NextResponse.json({ error: 'scheduledFor or scheduledAt required' }, { status: 400 })
  const scheduledFor = new Date(whenISO)
  if (Number.isNaN(scheduledFor.getTime())) {
    return NextResponse.json({ error: 'Invalid scheduledFor datetime' }, { status: 400 })
  }
  if (scheduledFor.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'scheduledFor must be in the future' }, { status: 400 })
  }

  const metadata: Record<string, unknown> = {}
  if (parsed.data.mediaUrls?.length) metadata.mediaUrls = parsed.data.mediaUrls
  if (parsed.data.timezone) metadata.timezone = parsed.data.timezone
  if (parsed.data.agentId) metadata.agentId = parsed.data.agentId
  if (parsed.data.draftId) metadata.draftId = parsed.data.draftId

  const post = await prisma.scheduledPost.create({
    data: {
      userId,
      content,
      platforms,
      scheduledFor,
      status: 'scheduled',
      ...(Object.keys(metadata).length > 0 ? { metadata: metadata as Prisma.InputJsonValue } : {}),
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}
