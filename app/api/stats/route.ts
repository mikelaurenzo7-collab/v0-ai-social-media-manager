import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

const EMPTY = {
  drafts: 0,
  threads: 0,
  publishedPosts: 0,
  connectedAccounts: 0,
  scheduledPosts: 0,
}

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json(EMPTY)

    const now = new Date()

    const [drafts, threads, publishedPosts, connectedAccounts, scheduledPosts] =
      await Promise.all([
        prisma.draft.count({ where: { userId } }),
        prisma.thread.count({ where: { userId } }),
        prisma.publishedPost.count({ where: { userId } }),
        prisma.socialConnection.count({ where: { userId } }),
        prisma.scheduledPost.count({
          where: { userId, status: 'scheduled', scheduledFor: { gt: now } },
        }),
      ])

    return Response.json({ drafts, threads, publishedPosts, connectedAccounts, scheduledPosts })
  } catch {
    return Response.json(EMPTY)
  }
}
