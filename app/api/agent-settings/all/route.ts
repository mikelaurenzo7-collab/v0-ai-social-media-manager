import { neon } from '@neondatabase/serverless'
import { getAuthenticatedUserId } from '@/lib/oauth/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const userId = await getAuthenticatedUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const rows = await sql`
      SELECT "agentId", "creativity", "tone", "memory"
      FROM "AgentSetting"
      WHERE "userId" = ${userId}
    `
    return NextResponse.json(rows)
  } catch (err) {
    console.error('GET /api/agent-settings/all', err)
    return NextResponse.json({ error: 'Failed to load agent settings' }, { status: 500 })
  }
}
