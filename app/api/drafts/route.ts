import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/oauth/session'

const sql = neon(process.env.DATABASE_URL!)

const createDraftSchema = z.object({
  content: z.string().min(1).max(10000),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  tone: z.string().default('casual'),
  contentType: z.string().optional(),
})

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      // Return empty for unauthenticated users (demo mode)
      return Response.json({ drafts: [], threads: [], total: 0 })
    }

    const [drafts, threads] = await Promise.all([
      sql`
        SELECT id, content, platforms, hashtags, tone, metadata, "createdAt", "updatedAt"
        FROM "Draft"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
        LIMIT 50
      `,
      sql`
        SELECT id, title, topic, tone, tweets, "createdAt", "updatedAt"
        FROM "Thread"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
        LIMIT 50
      `,
    ])

    return Response.json({
      drafts: drafts.map((d: Record<string, unknown>) => ({
        id: d.id,
        content: d.content,
        platforms: (d.platforms as string[]) ?? [],
        hashtags: (d.hashtags as string[]) ?? [],
        tone: (d.tone as string) ?? 'casual',
        contentType: ((d.metadata as Record<string, string> | null)?.contentType) ?? 'promotional',
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
      threads: threads.map((t: Record<string, unknown>) => ({
        id: t.id,
        title: (t.title as string) ?? (t.topic as string) ?? 'Untitled Thread',
        topic: t.topic,
        tone: t.tone,
        tweets: (t.tweets as unknown[]) ?? [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: drafts.length + threads.length,
    })
  } catch {
    return Response.json({ drafts: [], threads: [], total: 0 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type } = body

    if (type === 'thread') {
      const { title, topic, tone, tweets } = body
      const id = `thr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await sql`
        INSERT INTO "Thread" (id, "userId", title, topic, tone, tweets, "createdAt", "updatedAt")
        VALUES (
          ${id},
          ${userId},
          ${title ?? topic ?? 'Untitled Thread'},
          ${topic ?? ''},
          ${tone ?? 'casual'},
          ${JSON.stringify(tweets ?? [])},
          NOW(),
          NOW()
        )
      `
      return Response.json({ id, success: true })
    }

    // Default: draft post
    const parsed = createDraftSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { content, hashtags, platforms, tone, contentType } = parsed.data
    const id = `dft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const metadata = contentType ? { contentType } : {}

    await sql`
      INSERT INTO "Draft" (id, "userId", content, platforms, hashtags, tone, metadata, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${userId},
        ${content},
        ${platforms},
        ${hashtags},
        ${tone},
        ${JSON.stringify(metadata)},
        NOW(),
        NOW()
      )
    `

    return Response.json({ id, success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to save draft' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') ?? 'draft'

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 })
    }

    if (type === 'thread') {
      await sql`DELETE FROM "Thread" WHERE id = ${id} AND "userId" = ${userId}`
    } else {
      await sql`DELETE FROM "Draft" WHERE id = ${id} AND "userId" = ${userId}`
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
