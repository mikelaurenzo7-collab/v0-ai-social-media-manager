import { generateText, Output } from 'ai'
import { z } from 'zod'

const contentVariationSchema = z.object({
  variations: z.array(
    z.object({
      id: z.string(),
      content: z.string().describe('The main post content, optimized for social media engagement'),
      hashtags: z.array(z.string()).describe('Relevant hashtags without the # symbol'),
    })
  ).length(3),
})

export async function POST(req: Request) {
  const { prompt, tone, contentType, platforms } = await req.json()

  const platformNames = platforms.join(', ')
  const characterLimits = platforms.includes('twitter') 
    ? 'Keep Twitter/X posts under 280 characters.' 
    : ''

  const systemPrompt = `You are an expert social media content creator. Generate engaging, platform-optimized content.

Guidelines:
- Create content that feels authentic and human
- Match the requested tone precisely
- Include relevant hashtags that will increase reach
- ${characterLimits}
- Optimize for ${platformNames}
- Each variation should take a different creative angle
- Never use generic filler content - make it specific and compelling
- Don't use emojis unless they genuinely enhance the message

Tone: ${tone}
Content Type: ${contentType}
Target Platforms: ${platformNames}`

  try {
    const { output } = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: contentVariationSchema,
      }),
      system: systemPrompt,
      prompt: `Create 3 unique social media post variations for the following idea:\n\n"${prompt}"\n\nEach variation should take a different creative angle while maintaining the same core message.`,
    })

    return Response.json({ variations: output?.variations || [] })
  } catch (error) {
    console.error('AI generation error:', error)
    return Response.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
