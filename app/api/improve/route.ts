import { generateObject } from 'ai'
import { z } from 'zod'

const requestSchema = z.object({
  content: z.string().min(1).max(5000),
  hashtags: z.array(z.string().trim().min(1).max(50)).max(30),
  feedback: z.string().min(1).max(1000),
  tone: z.string().trim().min(1).max(80),
  platforms: z.array(z.string().trim().min(1).max(30)).min(1).max(5),
})

const improveResponseSchema = z.object({
  content: z.string().describe('The improved post content'),
  hashtags: z.array(z.string()).describe('Updated hashtags without the # symbol'),
})

export async function POST(req: Request) {
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

  const { content, hashtags, feedback, tone, platforms } = parsed.data

  const platformNames = platforms.join(', ')
  const hashtagStr = hashtags.map((h) => `#${h}`).join(' ')

  const { object } = await generateObject({
    model: 'anthropic/claude-haiku-4.5',
    schema: improveResponseSchema,
    system: `You are an expert social media copywriter. Improve the given post based on the user's feedback. Tone: ${tone}. Platforms: ${platformNames}.`,
    prompt: `Original post:\n${content}\n\nHashtags: ${hashtagStr}\n\nUser feedback: ${feedback}\n\nRewrite the post incorporating this feedback while keeping it optimized for ${platformNames}. Return the improved content and updated hashtags.`,
  })

  return Response.json(object)
}
