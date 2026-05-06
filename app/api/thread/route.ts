import { generateText, Output } from 'ai'
import { z } from 'zod'

const threadSchema = z.object({
  thread: z.array(
    z.object({
      position: z.number().describe('Position in thread (1-based)'),
      content: z.string().describe('Tweet content, under 280 characters'),
      type: z.string().describe('Type: "hook", "body", "cta", or "closer"'),
    })
  ),
  hookSummary: z.string().describe('One-line summary of the thread hook strategy'),
})

export async function POST(req: Request) {
  const { topic, threadLength = 5, tone = 'casual', persona = 'personal' } = await req.json()

  if (!topic) {
    return Response.json({ error: 'Topic is required.' }, { status: 400 })
  }

  const system = `You are an expert X/Twitter thread writer. You create viral threads that educate, entertain, and build authority.

Thread structure rules:
1. Tweet 1 (Hook): Must stop the scroll. Use curiosity gaps, bold claims, or specific numbers. Include "thread" or a thread emoji indicator.
2. Tweets 2-${threadLength - 1} (Body): Each tweet must deliver ONE clear idea. Use line breaks. Include specific examples, data, or stories.
3. Tweet ${threadLength} (Closer): Summarize the key takeaway, include a CTA (follow for more, retweet to share, bookmark this).

Writing rules:
- Every tweet must be under 280 characters
- Each tweet should work standalone but flow as a narrative
- Use line breaks for readability within tweets
- Number the tweets (1/, 2/, etc.)
- Avoid filler words and generic statements
- Include at least one surprising fact or counterintuitive insight
- The thread should feel like a masterclass, not a listicle

Tone: ${tone}`

  try {
    const { output } = await generateText({
      model: 'openai/gpt-4.1-mini',
      output: Output.object({ schema: threadSchema }),
      system,
      prompt: `Create a ${threadLength}-tweet thread about:\n\n"${topic}"`,
      maxOutputTokens: 2000,
    })

    return Response.json({ result: output })
  } catch (error) {
    console.error('Thread generation error:', error)
    return Response.json({ error: 'Failed to generate thread.' }, { status: 500 })
  }
}
