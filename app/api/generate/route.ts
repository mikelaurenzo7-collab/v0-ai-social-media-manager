import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getSession, useAICredit } from '@/lib/auth'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/ai/prompt-builder'
import type { PlatformIntelligenceId } from '@/lib/ai/platform-intelligence'
import type { PersonaId } from '@/lib/ai/persona-engine'

const contentVariationSchema = z.object({
  variations: z.array(
    z.object({
      id: z.string().describe('Unique ID like "v1", "v2", "v3"'),
      content: z.string().describe('The main post content. Platform-native, scroll-stopping, ready to publish.'),
      hashtags: z.array(z.string()).describe('5-10 relevant hashtags without the # symbol. Mix popular and niche.'),
      hookScore: z.number().describe('Self-assessed hook strength 1-10. Be honest.'),
      bestPlatform: z.string().describe('Which target platform this variation is most optimized for'),
      angle: z.string().describe('Brief label for the creative angle used, like "Direct Hook" or "Story-Led"'),
    })
  ).length(3),
})

export async function POST(req: Request) {
  const session = await getSession()

  if (session) {
    const hasCredits = await useAICredit(session.user.id)
    if (!hasCredits) {
      return Response.json(
        { error: 'You have run out of AI credits. Please upgrade to continue.' },
        { status: 403 }
      )
    }
  }

  const { prompt, tone, contentType, platforms, persona = 'personal', brandContext } = await req.json()

  if (!prompt || !platforms?.length) {
    return Response.json(
      { error: 'Prompt and at least one platform are required.' },
      { status: 400 }
    )
  }

  const config = {
    platforms: platforms as PlatformIntelligenceId[],
    persona: persona as PersonaId,
    tone: tone || 'casual',
    contentType: contentType || 'promotional',
    prompt,
    brandContext,
  }

  const systemPrompt = buildSystemPrompt(config)
  const userPrompt = buildUserPrompt(config)

  try {
    const { output } = await generateText({
      model: 'openai/gpt-4.1-mini',
      output: Output.object({
        schema: contentVariationSchema,
      }),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 2000,
    })

    return Response.json({
      variations: output?.variations || [],
      meta: {
        persona,
        platforms,
        tone,
        contentType,
      },
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return Response.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}
