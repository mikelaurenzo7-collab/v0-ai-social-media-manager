import { NextResponse } from 'next/server'
import { deleteConnection } from '@/lib/oauth/connections'
import { getCurrentUserId } from '@/lib/oauth/session'
import { isValidProvider } from '@/lib/oauth/providers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: `Invalid provider: ${provider}` }, { status: 400 })
  }

  try {
    const userId = await getCurrentUserId()
    const removed = await deleteConnection(userId, provider)
    return NextResponse.json({ success: true, removed })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to disconnect',
      },
      { status: 500 },
    )
  }
}
