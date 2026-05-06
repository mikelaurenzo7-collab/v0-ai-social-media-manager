import { streamText, tool, generateObject, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

export const runtime = 'edge'

const systemPrompt = `You are PostPilot's AI Content Strategist — a sharp, senior social media expert with 10+ years growing top brands.

Your capabilities:
- Brainstorm hooks, angles, and post ideas for any niche or goal
- Give platform-specific strategy (X/Twitter, Instagram, Facebook, LinkedIn)
- Use your tools to analyze posts, generate hashtags, outline threads, and recommend posting schedules
- Explain what makes content go viral and apply those principles

Personality: Confident, direct, zero fluff. Think experienced creative director meets data-driven marketer.
Format: Short paragraphs, bullets, bold text where helpful. Keep responses tight — be the expert who respects people's time.
When the user shares a post or topic, proactively use your tools to give them concrete, actionable output.`

const POSTING_SCHEDULES: Record<string, { bestDays: string[]; bestTimes: string[]; notes: string }> = {
  twitter: {
    bestDays: ['Tuesday', 'Wednesday', 'Friday'],
    bestTimes: ['8 AM', '12 PM', '5 PM'],
    notes: 'Peaks during commute hours and lunch. Engage in trending conversations early in the morning.',
  },
  instagram: {
    bestDays: ['Monday', 'Wednesday', 'Thursday'],
    bestTimes: ['11 AM', '1 PM', '7–9 PM'],
    notes: 'Evening posts perform well for lifestyle content. Reels get more reach than static posts.',
  },
  facebook: {
    bestDays: ['Wednesday', 'Thursday', 'Friday'],
    bestTimes: ['1 PM', '3 PM'],
    notes: 'Weekday afternoons drive the most engagement. Videos and link posts perform best.',
  },
  linkedin: {
    bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
    bestTimes: ['8–10 AM', '12 PM'],
    notes: 'Business hours are prime. Avoid weekends. Text-only posts often outperform carousels.',
  },
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] }
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    messages: modelMessages,
    maxOutputTokens: 2048,
    stopWhen: stepCountIs(5),
    tools: {
      analyze_post: tool({
        description:
          'Analyze a social media post and score it on key metrics: hook strength, CTA clarity, readability, and engagement potential. Use this when the user shares a post or asks for feedback.',
        inputSchema: z.object({
          content: z.string().describe('The post content to analyze'),
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin'])
            .describe('The target platform for this post'),
        }),
        execute: async ({ content, platform }) => {
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              overallScore: z.number().min(1).max(10),
              hookStrength: z.number().min(1).max(10),
              ctaClarity: z.number().min(1).max(10),
              readability: z.number().min(1).max(10),
              engagementPotential: z.number().min(1).max(10),
              hookType: z.string().describe('The hook mechanism identified, e.g. "Curiosity Gap"'),
              strengths: z.array(z.string()).max(3),
              improvements: z.array(z.string()).max(3),
            }),
            system: 'You are a social media content analyst. Score posts objectively and give precise, actionable feedback.',
            prompt: `Analyze this ${platform} post and score it 1-10 on each metric. Be honest and specific.\n\nPost:\n${content}`,
          })
          return object
        },
      }),

      suggest_hashtags: tool({
        description:
          'Generate high-performing, platform-specific hashtags for a topic. Use this when the user asks for hashtag ideas or strategy.',
        inputSchema: z.object({
          topic: z.string().describe('The topic or niche to generate hashtags for'),
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin'])
            .describe('Target platform'),
          count: z
            .number()
            .min(5)
            .max(20)
            .default(10)
            .describe('Number of hashtags to generate'),
        }),
        execute: async ({ topic, platform, count }) => {
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              hashtags: z
                .array(
                  z.object({
                    tag: z.string().describe('Hashtag without the # symbol'),
                    category: z.enum(['niche', 'mid-tier', 'broad']),
                    estimatedReach: z.enum(['low', 'medium', 'high', 'very high']),
                    why: z.string().describe('One sentence on why this tag is effective'),
                  })
                )
                .length(count),
              strategy: z
                .string()
                .describe('2-3 sentence hashtag strategy recommendation for this topic'),
            }),
            system: 'You are a social media hashtag strategist. Generate hashtags that balance reach and niche relevance.',
            prompt: `Generate ${count} high-performing ${platform} hashtags for the topic: "${topic}". Include a mix of niche, mid-tier, and broad tags.`,
          })
          return object
        },
      }),

      create_thread_outline: tool({
        description:
          'Create a Twitter/X thread outline from a topic. Use this when the user wants to create a thread or needs a viral content structure.',
        inputSchema: z.object({
          topic: z.string().describe('The topic or idea for the thread'),
          tweetCount: z
            .number()
            .min(3)
            .max(12)
            .default(7)
            .describe('Number of tweets in the thread'),
          tone: z
            .string()
            .default('educational and engaging')
            .describe('The tone/style of the thread'),
        }),
        execute: async ({ topic, tweetCount, tone }) => {
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              threadTitle: z.string(),
              tweets: z
                .array(
                  z.object({
                    number: z.number(),
                    content: z
                      .string()
                      .max(280)
                      .describe('Tweet content, max 280 characters'),
                    type: z.enum(['hook', 'content', 'bridge', 'cta']),
                  })
                )
                .length(tweetCount),
              hookAnalysis: z
                .string()
                .describe('Why the hook tweet will perform well'),
            }),
            system: 'You are a viral Twitter/X thread writer. Create threads that educate, entertain, and drive follows.',
            prompt: `Create a ${tweetCount}-tweet thread about: "${topic}"\nTone: ${tone}\n\nRules:\n- Hook tweet must be irresistible (max 280 chars)\n- Each tweet stands alone but builds on the previous\n- End with a strong CTA\n- Every tweet under 280 characters`,
          })
          return object
        },
      }),

      get_posting_schedule: tool({
        description:
          'Get research-backed optimal posting times for a specific platform. Use this when the user asks about when to post.',
        inputSchema: z.object({
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin'])
            .describe('The platform to get schedule for'),
        }),
        execute: async ({ platform }) => {
          return POSTING_SCHEDULES[platform]
        },
      }),
    },
  })

  return result.toTextStreamResponse()
}
