import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createSchema = z.object({
  content: z.string().min(1).max(10_000),
  platforms: z.array(z.string()).default([]),
  hashtags: z.array(z.string()).default([]),
  tone: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const drafts = await prisma.draft.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({ drafts })
  } catch (err) {
    return NextResponse.json(
      { drafts: [], error: err instanceof Error ? err.message : 'Failed to load drafts' },
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

    const draft = await prisma.draft.create({
      data: {
        userId,
        content: parsed.data.content,
        platforms: parsed.data.platforms,
        hashtags: parsed.data.hashtags,
        tone: parsed.data.tone ?? null,
        metadata: (parsed.data.metadata as object | null) ?? null,
      },
    })
    return NextResponse.json({ draft }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create draft' },
      { status: 500 },
    )
  }
}
