import { streamObject } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { auth } from '@/lib/next-auth'

const anthropic = createAnthropic()

const repurposeSchema = z.object({
  key_insight: z.string().describe('The single most powerful insight extracted from the source content'),
  suggested_hook: z.string().describe('The best viral hook formula derived from this content'),
  twitter_thread: z.object({
    tweets: z.array(
      z.object({
        n: z.number().describe('Tweet number starting at 1'),
        content: z.string().max(280).describe('Tweet text, max 280 chars. Tweet 1 is the hook tweet.'),
      })
    ).min(6).max(12),
  }),
  linkedin: z.object({
    full_post: z
      .string()
      .describe(
        'Complete LinkedIn post. First 3 lines are the hook shown before "see more". Full body after. Use line breaks. 150-600 words.'
      ),
    hashtags: z.array(z.string()).max(5).describe('3-5 hashtags without the # symbol'),
  }),
  instagram: z.object({
    caption: z
      .string()
      .describe('Full caption. First 125 chars must be the hook. Expanded content. End with a question CTA.'),
    carousel_titles: z
      .array(z.string())
      .min(4)
      .max(8)
      .describe('Carousel slide titles — bold, punchy, 2-5 words each'),
    hashtags: z.array(z.string()).max(15).describe('8-15 hashtags without #'),
  }),
  tiktok: z.object({
    hook: z
      .string()
      .describe('The exact opening line to say to camera in the first 3 seconds — pattern interrupt'),
    script_beats: z
      .array(
        z.object({
          timing: z.string().describe('e.g. "0-3s", "3-20s", "20-40s"'),
          direction: z.string().describe('What to say/show/do on screen'),
        })
      )
      .min(4)
      .max(6),
    caption: z.string().max(150).describe('Short TikTok caption under 150 chars'),
    on_screen_text: z.string().describe('Key text overlay to add in editing — one punchy line'),
  }),
  facebook: z.object({
    post: z
      .string()
      .describe(
        'Facebook post optimized for shares. Story-driven, emotional, ends with a discussion question.'
      ),
  }),
})

const requestSchema = z.object({
  content: z.string().trim().min(50).max(10000),
  sourceType: z.enum([
    'blog_post',
    'newsletter',
    'youtube_transcript',
    'podcast_notes',
    'article',
    'tweet',
    'idea',
  ]),
  niche: z.string().trim().min(1).max(120).optional(),
  tone: z.string().trim().min(1).max(80).optional(),
})

const SOURCE_LABELS: Record<string, string> = {
  blog_post: 'blog post',
  newsletter: 'newsletter',
  youtube_transcript: 'YouTube transcript',
  podcast_notes: 'podcast notes',
  article: 'article',
  tweet: 'tweet or short post',
  idea: 'idea or concept',
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const validation = requestSchema.safeParse(body)
  if (!validation.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { content, sourceType, niche, tone } = validation.data

  const sourceLabel = SOURCE_LABELS[sourceType] ?? 'content'
  const nicheCtx = niche ? `Creator niche: ${niche}.` : ''
  const toneCtx = tone ? `Preferred tone: ${tone}.` : 'Default to conversational but substantive.'

  const systemPrompt = `You are an elite content repurposing strategist. You transform source material into platform-native content that feels original and organic — NOT copy-pasted text adapted for different lengths.

Your job:
1. Extract the 1-2 most powerful ideas from the source
2. Craft entirely platform-native posts that feel like they were written for each platform from scratch
3. Each platform should take a fresh angle, not just reformat the same sentences

Platform rules:
TWITTER/X: Max 280 chars per tweet. Tweet 1 is the hook — make it impossible to scroll past. Each tweet flows into the next but stands alone. No fluff.
LINKEDIN: First 3 lines shown before "see more" — these are everything. Personal + professional. Insight-driven. Line breaks every 1-2 sentences.
INSTAGRAM: First 125 chars = hook. Use emojis sparingly but strategically. Carousels should have punchy 2-5 word slide titles. Encourage saves.
TIKTOK: Video-first. The hook is spoken directly to camera. Make the viewer stop immediately. Script is action-oriented with on-screen text cues.
FACEBOOK: Shareable storytelling. Trigger emotion (curiosity, nostalgia, surprise). End with a question that sparks comments.

${nicheCtx}
${toneCtx}`

  const result = streamObject({
    model: anthropic('claude-sonnet-4-6'),
    schema: repurposeSchema,
    system: systemPrompt,
    prompt: `Repurpose this ${sourceLabel} into high-performing content for every platform:

---
${content}
---

Extract the best angles, insights, and hooks. Make each platform version feel native and original — not a rewrite of the same text.`,
  })

  return result.toTextStreamResponse()
}
