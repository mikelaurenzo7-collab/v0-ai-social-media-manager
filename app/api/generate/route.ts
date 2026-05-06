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
  const linkedInGuideline = platforms.includes('linkedin')
    ? 'For LinkedIn: professional tone, industry-relevant insights, thought leadership angle.'
    : ''

  const systemPrompt = `You are an elite social media strategist and copywriter who has grown accounts to millions of followers.
Your job is to generate 3 distinct, high-performing social media post variations — each one could go viral on its own.

Platform guidelines:
- ${twitterGuideline || 'Optimize for engagement and shareability.'}
- ${linkedInGuideline || ''}
- Instagram: hook in the first line, conversational caption, strong CTA.
- Facebook: write for shareability, community discussion, and emotional resonance.

Content rules:
- Each variation MUST take a completely different creative angle (different hook type, structure, and perspective).
- Assign each a score 1-10 for predicted engagement (be honest — differentiate your scores).
- Identify the hook type for each: e.g. "Curiosity Gap", "Bold Claim", "Relatable Pain", "Statistic", "Story".
- Make every word count — no filler, no clichés, no generic openers.
- Match the tone precisely: ${tone}.
- Content type is ${contentType} — reflect this in the approach.
- Include 3–6 highly relevant, strategic hashtags per post.
- Use emojis sparingly and only when they genuinely enhance the message.

Hook types to rotate through:
1. Curiosity Gap ("Here's what no one tells you about X...")
2. Bold Claim or Contrarian Take  
3. Relatable Pain Point
4. Specific Statistic or Number
5. Story or Personal Experience

Target platforms: ${platformNames}`

  const result = streamObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: contentVariationSchema,
    system: systemPrompt,
    prompt: `Create 3 unique, high-engagement social media post variations for this idea:\n\n"${prompt}"\n\nEach variation must feel like it was written by a different top creator with a distinct voice, hook style, and angle. Score each one honestly.`,
  })

  return result.toTextStreamResponse()
}
