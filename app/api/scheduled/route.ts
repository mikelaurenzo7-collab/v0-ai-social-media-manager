import { neon } from '@neondatabase/serverless'
import { getAuthenticatedUserId } from '@/lib/oauth/session'

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await sql`
      SELECT id, content, platforms, "scheduledFor", status, metadata
      FROM "ScheduledPost"
      WHERE "userId" = ${userId}
      ORDER BY "scheduledFor" ASC
    `

    const posts = rows.map((r: Record<string, unknown>) => {
      const dt = new Date(r.scheduledFor as string)
      return {
        id: r.id,
        content: r.content,
        platform: ((r.platforms as string[]) ?? [])[0] ?? 'twitter',
        date: dt.toISOString().split('T')[0],
        time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
        status: r.status as string,
      }
    })

    return Response.json({ posts })
  } catch {
    return Response.json({ posts: [] })
  }
}

export async function POST(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { content, platform, date, time } = await req.json()
    if (!content || !date || !time) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const scheduledFor = new Date(`${date}T${time}:00`)
    const id = `scp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await sql`
      INSERT INTO "ScheduledPost" (id, "userId", content, platforms, "scheduledFor", status, attempts, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${userId},
        ${content},
        ${[platform]},
        ${scheduledFor.toISOString()},
        'scheduled',
        0,
        NOW(),
        NOW()
      )
    `

    return Response.json({ id, success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    await sql`DELETE FROM "ScheduledPost" WHERE id = ${id} AND "userId" = ${userId}`
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
