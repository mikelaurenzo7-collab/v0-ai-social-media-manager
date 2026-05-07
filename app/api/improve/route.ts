import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

const requestSchema = z.object({
  content: z.string().min(1).max(5000),
  hashtags: z.array(z.string()),
  feedback: z.string().min(1).max(1000),
  tone: z.string(),
  platforms: z.array(z.string()).min(1),
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
    model: anthropic('claude-3-5-haiku-20241022'),
    schema: improveResponseSchema,
    system: `You are an expert social media copywriter. Improve the given post based on the user's feedback. Tone: ${tone}. Platforms: ${platformNames}.`,
    prompt: `Original post:\n${content}\n\nHashtags: ${hashtagStr}\n\nUser feedback: ${feedback}\n\nRewrite the post incorporating this feedback while keeping it optimized for ${platformNames}. Return the improved content and updated hashtags.`,
  })

  return Response.json(object)
}
