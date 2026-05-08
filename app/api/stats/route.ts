import { neon } from '@neondatabase/serverless'
import { getCurrentUserId } from '@/lib/oauth/session'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return Response.json({
        drafts: 0,
        threads: 0,
        publishedPosts: 0,
        connectedAccounts: 0,
        scheduledPosts: 0,
      })
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
  } catch {
    return Response.json({
      drafts: 0,
      threads: 0,
      publishedPosts: 0,
      connectedAccounts: 0,
      scheduledPosts: 0,
    })
  }
}
