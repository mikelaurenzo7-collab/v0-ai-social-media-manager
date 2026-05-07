import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const tweetSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  content: z.string().min(1).max(4_000),
})

const updateSchema = z.object({
  title: z.string().min(1).max(280).optional(),
  topic: z.string().nullish(),
  tone: z.string().nullish(),
  tweets: z.array(tweetSchema).optional(),
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

    const existing = await prisma.thread.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const thread = await prisma.thread.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.topic !== undefined ? { topic: parsed.data.topic } : {}),
        ...(parsed.data.tone !== undefined ? { tone: parsed.data.tone } : {}),
        ...(parsed.data.tweets !== undefined ? { tweets: parsed.data.tweets } : {}),
        ...(parsed.data.metadata !== undefined ? { metadata: (parsed.data.metadata as object | null) ?? null } : {}),
      },
    })
    return NextResponse.json({ thread })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update thread' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    const existing = await prisma.thread.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await prisma.thread.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete thread' },
      { status: 500 },
    )
  }
}
