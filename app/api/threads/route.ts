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

const createSchema = z.object({
  title: z.string().min(1).max(280),
  topic: z.string().nullish(),
  tone: z.string().nullish(),
  tweets: z.array(tweetSchema).min(1),
  metadata: z.record(z.unknown()).nullish(),
})

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const threads = await prisma.thread.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json({ threads })
  } catch (err) {
    return NextResponse.json(
      { threads: [], error: err instanceof Error ? err.message : 'Failed to load threads' },
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

    const thread = await prisma.thread.create({
      data: {
        userId,
        title: parsed.data.title,
        topic: parsed.data.topic ?? null,
        tone: parsed.data.tone ?? null,
        tweets: parsed.data.tweets,
        metadata: (parsed.data.metadata as object | null) ?? null,
      },
    })
    return NextResponse.json({ thread }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create thread' },
      { status: 500 },
    )
  }
}
