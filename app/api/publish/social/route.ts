import { NextResponse } from 'next/server'
import { z } from 'zod'
import { publishSocialPost } from '@/lib/publishing/social'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok']),
  text: z.string().min(1),
  mediaUrls: z.array(z.string().url()).optional(),
})

export async function POST(req: Request) {
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
      { status: 400 },
    )
  }

  const userId = await getCurrentUserId()
  const result = await publishSocialPost(userId, parsed.data.platform, {
    text: parsed.data.text,
    mediaUrls: parsed.data.mediaUrls,
  })

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
