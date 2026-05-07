import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/oauth/session'

export const runtime = 'nodejs'
export const maxDuration = 60

const VoiceExtractionSchema = z.object({
  brandVoice: z
    .string()
    .min(20)
    .max(600)
    .describe(
      "A 2-4 sentence description of the user's voice. Concrete and specific — not generic descriptors like 'engaging' or 'authentic'. Capture sentence rhythm, register, what they DO and DON'T do.",
    ),
  defaultTone: z
    .enum(['Professional', 'Conversational', 'Witty', 'Bold', 'Warm', 'Authoritative', 'Playful', 'Minimal'])
    .describe('The single tone preset that best fits the samples.'),
  doWords: z
    .array(z.string().min(1).max(40))
    .min(3)
    .max(10)
    .describe(
      'Words and short phrases the user uses naturally and that should be preserved when drafting on their behalf. Real words from the samples — never generic marketing jargon.',
    ),
  dontWords: z
    .array(z.string().min(1).max(40))
    .min(3)
    .max(10)
    .describe(
      'Words and short phrases the user clearly avoids based on the samples (and that an AI would otherwise default to). Examples: "leverage", "synergy", "delve", "unlock", "elevate".',
    ),
  contentPillars: z
    .array(z.string().min(1).max(60))
    .min(2)
    .max(5)
    .describe('The 2-5 distinct themes/topics the user posts about, inferred from the samples.'),
  brandKeywords: z
    .array(z.string().min(1).max(40))
    .min(2)
    .max(8)
    .describe('Topical keywords or brand-specific terminology that appear repeatedly across samples.'),
  hashtagStyle: z
    .enum(['minimal', 'moderate', 'heavy'])
    .describe(
      'minimal = 0-2 hashtags per post, moderate = 3-7, heavy = 8+. Pick based on the samples even if hashtags weren\u2019t shown.',
    ),
  emojiUsage: z
    .enum(['none', 'sparing', 'liberal'])
    .describe('How often emojis appear in the samples.'),
  notes: z
    .string()
    .max(400)
    .describe('One paragraph explaining the strongest signals in the samples — what made you confident about voice, tone, and pillars.'),
})

const SYSTEM_PROMPT = `You are a brand-voice analyst. Your job is to extract a STRUCTURED voice profile from raw writing samples (posts, captions, emails, articles).

Critical rules:
- Be specific. "Direct and witty" is better than "engaging". Use concrete signals: sentence length, punctuation habits, lowercase use, em-dash frequency, opener patterns, the kind of metaphors used.
- doWords and dontWords must reflect REALITY not aspiration. doWords come from actual sample text. dontWords are common AI-default words that the user clearly avoids.
- Common dontWords for most modern voices: "leverage", "synergy", "delve", "unlock", "elevate", "harness", "robust", "seamless", "cutting-edge", "game-changer", "in today's fast-paced world".
- contentPillars are themes the writer keeps returning to (e.g. "AI productivity tools", "early-stage hiring", "remote-team rituals"). Not vague categories like "tech".
- If a field is genuinely uncertain, still produce your best inference — never refuse.`

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const body = (await req.json()) as { samples?: string; context?: string }
    const samples = (body.samples ?? '').trim()
    if (samples.length < 200) {
      return NextResponse.json(
        { error: 'Please paste at least ~200 characters of writing samples (around 2–3 posts, captions, or short emails).' },
        { status: 400 },
      )
    }
    if (samples.length > 20_000) {
      return NextResponse.json(
        { error: 'Samples are too long. Please limit to ~20,000 characters.' },
        { status: 400 },
      )
    }

    const userPrompt = `Analyze the following writing samples${body.context ? ` from ${body.context}` : ''} and produce the structured voice profile.

SAMPLES:
${samples}`

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: VoiceExtractionSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.4,
    })

    return NextResponse.json({ voice: object })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Voice extraction failed' },
      { status: 500 },
    )
  }
}
