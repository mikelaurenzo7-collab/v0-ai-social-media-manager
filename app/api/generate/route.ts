import { streamObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { contentVariationSchema } from '@/lib/schemas/content'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { prompt, tone, contentType, platforms } = await req.json()

  const platformNames = (platforms as string[]).join(', ')
  const twitterGuideline = platforms.includes('twitter')
    ? 'For Twitter/X: keep content under 280 characters (not counting hashtags).'
    : ''

  const systemPrompt = `You are an elite social media strategist and copywriter for top brands and influencers.
Your job is to generate 3 distinct, high-performing social media post variations.

Platform guidelines:
- ${twitterGuideline || 'Optimize for long-form engagement.'}
- Instagram: use conversational captions with strong hooks and a clear CTA.
- Facebook: write for shareability, community discussion, and emotional resonance.

Content rules:
- Each variation must take a completely different creative angle (hook style, structure, or perspective).
- Make every word count — no filler, no clichés.
- Match the tone precisely: ${tone}.
- Content type is ${contentType} — reflect this in the approach.
- Include 3–6 highly relevant, high-reach hashtags per post.
- Do NOT use generic hashtags like #love or #instagood unless they fit perfectly.
- Use emojis sparingly and only when they genuinely enhance the message.

Target platforms: ${platformNames}`

  const result = streamObject({
    model: anthropic('claude-3-5-haiku-20241022'),
    schema: contentVariationSchema,
    system: systemPrompt,
    prompt: `Create 3 unique social media post variations for this idea:\n\n"${prompt}"\n\nMake each one feel like it was written by a different expert with a distinct voice and angle.`,
  })

  return result.toTextStreamResponse()
}
