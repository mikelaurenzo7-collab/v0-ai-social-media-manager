import { streamObject } from 'ai'
import { z } from 'zod'
import { contentVariationSchema } from '@/lib/schemas/content'

const SUPPORTED_PLATFORMS = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'] as const

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  tone: z.string().trim().min(1).max(80),
  contentType: z.string().trim().min(1).max(80),
  platforms: z.array(z.enum(SUPPORTED_PLATFORMS)).min(1).max(5),
})

const PLATFORM_DEEP_GUIDES: Record<string, string> = {
  twitter: `X/Twitter — max 280 chars per post.
    - Lead with the hook in the first 10 words. No warm-up sentences.
    - Use line breaks to make it scannable.
    - Max 2 hashtags. Excessive hashtags kill reach on X.
    - Numbers and specifics outperform vague claims.
    - Provocative questions, bold statements, or surprising facts drive replies.
    - If it can work as a thread, hint at that with "Thread 🧵" at the end.`,
  instagram: `Instagram — max 2200 chars, but first 125 chars show before "more".
    - The first line (before "more") must be the hook — make it irresistible.
    - Use line breaks every 1-3 sentences for readability.
    - Conversational, warm, and human tone performs best.
    - Encourage saves: "Save this for later" drives algorithmic reach.
    - Include 5-15 relevant hashtags at the end of the caption.
    - If it can be a carousel, say so — carousels drive 3× higher engagement.
    - End with a clear CTA: ask a question, drive to bio link, or encourage comments.`,
  facebook: `Facebook — generous character limits, optimize for shareability.
    - Emotional storytelling (joy, surprise, nostalgia) gets shared the most.
    - Ask a question to spark discussion — comments > likes in the algorithm.
    - Use short paragraphs. Long walls of text lose readers fast.
    - Native video outperforms YouTube links — note if this could be video content.
    - Keep promotional content subtle — focus on value and community first.
    - "See what your friends think" energy — write for shareability above all.`,
  linkedin: `LinkedIn — max 3000 chars, first 210 chars (3 lines) visible before "see more".
    - Those first 3 lines are everything — hook hard, be bold, create curiosity.
    - Write for professionals but be human. Personal > corporate.
    - Line break after every 1-2 sentences. White space = readability.
    - No external links in the post body — they kill reach. Link goes in first comment.
    - Industry insights, contrarian takes, and personal lessons perform best.
    - End with a direct question to drive comments.
    - Use 3-5 industry hashtags at the bottom.`,
  tiktok: `TikTok — this is video-first. Write a video script hook + on-screen text concept.
    - First 1-3 seconds are everything. Open with a pattern interrupt or bold hook.
    - Write the caption short (under 150 chars) — it's secondary to the video.
    - Suggest on-screen text that would appear during the video.
    - Reference trending sound/audio if relevant.
    - Structure: Hook (1-3 sec) → Payoff/Value → CTA (comment, duet, follow).
    - Content that makes people stop, rewatch, or comment drives FYP distribution.`,
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const validation = requestSchema.safeParse(body)
  if (!validation.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { prompt, tone, contentType, platforms } = validation.data

  const platformNames = platforms.join(', ')
  const platformGuides = platforms
    .map((p) => PLATFORM_DEEP_GUIDES[p])
    .filter(Boolean)
    .join('\n\n')

  const systemPrompt = `You are an elite social media strategist and copywriter who has grown accounts to millions of followers across every major platform.
Your job is to generate 3 distinct, high-performing social media post variations — each one could go viral on its own.

PLATFORM-SPECIFIC RULES (follow these precisely):
${platformGuides}

Content rules:
- Each variation MUST take a completely different creative angle (different hook type, structure, and perspective).
- Assign each a score 1-10 for predicted engagement (be honest — differentiate your scores).
- Identify the hook type for each: e.g. "Curiosity Gap", "Bold Claim", "Relatable Pain", "Statistic", "Story".
- Make every word count — no filler, no clichés, no generic openers.
- Match the tone precisely: ${tone}.
- Content type is ${contentType} — reflect this in the approach.
- Include strategic hashtags appropriate for the platform (respect platform hashtag limits).
- Use emojis sparingly and only when they genuinely enhance the message.
- Add a platformTip for each variation — one advanced tactic to maximize reach on the primary platform.

Hook types to rotate through:
1. Curiosity Gap ("Here's what no one tells you about X...")
2. Bold Claim or Contrarian Take  
3. Relatable Pain Point
4. Specific Statistic or Number
5. Story or Personal Experience

Target platforms: ${platformNames}`

  const result = streamObject({
    model: 'anthropic/claude-sonnet-4-6',
    schema: contentVariationSchema,
    system: systemPrompt,
    prompt: `Create 3 unique, high-engagement social media post variations for this idea:\n\n"${prompt}"\n\nEach variation must feel like it was written by a different top creator with a distinct voice, hook style, and angle. Score each one honestly. Include a platformTip for each one.`,
  })

  return result.toTextStreamResponse()
}
