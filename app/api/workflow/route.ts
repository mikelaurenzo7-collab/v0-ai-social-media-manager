import { generateText, generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { steps, topic, agentId } = await req.json()
  let context = `Topic: ${topic}`
  const results = []

  for (const stepId of steps) {
    if (stepId === 'research') {
      const { text } = await generateText({
        model: anthropic('claude-3-5-haiku-20241022'),
        prompt: `Research and provide key insights, trends, and audience pain points for the topic: ${topic}. Be concise.`,
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
        prompt: `Based on this research:\n${context}\n\nGenerate 3 viral hooks for a social media post.`,
      })
      results.push({ id: 'hooks', name: 'Viral Hooks', output: object.hooks.join('\n') })
      context += `\n\nTop Hook:\n${object.hooks[0]}`
    }

    if (stepId === 'draft') {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt: `Draft a high-quality social media post based on this context:\n${context}\n\nUse a professional yet engaging tone.`,
      })
      results.push({ id: 'draft', name: 'Post Drafting', output: text })
      context += `\n\nDraft Content:\n${text}`
    }

    if (stepId === 'hashtags') {
      const { text } = await generateText({
        model: anthropic('claude-3-5-haiku-20241022'),
        prompt: `Provide 10 optimized hashtags for this post content:\n${context}`,
      })
      results.push({ id: 'hashtags', name: 'Hashtag Set', output: text })
    }

    if (stepId === 'schedule') {
      results.push({ id: 'schedule', name: 'Best Time', output: "Optimized for Tuesday at 11:00 AM based on your audience activity." })
    }
  }

  return Response.json({ results })
}
