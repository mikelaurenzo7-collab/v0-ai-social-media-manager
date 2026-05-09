import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

const draftSchema = z.object({
  content: z.string().min(1).max(10000),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  tone: z.string().default('casual'),
  contentType: z.string().optional(),
})

const threadSchema = z.object({
  type: z.literal('thread'),
  title: z.string().optional(),
  topic: z.string().default(''),
  tone: z.string().default('casual'),
  tweets: z.array(z.unknown()).default([]),
})

function draftId() {
  return `dft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
function threadId() {
  return `thr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ drafts: [], threads: [], total: 0 })

    const { searchParams } = new URL(req.url)
    const singleId = searchParams.get('id')

    if (singleId) {
      const draft = await prisma.draft.findFirst({
        where: { id: singleId, userId },
      })
      if (!draft) return Response.json({ draft: null }, { status: 404 })
      const meta = (draft.metadata as Record<string, string> | null) ?? {}
      return Response.json({
        draft: {
          id: draft.id,
          content: draft.content,
          platforms: draft.platforms,
          hashtags: draft.hashtags,
          tone: draft.tone,
          contentType: meta.contentType ?? 'promotional',
          createdAt: draft.createdAt,
        },
      })
    }

    const [drafts, threads] = await Promise.all([
      prisma.draft.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.thread.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    return Response.json({
      drafts: drafts.map((d) => {
        const meta = (d.metadata as Record<string, string> | null) ?? {}
        return {
          id: d.id,
          content: d.content,
          platforms: d.platforms,
          hashtags: d.hashtags,
          tone: d.tone,
          contentType: meta.contentType ?? 'promotional',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }
      }),
      threads: threads.map((t) => ({
        id: t.id,
        title: t.title,
        topic: t.topic,
        tone: t.tone,
        tweets: t.tweets,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: drafts.length + threads.length,
    })
  } catch {
    return Response.json({ drafts: [], threads: [], total: 0 })
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (body?.type === 'thread') {
      const parsed = threadSchema.safeParse(body)
      if (!parsed.success) return Response.json({ error: 'Invalid thread data' }, { status: 400 })

      const { title, topic, tone, tweets } = parsed.data
      const id = threadId()
      await prisma.thread.create({
        data: {
          id,
          userId,
          title: title ?? topic ?? 'Untitled Thread',
          topic: topic ?? '',
          tone: tone ?? 'casual',
          tweets: tweets ?? [],
        },
      })
      return Response.json({ id, success: true })
    }

    const parsed = draftSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: 'Invalid request' }, { status: 400 })

    const { content, hashtags, platforms, tone, contentType } = parsed.data
    const id = draftId()
    await prisma.draft.create({
      data: {
        id,
        userId,
        content,
        hashtags,
        platforms,
        tone,
        metadata: contentType ? { contentType } : undefined,
      },
    })
    return Response.json({ id, success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') ?? 'draft'

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json()

    if (type === 'thread') {
      const thread = await prisma.thread.findFirst({ where: { id, userId } })
      if (!thread) return Response.json({ error: 'Not found' }, { status: 404 })

      await prisma.thread.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.topic !== undefined && { topic: body.topic }),
          ...(body.tone !== undefined && { tone: body.tone }),
          ...(body.tweets !== undefined && { tweets: body.tweets }),
        },
      })
      return Response.json({ success: true })
    }

    const draft = await prisma.draft.findFirst({ where: { id, userId } })
    if (!draft) return Response.json({ error: 'Not found' }, { status: 404 })

    const existing = (draft.metadata as Record<string, string> | null) ?? {}
    await prisma.draft.update({
      where: { id },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
        ...(body.platforms !== undefined && { platforms: body.platforms }),
        ...(body.tone !== undefined && { tone: body.tone }),
        ...(body.contentType !== undefined && {
          metadata: { ...existing, contentType: body.contentType },
        }),
      },
    })
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to update' },
      { status: 500 }
    )
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') ?? 'draft'

    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    if (type === 'thread') {
      await prisma.thread.deleteMany({ where: { id, userId } })
    } else {
      await prisma.draft.deleteMany({ where: { id, userId } })
    }
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
