import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

const requestSchema = z.object({
  content: z.string(),
  hashtags: z.array(z.string()),
  feedback: z.string(),
  tone: z.string(),
  platforms: z.array(z.string()),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { content, hashtags, feedback, tone, platforms } = requestSchema.parse(body)

  const hashtagStr = hashtags.map((h) => `#${h}`).join(' ')
  const platformNames = platforms.join(', ')

  const result = streamText({
    model: anthropic('claude-3-5-haiku-20241022'),
    system: `You are an expert social media copywriter. Improve the given post based on the user's feedback.
Return ONLY the improved post content followed by a blank line and then the hashtags (space-separated with # prefix).
Do not include any explanation, preamble, or commentary — just the improved content and hashtags.
Tone: ${tone}. Platforms: ${platformNames}.`,
    prompt: `Original post:\n${content}\n\nHashtags: ${hashtagStr}\n\nUser feedback: ${feedback}\n\nRewrite the post incorporating this feedback while keeping it optimized for ${platformNames}.`,
    maxTokens: 512,
  })

  return result.toDataStreamResponse()
}
