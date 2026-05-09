import { streamObject } from 'ai'
import { threadSchema } from '@/lib/schemas/thread'
import { z } from 'zod'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getCurrentUserId } from '@/lib/oauth/session'

const requestSchema = z.object({
  topic: z.string(),
  tweetCount: z.number().min(3).max(15).default(7),
  tone: z.string().default('educational and engaging'),
})

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  const key = userId ?? (req.headers.get('x-forwarded-for') ?? 'anon')
  const { allowed, resetAt } = rateLimit(`thread:${key}`, { limit: 20, windowMs: 60_000 })
  if (!allowed) return rateLimitResponse(resetAt)

  const body = await req.json().catch(() => ({}))
  const parseResult = requestSchema.safeParse(body)
  if (!parseResult.success) return Response.json({ error: 'Invalid request' }, { status: 400 })
  const { topic, tweetCount, tone } = parseResult.data

  const result = streamObject({
    model: 'anthropic/claude-sonnet-4.6',
    schema: threadSchema,
    system: `You are a viral Twitter/X thread writer. You write threads that educate, entertain, and grow followings fast.

Thread rules:
- The hook tweet (tweet 1) MUST be irresistible — make people unable to scroll past it
- Use formats that proven to work: "X things I wish I knew about Y", "Unpopular opinion:", "Thread: How I [result]", etc.
- Each tweet must be self-contained but build on the previous one
- Keep every tweet under 280 characters (this is critical)
- Use numbers, line breaks, and minimal emojis for readability
- Bridge tweets smooth transitions ("But here's the twist:", "Now the part no one talks about:")
- CTA tweet should drive follows, replies, or bookmarks
- Label each tweet's type: hook, content, bridge, or cta
- Include a short tip for why the hook works`,
    prompt: `Create a ${tweetCount}-tweet thread about: "${topic}"\n\nTone: ${tone}\n\nMake the hook impossible to ignore. Every tweet must be under 280 characters. End with a strong CTA that drives engagement.`,
  })

  return result.toTextStreamResponse()
}
