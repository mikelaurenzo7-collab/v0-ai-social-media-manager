import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  content: z.string().min(1).max(10_000).optional(),
  platforms: z.array(z.string()).optional(),
  scheduledFor: z.string().datetime().optional(),
  status: z.enum(['scheduled', 'publishing', 'published', 'failed', 'cancelled']).optional(),
  metadata: z.record(z.unknown()).nullish(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    const json = await request.json().catch(() => ({}))
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
    }

    const existing = await prisma.scheduledPost.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let scheduledFor: Date | undefined
    if (parsed.data.scheduledFor) {
      scheduledFor = new Date(parsed.data.scheduledFor)
      if (Number.isNaN(scheduledFor.getTime())) {
        return NextResponse.json({ error: 'Invalid scheduledFor' }, { status: 400 })
      }
    }

    const post = await prisma.scheduledPost.update({
      where: { id },
      data: {
        ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
        ...(parsed.data.platforms !== undefined ? { platforms: parsed.data.platforms } : {}),
        ...(scheduledFor ? { scheduledFor } : {}),
        ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
        ...(parsed.data.metadata !== undefined ? { metadata: (parsed.data.metadata as object | null) ?? null } : {}),
      },
    })
    return NextResponse.json({ post })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update scheduled post' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    const existing = await prisma.scheduledPost.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await prisma.scheduledPost.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to cancel scheduled post' },
      { status: 500 },
    )
  }
}
