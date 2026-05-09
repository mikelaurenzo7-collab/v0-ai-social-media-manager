import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

function scheduledId() {
  return `scp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ posts: [] })

    const rows = await prisma.scheduledPost.findMany({
      where: { userId },
      orderBy: { scheduledFor: 'asc' },
    })

    const posts = rows.map((r) => {
      const dt = r.scheduledFor
      return {
        id: r.id,
        content: r.content,
        platform: (r.platforms[0]) ?? 'twitter',
        date: dt.toISOString().split('T')[0],
        time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
        status: r.status,
      }
    })

    return Response.json({ posts })
  } catch {
    return Response.json({ posts: [] })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { content, platform, date, time } = await req.json()
    if (!content || !date || !time) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const scheduledFor = new Date(`${date}T${time}:00`)
    if (isNaN(scheduledFor.getTime())) {
      return Response.json({ error: 'Invalid date/time' }, { status: 400 })
    }

    const id = scheduledId()
    await prisma.scheduledPost.create({
      data: {
        id,
        userId,
        content,
        platforms: [platform ?? 'twitter'],
        scheduledFor,
        status: 'scheduled',
      },
    })

    return Response.json({ id, success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    await prisma.scheduledPost.deleteMany({ where: { id, userId } })
    return Response.json({ success: true })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
