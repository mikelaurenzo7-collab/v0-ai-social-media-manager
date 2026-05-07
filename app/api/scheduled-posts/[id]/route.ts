import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/oauth/session'

const PLATFORMS = ['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'snapchat'] as const

const PatchBody = z.object({
  content: z.string().min(1).optional(),
  platforms: z.array(z.enum(PLATFORMS)).min(1).optional(),
  scheduledFor: z.string().optional(),
  status: z.enum(['scheduled', 'cancelled']).optional(),
})

async function loadOwn(userId: string, id: string) {
  return prisma.scheduledPost.findFirst({ where: { id, userId } })
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const post = await loadOwn(userId, id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const existing = await loadOwn(userId, id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = PatchBody.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 })
  }

  const data: Parameters<typeof prisma.scheduledPost.update>[0]['data'] = {}
  if (parsed.data.content !== undefined) data.content = parsed.data.content
  if (parsed.data.platforms) data.platforms = parsed.data.platforms
  if (parsed.data.scheduledFor) {
    const when = new Date(parsed.data.scheduledFor)
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledFor datetime' }, { status: 400 })
    }
    data.scheduledFor = when
  }
  if (parsed.data.status) data.status = parsed.data.status

  const updated = await prisma.scheduledPost.update({ where: { id }, data })
  return NextResponse.json({ post: updated })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const existing = await loadOwn(userId, id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft-cancel scheduled, hard-delete failed/cancelled
  if (existing.status === 'scheduled') {
    await prisma.scheduledPost.update({ where: { id }, data: { status: 'cancelled' } })
  } else {
    await prisma.scheduledPost.delete({ where: { id } })
  }
  return NextResponse.json({ ok: true })
}
