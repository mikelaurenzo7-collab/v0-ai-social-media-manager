import { generateText, generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

const WORKFLOW_STEPS = ['research', 'hooks', 'draft', 'hashtags', 'schedule'] as const

const requestSchema = z.object({
  steps: z
    .array(z.enum(WORKFLOW_STEPS))
    .min(1)
    .max(WORKFLOW_STEPS.length)
    .refine((arr) => new Set(arr).size === arr.length, { message: 'steps must be unique' }),
  topic: z.string().trim().min(1).max(500),
  agentId: z.string().optional(),
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
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { steps, topic } = parsed.data

  let context = `Topic: ${topic}`
  const results: { id: string; name: string; output: string }[] = []

  for (const stepId of steps) {
    if (stepId === 'research') {
      const { text } = await generateText({
        model: anthropic('claude-3-5-haiku-20241022'),
        prompt: `Research and provide key insights, trends, and audience pain points for the topic: ${topic}. Be concise and actionable.`,
      })
      results.push({ id: 'research', name: 'Topic Research', output: text })
      context += `\n\nResearch Insights:\n${text}`
    }

    if (stepId === 'hooks') {
      const { object } = await generateObject({
        model: anthropic('claude-3-5-haiku-20241022'),
        schema: z.object({
          hooks: z.array(z.string()).length(3),
        }),
        prompt: `Based on this research:\n${context}\n\nGenerate 3 viral hooks for a social media post. Each hook should use a different formula (curiosity gap, bold claim, relatable pain point).`,
      })
      const output = object.hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')
      results.push({ id: 'hooks', name: 'Viral Hooks', output })
      context += `\n\nTop Hook:\n${object.hooks[0]}`
    }

    if (stepId === 'draft') {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: `Draft a high-quality social media post based on this context:\n${context}\n\nUse a professional yet engaging tone. Make it platform-agnostic and punchy.`,
      })
      results.push({ id: 'draft', name: 'Post Draft', output: text })
      context += `\n\nDraft:\n${text}`
    }

    if (stepId === 'hashtags') {
      const { object } = await generateObject({
        model: anthropic('claude-3-5-haiku-20241022'),
        schema: z.object({
          hashtags: z.array(z.string()).min(5).max(15),
          strategy: z.string(),
        }),
        prompt: `Generate 10 optimized hashtags for this content:\n${context}\n\nInclude a mix of niche (low competition), mid-tier, and broad tags. Return without the # symbol.`,
      })
      const output = `${object.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ')}\n\nStrategy: ${object.strategy}`
      results.push({ id: 'hashtags', name: 'Hashtag Set', output })
    }

    if (stepId === 'schedule') {
      const { object } = await generateObject({
        model: anthropic('claude-3-5-haiku-20241022'),
        schema: z.object({
          platform: z.string(),
          bestDay: z.string(),
          bestTime: z.string(),
          reasoning: z.string(),
        }),
        prompt: `Based on this content and topic:\n${context}\n\nRecommend the single best platform, day of week, and time to post for maximum reach. Explain why briefly.`,
      })
      const output = `Platform: ${object.platform}\nBest day: ${object.bestDay} at ${object.bestTime}\n\n${object.reasoning}`
      results.push({ id: 'schedule', name: 'Optimal Schedule', output })
    }
  }

  return Response.json({ results })
}
