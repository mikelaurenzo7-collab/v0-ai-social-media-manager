import { getCurrentUserId } from '@/lib/oauth/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const settingsSchema = z.object({
  agentId: z.string().min(1).max(50),
  creativity: z.number().int().min(0).max(100).optional(),
  tone: z.number().int().min(0).max(100).optional(),
  memory: z.array(z.unknown()).optional(),
})

export async function GET(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })

  const setting = await prisma.agentSetting.findUnique({
    where: { userId_agentId: { userId, agentId } },
  })

  if (!setting) return NextResponse.json({ creativity: 50, tone: 75, memory: [] })

  return NextResponse.json({
    creativity: setting.creativity,
    tone: setting.tone,
    memory: Array.isArray(setting.memory) ? setting.memory : [],
  })
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { agentId, creativity, tone, memory } = parsed.data
  const id = `as_${userId}_${agentId}`

  await prisma.agentSetting.upsert({
    where: { userId_agentId: { userId, agentId } },
    create: {
      id,
      userId,
      agentId,
      creativity: creativity ?? 50,
      tone: tone ?? 75,
      memory: memory ?? [],
    },
    update: {
      ...(creativity !== undefined && { creativity }),
      ...(tone !== undefined && { tone }),
      ...(memory !== undefined && { memory }),
    },
  })

  return NextResponse.json({ ok: true })
}
