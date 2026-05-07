import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

const requestSchema = z.object({
  content: z.string().min(10).max(5000),
  voiceSettings: z
    .object({
      formal: z.number().min(0).max(100).optional(),
      energy: z.number().min(0).max(100).optional(),
      depth: z.number().min(0).max(100).optional(),
      humor: z.number().min(0).max(100).optional(),
      archetypes: z.array(z.string()).optional(),
    })
    .optional(),
})

const repurposeSchema = z.object({
  twitter: z
    .string()
    .describe(
      'Punchy X/Twitter post — max 280 chars. Opens with the sharpest hook from the source. 1-2 hashtags at the end.',
    ),
  linkedin: z
    .string()
    .describe(
      'LinkedIn post — professional yet human. Strong opening line that stops the scroll, 3 key insights as short paragraphs (not bullet lists), ends with a thought-provoking question or CTA. 600–1100 chars.',
    ),
  instagram: z
    .string()
    .describe(
      'Instagram caption — opens with an irresistible hook (first 125 chars are critical), uses line breaks for rhythm, includes relevant emojis naturally, ends with 10-15 hashtags on a new line.',
    ),
  tiktok: z
    .string()
    .describe(
      'TikTok video script formatted as labeled sections: HOOK (2-3 sec grabber), BUILD (conflict or tension), PAYOFF (the insight or reveal), CTA (what to do next). Keep it punchy and conversational.',
    ),
  facebook: z
    .string()
    .describe(
      'Facebook post — conversational and community-driven. Tells a mini-story or shares a relatable observation. Ends with a direct question to spark comments. 200-400 chars.',
    ),
  newsletter_subject: z
    .string()
    .describe('Email newsletter subject line — under 55 chars. Either curiosity-driven or clear benefit promise.'),
  newsletter_intro: z
    .string()
    .describe(
      'Newsletter opening paragraph — 120-180 words. Hooks the reader with a surprising fact, bold claim, or relatable scenario. Sets up why they should keep reading.',
    ),
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

  const { content, voiceSettings } = parsed.data

  const voiceContext = voiceSettings
    ? `Voice settings: ${voiceSettings.formal !== undefined ? `${voiceSettings.formal < 50 ? 'casual' : 'formal'} tone` : ''}, ${voiceSettings.energy !== undefined ? `${voiceSettings.energy > 60 ? 'high energy' : 'measured pace'}` : ''}, ${voiceSettings.archetypes?.length ? `archetypes: ${voiceSettings.archetypes.join(', ')}` : ''}.`
    : ''

  try {
    const { object } = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: repurposeSchema,
      prompt: `You are a world-class social media strategist. Repurpose the following content into platform-optimized versions. Each version must feel genuinely native to that platform — different format, tone, and structure. Do not just copy-paste with minor edits.

${voiceContext}

Source content:
"""
${content}
"""

Transform this into compelling, authentic content for each platform. Preserve the core message and key insights, but rewrite the format and style completely for each platform's culture.`,
    })

    return Response.json(object)
  } catch (err) {
    console.error('[repurpose]', err)
    return Response.json({ error: 'Generation failed' }, { status: 500 })
  }
}
