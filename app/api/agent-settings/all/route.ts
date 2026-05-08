import { neon } from '@neondatabase/serverless'
import { getCurrentUserId } from '@/lib/oauth/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const userId = await getCurrentUserId()
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
