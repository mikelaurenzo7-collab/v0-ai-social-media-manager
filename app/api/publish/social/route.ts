import { NextResponse } from 'next/server'
import { z } from 'zod'
import { publishSocialPost } from '@/lib/publishing/social'
import { getCurrentUserId } from '@/lib/oauth/session'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok']),
  text: z.string().min(1).max(5000),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
})

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed, resetAt } = rateLimit(`publish:${userId}`, { limit: 20, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(resetAt)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const result = await publishSocialPost(userId, parsed.data.platform, {
    text: parsed.data.text,
    mediaUrls: parsed.data.mediaUrls,
  })

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
