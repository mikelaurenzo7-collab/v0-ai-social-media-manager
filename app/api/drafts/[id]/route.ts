import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  content: z.string().min(1).max(10_000).optional(),
  platforms: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  tone: z.string().nullish(),
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

    // Ensure ownership
    const existing = await prisma.draft.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const draft = await prisma.draft.update({
      where: { id },
      data: {
        ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
        ...(parsed.data.platforms !== undefined ? { platforms: parsed.data.platforms } : {}),
        ...(parsed.data.hashtags !== undefined ? { hashtags: parsed.data.hashtags } : {}),
        ...(parsed.data.tone !== undefined ? { tone: parsed.data.tone } : {}),
        ...(parsed.data.metadata !== undefined ? { metadata: (parsed.data.metadata as object | null) ?? null } : {}),
      },
    })
    return NextResponse.json({ draft })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update draft' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    const existing = await prisma.draft.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await prisma.draft.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete draft' },
      { status: 500 },
    )
  }
}
