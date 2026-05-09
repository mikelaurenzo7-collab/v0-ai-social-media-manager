import { neon } from '@neondatabase/serverless'
import { getAuthenticatedUserId } from '@/lib/oauth/session'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })

  const rows = await sql`
    SELECT creativity, tone, memory
    FROM "AgentSetting"
    WHERE "userId" = ${userId} AND "agentId" = ${agentId}
    LIMIT 1
  `
  if (!rows.length) {
    return NextResponse.json({ creativity: 50, tone: 75, memory: [] })
  }
  return NextResponse.json({
    creativity: rows[0].creativity,
    tone: rows[0].tone,
    memory: rows[0].memory ?? [],
  })
}

export async function POST(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { agentId, creativity, tone, memory } = body

  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 })
  if (creativity != null && (typeof creativity !== 'number' || creativity < 0 || creativity > 100)) {
    return NextResponse.json({ error: 'creativity must be a number between 0 and 100' }, { status: 400 })
  }
  if (tone != null && (typeof tone !== 'number' || tone < 0 || tone > 100)) {
    return NextResponse.json({ error: 'tone must be a number between 0 and 100' }, { status: 400 })
  }
  if (memory != null && !Array.isArray(memory)) {
    return NextResponse.json({ error: 'memory must be an array' }, { status: 400 })
  }

  const id = `as_${userId}_${agentId}`
  await sql`
    INSERT INTO "AgentSetting" ("id", "userId", "agentId", "creativity", "tone", "memory", "updatedAt")
    VALUES (
      ${id}, ${userId}, ${agentId},
      ${creativity ?? 50}, ${tone ?? 75},
      ${JSON.stringify(memory ?? [])}::jsonb,
      now()
    )
    ON CONFLICT ("userId", "agentId") DO UPDATE SET
      "creativity" = EXCLUDED."creativity",
      "tone"       = EXCLUDED."tone",
      "memory"     = EXCLUDED."memory",
      "updatedAt"  = now()
  `
  return NextResponse.json({ ok: true })
}
