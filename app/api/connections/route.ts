import { NextResponse } from 'next/server'
import { listConnections } from '@/lib/oauth/connections'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const connections = await listConnections(userId)
    return NextResponse.json({ connections })
  } catch (err) {
    return NextResponse.json(
      {
        connections: [],
        error: err instanceof Error ? err.message : 'Failed to load connections',
      },
      { status: 500 },
    )
  }
}
