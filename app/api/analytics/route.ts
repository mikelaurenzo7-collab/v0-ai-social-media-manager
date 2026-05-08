import { neon } from '@neondatabase/serverless'
import { getCurrentUserId } from '@/lib/oauth/session'
import { subDays, addDays, format, eachDayOfInterval, startOfDay } from 'date-fns'

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? '30D'

  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const days = period === '7D' ? 7 : period === '90D' ? 90 : 30
    // Inclusive range: start..end produces exactly `days` buckets
    const end = startOfDay(new Date())
    const start = subDays(end, days - 1)
    const startISO = start.toISOString()
    const endISO = addDays(end, 1).toISOString()

    const [postsRaw, platformRaw, totalPublished, totalDrafts, totalConnections] =
      await Promise.all([
        sql`
          SELECT
            platform,
            DATE_TRUNC('day', "publishedAt") AS day,
            COUNT(*)::int AS count
          FROM "PublishedPost"
          WHERE "userId" = ${userId}
            AND status = 'published'
            AND "publishedAt" >= ${startISO}
            AND "publishedAt" < ${endISO}
          GROUP BY platform, DATE_TRUNC('day', "publishedAt")
          ORDER BY day ASC
        `,
        sql`
          SELECT platform, COUNT(*)::int AS count
          FROM "PublishedPost"
          WHERE "userId" = ${userId}
            AND status = 'published'
            AND "publishedAt" >= ${startISO}
            AND "publishedAt" < ${endISO}
          GROUP BY platform
          ORDER BY count DESC
        `,
        // totals scoped to the selected period
        sql`
          SELECT COUNT(*)::int AS count
          FROM "PublishedPost"
          WHERE "userId" = ${userId}
            AND status = 'published'
            AND "publishedAt" >= ${startISO}
            AND "publishedAt" < ${endISO}
        `,
        sql`SELECT COUNT(*)::int AS count FROM "Draft" WHERE "userId" = ${userId}`,
        sql`SELECT COUNT(*)::int AS count FROM "SocialConnection" WHERE "userId" = ${userId}`,
      ])

    // Build a full date range so every day appears in the time series
    const dateRange = eachDayOfInterval({ start, end })
    const dateMap: Record<string, Record<string, number>> = {}
    for (const d of dateRange) {
      dateMap[format(d, 'MMM d')] = {
        twitter: 0,
        instagram: 0,
        linkedin: 0,
        tiktok: 0,
        facebook: 0,
      }
    }

    for (const row of postsRaw) {
      const key = format(new Date(row.day), 'MMM d')
      if (dateMap[key]) {
        dateMap[key][row.platform as string] = row.count as number
      }
    }

    const timeSeries = Object.entries(dateMap).map(([d, platforms]) => ({
      d,
      ...platforms,
      total: Object.values(platforms).reduce((s, v) => s + v, 0),
    }))

    const platformTotals = platformRaw.reduce<Record<string, number>>((acc: Record<string, number>, row: Record<string, unknown>) => {
      acc[row.platform as string] = row.count as number
      return acc
    }, {})

    return Response.json({
      timeSeries,
      platformTotals,
      totals: {
        published: (totalPublished[0]?.count as number) ?? 0,
        drafts: (totalDrafts[0]?.count as number) ?? 0,
        connections: (totalConnections[0]?.count as number) ?? 0,
      },
      hasData: postsRaw.length > 0,
    })
  } catch (err) {
    console.error('[analytics] Failed to load analytics:', err)
    return Response.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
