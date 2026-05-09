import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmailViaGmail, sendEmailViaOutlook } from '@/lib/publishing/email'
import { getCurrentUserId } from '@/lib/oauth/session'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  channel: z.enum(['gmail', 'outlook']),
  to: z.array(z.string().email()).min(1).max(50),
  cc: z.array(z.string().email()).max(20).optional(),
  bcc: z.array(z.string().email()).max(20).optional(),
  subject: z.string().min(1).max(998),
  body: z.string().min(1).max(100_000),
  html: z.boolean().optional(),
})

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { allowed, resetAt } = rateLimit(`email:${userId}`, { limit: 10, windowMs: 60_000 })
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

  const { channel, ...email } = parsed.data
  const result =
    channel === 'gmail'
      ? await sendEmailViaGmail(userId, email)
      : await sendEmailViaOutlook(userId, email)

  return NextResponse.json(result, { status: result.success ? 200 : 500 })
}
