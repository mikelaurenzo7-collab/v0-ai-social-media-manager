import { neon } from '@neondatabase/serverless'
import { getAuthenticatedUserId } from '@/lib/oauth/session'

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [draftCount, threadCount, publishedCount, connectionCount, scheduledCount] =
      await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM "Draft" WHERE "userId" = ${userId}`,
        sql`SELECT COUNT(*)::int AS count FROM "Thread" WHERE "userId" = ${userId}`,
        sql`SELECT COUNT(*)::int AS count FROM "PublishedPost" WHERE "userId" = ${userId}`,
        sql`SELECT COUNT(*)::int AS count FROM "SocialConnection" WHERE "userId" = ${userId}`,
        sql`
          SELECT COUNT(*)::int AS count FROM "ScheduledPost"
          WHERE "userId" = ${userId}
          AND status = 'scheduled'
          AND "scheduledFor" > NOW()
        `,
      ])

    return Response.json({
      drafts: draftCount[0]?.count ?? 0,
      threads: threadCount[0]?.count ?? 0,
      publishedPosts: publishedCount[0]?.count ?? 0,
      connectedAccounts: connectionCount[0]?.count ?? 0,
      scheduledPosts: scheduledCount[0]?.count ?? 0,
    })
  } catch (err) {
    console.error('GET /api/stats', err)
    return Response.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
