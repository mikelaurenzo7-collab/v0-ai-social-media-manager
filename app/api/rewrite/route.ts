import { generateText, Output } from 'ai'
import { z } from 'zod'
import { PLATFORM_INTELLIGENCE } from '@/lib/ai/platform-intelligence'
import type { PlatformIntelligenceId } from '@/lib/ai/platform-intelligence'

const rewriteSchema = z.object({
  rewritten: z.string().describe('The rewritten content, optimized for the target platform'),
  hashtags: z.array(z.string()).describe('Updated hashtags for the target platform'),
  changes: z.string().describe('Brief explanation of what was changed and why'),
})

export async function POST(req: Request) {
  const { content, fromPlatform, toPlatform, tone } = await req.json()

  if (!content || !toPlatform) {
    return Response.json({ error: 'Content and target platform are required.' }, { status: 400 })
  }

  const targetPlatform = PLATFORM_INTELLIGENCE[toPlatform as PlatformIntelligenceId]
  const sourcePlatform = fromPlatform
    ? PLATFORM_INTELLIGENCE[fromPlatform as PlatformIntelligenceId]
    : null

  const voiceGuide = targetPlatform.voiceGuidelines[
    (tone as keyof typeof targetPlatform.voiceGuidelines) || 'casual'
  ]

  const system = `You are a social media content adapter. Your job is to take existing content and rewrite it to feel native on ${targetPlatform.name}.

Platform rules for ${targetPlatform.name}:
- Character limit: ${targetPlatform.charLimit}
${targetPlatform.contentRules.map(r => `- ${r}`).join('\n')}

Voice: ${voiceGuide}

${sourcePlatform ? `The original content was written for ${sourcePlatform.name}. Adapt it for ${targetPlatform.name}'s unique culture and format.` : ''}

Do NOT just rephrase. Genuinely adapt the content to feel like it was written natively for ${targetPlatform.name}.`

  try {
    const { output } = await generateText({
      model: 'openai/gpt-4.1-mini',
      output: Output.object({ schema: rewriteSchema }),
      system,
      prompt: `Rewrite this content for ${targetPlatform.name}:\n\n"${content}"`,
    })

    return Response.json({ result: output })
  } catch (error) {
    console.error('Rewrite error:', error)
    return Response.json({ error: 'Failed to rewrite content.' }, { status: 500 })
  }
}
