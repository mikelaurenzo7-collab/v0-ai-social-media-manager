import { generateObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { auth } from '@/lib/next-auth'

const anthropic = createAnthropic()

const REQUIRED_PLATFORMS = ['twitter', 'instagram', 'linkedin', 'tiktok'] as const

const trendsSchema = z
  .object({
    topics: z
      .array(
        z.object({
          title: z.string().describe('Short, punchy topic title — 4-8 words'),
          angle: z.string().describe('The specific angle or framing that makes this compelling — 1 sentence'),
          platform: z.enum(['twitter', 'instagram', 'linkedin', 'tiktok', 'all']),
          urgency: z.enum(['trending_now', 'evergreen', 'seasonal']),
          hook: z.string().describe('A ready-to-use opening hook for this topic — 1-2 sentences'),
          why: z.string().describe('Why this will perform well right now — 1 sentence'),
        })
      )
      .length(5),
  })
  .superRefine(({ topics }, ctx) => {
    const covered = new Set(topics.map((t) => t.platform))
    for (const platform of REQUIRED_PLATFORMS) {
      if (!covered.has(platform) && !covered.has('all')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['topics'],
          message: `Missing required platform coverage for ${platform}`,
        })
      }
    }
  })

const requestSchema = z.object({
  niche: z.string().trim().min(1).max(200),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const validation = requestSchema.safeParse(body)
    if (!validation.success) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { niche } = validation.data

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)

    const result = await generateObject({
      model: anthropic('claude-haiku-4-5-20251001'),
      schema: trendsSchema,
      abortSignal: controller.signal,
      prompt: `Generate 5 high-performing content topic ideas for a creator in the "${niche}" niche. Today is ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date())}.

Mix of content types:
- 1-2 timely / trending topics relevant right now
- 2-3 evergreen topics that consistently perform well in this niche
- At least one per major platform (Twitter, LinkedIn, Instagram, TikTok)

Requirements:
- Each topic must be SPECIFIC to the niche — no generic advice
- The hook should be immediately usable, not a template
- Vary the format: listicle, story, opinion, tutorial, data-driven
- Make them genuinely interesting and likely to spark engagement`,
    }).finally(() => clearTimeout(timeoutId))

    return Response.json(result.object)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return Response.json({ error: 'Request timed out' }, { status: 504 })
    }
    return Response.json({ error: 'Failed to generate trend ideas' }, { status: 500 })
  }
}
