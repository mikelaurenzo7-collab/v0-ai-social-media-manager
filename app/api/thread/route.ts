import { streamObject } from 'ai'
import { threadSchema } from '@/lib/schemas/thread'
import { z } from 'zod'
import { getAuthenticatedUserId } from '@/lib/oauth/session'

const requestSchema = z.object({
  topic: z.string().trim().min(1).max(500),
  tweetCount: z.number().min(3).max(15).default(7),
  tone: z.string().trim().min(1).max(80).default('educational and engaging'),
})

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { topic, tweetCount, tone } = parsed.data

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
