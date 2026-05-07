import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createSchema = z.object({
  content: z.string().min(1).max(10_000),
  platforms: z.array(z.string()).min(1),
  scheduledFor: z.string().datetime(),
  draftId: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId()
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(from || to
          ? {
              scheduledFor: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { scheduledFor: 'asc' },
      take: 500,
    })
    return NextResponse.json({ posts })
  } catch (err) {
    return NextResponse.json(
      { posts: [], error: err instanceof Error ? err.message : 'Failed to load scheduled posts' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    const json = await request.json().catch(() => ({}))
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
    }

    const scheduledFor = new Date(parsed.data.scheduledFor)
    if (Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledFor' }, { status: 400 })
    }
    if (scheduledFor.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: 'scheduledFor must be in the future' }, { status: 400 })
    }

    const post = await prisma.scheduledPost.create({
      data: {
        userId,
        content: parsed.data.content,
        platforms: parsed.data.platforms,
        scheduledFor,
        draftId: parsed.data.draftId ?? null,
        metadata: (parsed.data.metadata as object | null) ?? null,
      },
    })
    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to schedule post' },
      { status: 500 },
    )
  }
}
