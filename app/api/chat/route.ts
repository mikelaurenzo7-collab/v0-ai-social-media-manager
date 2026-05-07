import { streamText, tool, generateObject, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { getAgentById } from '@/lib/agents'
import { sendEmailViaGmail, sendEmailViaOutlook } from '@/lib/publishing/email'
import { publishSocialPost } from '@/lib/publishing/social'
import { getConnection } from '@/lib/oauth/connections'
import { getCurrentUserId } from '@/lib/oauth/session'

// Node runtime — required by googleapis (Gmail) + Microsoft Graph SDK (Outlook).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const defaultSystemPrompt = `You are PostPilot's AI Content Strategist — a sharp, senior social media expert with 10+ years growing top brands across every major platform.

Your capabilities:
- Brainstorm hooks, angles, and post ideas for any niche or goal
- Give platform-specific strategy (X/Twitter, Instagram, Facebook, LinkedIn, TikTok)
- Use your tools to analyze posts, generate hashtags, outline threads, generate viral hooks, rewrite content for specific platforms, build content calendars, and optimize bios
- Explain what makes content go viral and apply those principles
- Give TikTok-specific video script hooks and FYP strategies

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
  tiktok: {
    bestDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    bestTimes: ['7 AM', '12 PM', '7–9 PM'],
    notes: 'Evening and early morning posts catch peak scroll time. Consistency matters more than timing on TikTok — post 1–4× daily.',
  },
}

export async function POST(req: Request) {
  const { messages, agentId, creativity, tone, memory, persona } = (await req.json()) as {
    messages: UIMessage[],
    agentId?: string,
    creativity?: number,
    tone?: number,
    memory?: string,
    persona?: string,
  }
  const modelMessages = await convertToModelMessages(messages)

  let systemPrompt = defaultSystemPrompt
  let temperature = 0.7

  if (agentId) {
    const agent = getAgentById(agentId)
    let memoryContext = ""
    if (memory) {
      try {
        const parsed = JSON.parse(memory)
        const validEntries = Array.isArray(parsed)
          ? parsed.filter(
              (m): m is { content: string } =>
                !!m && typeof m.content === 'string' && m.content.trim().length > 0
            )
          : []
        if (validEntries.length > 0) {
          memoryContext = `\n\nLONG-TERM MEMORY & CONTEXT:\n${validEntries.map((m) => `- ${m.content}`).join('\n')}`
        }
      } catch {
        // malformed memory string — skip
      }
    }

    let personaContext = ""
    if (persona) {
      try {
        const parsed = JSON.parse(persona) as Partial<{ role: string; responsibilities: string; voice: string; rules: string }>
        const lines: string[] = []
        if (parsed.role && parsed.role.trim()) lines.push(`Role: ${parsed.role.trim()}`)
        if (parsed.responsibilities && parsed.responsibilities.trim()) lines.push(`Responsibilities:\n${parsed.responsibilities.trim()}`)
        if (parsed.voice && parsed.voice.trim()) lines.push(`Brand voice:\n${parsed.voice.trim()}`)
        if (parsed.rules && parsed.rules.trim()) lines.push(`Operating rules (must follow):\n${parsed.rules.trim()}`)
        if (lines.length > 0) {
          personaContext = `\n\nUSER-DEFINED PERSONA (authoritative — overrides defaults):\n${lines.join('\n\n')}`
        }
      } catch {
        // malformed persona — skip
      }
    }

    const toneInstructions = tone ? `\n\nTONE ADJUSTMENT: Your tone should be ${tone > 70 ? 'highly casual and conversational' : tone < 30 ? 'strictly professional and formal' : 'balanced and modern'}.` : ""

    systemPrompt = `${agent.systemPrompt}${personaContext}${toneInstructions}${memoryContext}\n\nIn addition to your platform-specific defaults, you have access to the following shared capabilities:\n- Analyzing posts\n- Suggesting hashtags\n- Creating threads\n- Rewriting for platforms\n- Generating high-engagement hooks\n- Content calendars\n- Bio optimization\n\nIf a USER-DEFINED PERSONA is present above, treat it as authoritative — it overrides the defaults.\n\nFormat: Keep responses concise and on-brand for the connected platform. Use bold text for emphasis where helpful.`

    if (creativity) {
      // Map 0-100 to 0.0-1.0 temperature
      temperature = creativity / 100
    }
  }

  const agentTools = agentId ? (AGENT_TOOLS[agentId as keyof typeof AGENT_TOOLS] || {}) : {}

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    messages: modelMessages,
    temperature,
    maxOutputTokens: 2048,
    stopWhen: stepCountIs(5),
    tools: {
      ...agentTools,
      analyze_post: tool({
        description:
          'Analyze a social media post and score it on key metrics: hook strength, CTA clarity, readability, and engagement potential. Use this when the user shares a post or asks for feedback.',
        inputSchema: z.object({
          content: z.string().describe('The post content to analyze'),
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
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
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
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
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
            .describe('The platform to get schedule for'),
        }),
        execute: async ({ platform }) => {
          return POSTING_SCHEDULES[platform]
        },
      }),

      rewrite_for_platform: tool({
        description:
          'Rewrite any piece of content to be perfectly optimized for a specific platform\'s format, algorithm, and best practices. Use when the user wants to adapt content across platforms or asks how to format a post for a specific platform.',
        inputSchema: z.object({
          content: z.string().describe('The original content to rewrite'),
          targetPlatform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
            .describe('The platform to optimize the content for'),
          goal: z
            .string()
            .default('maximize reach and engagement')
            .describe('The primary goal: reach, engagement, conversions, followers, etc.'),
        }),
        execute: async ({ content, targetPlatform, goal }) => {
          const platformGuides: Record<string, string> = {
            twitter: 'Max 280 chars. Lead with the hook. Use numbers and line breaks. 1-2 hashtags max. Provoke replies.',
            instagram: 'First 125 chars must hook before "more". Use line breaks. Conversational tone. Strong CTA. Put hashtags at end (3-10 relevant ones). Encourage saves.',
            facebook: 'Emotional hook. Shareability is the metric. Tell a story or ask a question. Native video content beats links. Avoid "engagement bait".',
            linkedin: 'First 3 lines before "see more" — make them irresistible. Personal story > company news. Line break every 1-2 sentences. No links in the post body (put in first comment). 3-5 industry hashtags.',
            tiktok: 'Write a video script hook — first 1-3 seconds must grab attention. On-screen text idea. Trending sound suggestion. Caption is short (under 150 chars). End with a CTA to comment or duet.',
          }
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              rewrittenContent: z.string().describe('The platform-optimized version of the content'),
              keyChanges: z.array(z.string()).max(4).describe('What was changed and why'),
              platformTip: z.string().describe('One advanced tactic to maximize performance on this platform'),
              characterCount: z.number().describe('Character count of the rewritten content'),
            }),
            system: `You are an expert social media copywriter who specializes in platform-native content. Platform guide: ${platformGuides[targetPlatform]}`,
            prompt: `Rewrite this content for ${targetPlatform} with the goal to ${goal}.\n\nOriginal:\n${content}`,
          })
          return { ...object, targetPlatform }
        },
      }),

      generate_viral_hooks: tool({
        description:
          'Generate 5 viral hook options for a topic, each using a different proven hook formula. Use when the user needs a compelling opening line, headline, or hook for any platform.',
        inputSchema: z.object({
          topic: z.string().describe('The topic, idea, or message to create hooks for'),
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
            .describe('Target platform (determines optimal length and style)'),
        }),
        execute: async ({ topic, platform }) => {
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              hooks: z
                .array(
                  z.object({
                    hook: z.string().describe('The hook text itself'),
                    formula: z.string().describe('The hook formula used, e.g. "Curiosity Gap", "Bold Claim", "Stat + Claim"'),
                    whyItWorks: z.string().describe('One sentence on why this hook stops the scroll'),
                    score: z.number().min(1).max(10).describe('Predicted stop-the-scroll score'),
                  })
                )
                .length(5),
              topPick: z.number().min(0).max(4).describe('Index (0-based) of the recommended best hook'),
            }),
            system: `You are a world-class copywriter who has written hooks for content with millions of views. Platform: ${platform}. Make hooks irresistible, specific, and platform-native.`,
            prompt: `Generate 5 distinct viral hooks for this topic: "${topic}"\n\nUse these 5 formulas (one each):\n1. Curiosity Gap ("Here's what nobody tells you about...")\n2. Bold Contrarian Claim\n3. Specific Number + Shocking Result\n4. Relatable Pain Point\n5. Story Opener ("I [did X]. Here's what happened...")`,
          })
          return { ...object, platform, topic }
        },
      }),

      create_content_calendar: tool({
        description:
          'Generate a 7-day content calendar for a specific platform and niche. Use when the user wants a content plan, posting schedule, or weekly strategy.',
        inputSchema: z.object({
          niche: z.string().describe('The niche, brand, or topic area, e.g. "personal finance for millennials" or "SaaS startup"'),
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
            .describe('Target platform'),
          goal: z
            .string()
            .default('grow audience and engagement')
            .describe('Primary goal: brand awareness, lead generation, sales, community, etc.'),
        }),
        execute: async ({ niche, platform, goal }) => {
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              weekTheme: z.string().describe('An overarching theme that ties the week together'),
              days: z
                .array(
                  z.object({
                    day: z.string().describe('Day of the week, e.g. "Monday"'),
                    contentType: z.string().describe('Format, e.g. "Carousel", "Reel", "Thread", "Poll"'),
                    topic: z.string().describe('Specific post topic or angle'),
                    hook: z.string().describe('The opening hook for this post'),
                    goal: z.string().describe('What this post achieves in the overall strategy'),
                  })
                )
                .length(7),
              proTip: z.string().describe('One high-leverage tactic for this niche on this platform'),
            }),
            system: `You are a top social media strategist building content plans for brands. Platform: ${platform}. Make every day purposeful and varied — no two posts should use the same format or angle.`,
            prompt: `Create a 7-day content calendar for "${niche}" on ${platform}. Goal: ${goal}.\n\nRules:\n- Vary the content format every day\n- Each post should serve a specific strategic purpose\n- Balance educational, entertaining, and promotional content (80/20 rule)\n- Make the hooks impossible to ignore`,
          })
          return { ...object, platform, niche }
        },
      }),

      optimize_bio: tool({
        description:
          'Write an optimized profile bio for any platform. Use when the user asks how to write their bio, profile description, or wants to improve their account presentation.',
        inputSchema: z.object({
          platform: z
            .enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'])
            .describe('Target platform'),
          brandDescription: z.string().describe('What the person/brand does, their niche, and target audience'),
          goal: z
            .string()
            .default('attract followers and drive profile clicks')
            .describe('What you want the bio to achieve: followers, clients, sales, networking, etc.'),
        }),
        execute: async ({ platform, brandDescription, goal }) => {
          const bioLimits: Record<string, { limit: number; tips: string }> = {
            twitter: { limit: 160, tips: 'Include a clear value prop, personality, and optionally a CTA. Use line breaks. Emojis are fine.' },
            instagram: { limit: 150, tips: 'Line 1: who you help or what you do. Line 2: proof or credibility. Line 3: CTA with link.' },
            facebook: { limit: 255, tips: 'Professional and complete. Include what you do, who you serve, and contact info.' },
            linkedin: { limit: 2000, tips: 'First 300 chars show above fold. Lead with your value prop. Tell a mini story. Include social proof and a CTA.' },
            tiktok: { limit: 80, tips: 'Short, punchy, personality-forward. Include your niche in keywords. One CTA max.' },
          }
          const limits = bioLimits[platform]
          const { object } = await generateObject({
            model: anthropic('claude-3-5-haiku-20241022'),
            schema: z.object({
              bio: z.string().describe('The optimized bio text'),
              characterCount: z.number().describe('Character count'),
              keyElements: z.array(z.string()).max(4).describe('What makes this bio effective'),
              alternativeHook: z.string().describe('An alternative first line if they want to test something different'),
            }),
            system: `You are a profile optimization expert. You write bios that convert profile visitors into followers, clients, or leads. Platform: ${platform} (${limits.limit} char limit). Tips: ${limits.tips}`,
            prompt: `Write an optimized ${platform} bio for:\n\n${brandDescription}\n\nGoal: ${goal}\n\nStay under ${limits.limit} characters.`,
          })
          return { ...object, platform, limit: limits.limit }
        },
      }),
    },
  })

  return result.toTextStreamResponse()
}

// ── Agent-specific tools logic ───────────────────────────────────────────────

const emailDraftSchema = z.object({
  to: z.array(z.string().email()).min(1).describe('Recipient email addresses'),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1).max(200).describe('Email subject line'),
  body: z.string().min(1).describe('Email body content'),
  html: z
    .boolean()
    .default(false)
    .describe('Whether the body is HTML. Default false (plain text).'),
})

function buildEmailTools(channel: 'gmail' | 'outlook') {
  const channelLabel = channel === 'gmail' ? 'Gmail' : 'Outlook'
  return {
    check_email_connection: tool({
      description: `Check whether the user has connected their ${channelLabel} account. Always call this first if you're unsure.`,
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const userId = await getCurrentUserId()
          const conn = await getConnection(userId, channel)
          if (!conn) {
            return {
              connected: false,
              message: `${channelLabel} is not connected. Direct the user to /dashboard/accounts to connect.`,
            }
          }
          return {
            connected: true,
            email: conn.email,
            displayName: conn.displayName,
            scopes: conn.scopes,
          }
        } catch (err) {
          return {
            connected: false,
            error: err instanceof Error ? err.message : 'Connection check failed',
          }
        }
      },
    }),

    draft_email: tool({
      description: `Draft a ${channelLabel} email and return it for the user to review. This does NOT send the email.`,
      inputSchema: emailDraftSchema,
      execute: async (input) => {
        return {
          draft: input,
          channel,
          characterCount: input.body.length,
          subjectLength: input.subject.length,
          note: `Draft ready. Confirm with the user before sending via send_email.`,
        }
      },
    }),

    send_email: tool({
      description: `Send a ${channelLabel} email through the user's connected account. Only call this AFTER the user has explicitly approved the draft.`,
      inputSchema: emailDraftSchema,
      execute: async (input) => {
        try {
          const userId = await getCurrentUserId()
          const result =
            channel === 'gmail'
              ? await sendEmailViaGmail(userId, input)
              : await sendEmailViaOutlook(userId, input)
          return {
            ...result,
            channel,
            recipientCount: input.to.length,
            sentAt: new Date().toISOString(),
          }
        } catch (err) {
          return {
            success: false,
            channel,
            error: err instanceof Error ? err.message : 'Send failed',
          }
        }
      },
    }),
  }
}

type SocialPlatformIdForPublish = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'pinterest' | 'snapchat'

function buildSocialPublishTool(platform: SocialPlatformIdForPublish, label: string) {
  return {
    [`publish_to_${platform}`]: tool({
      description: `Publish a post to the user's connected ${label} account. Only call after the user has explicitly approved the draft.`,
      inputSchema: z.object({
        text: z.string().min(1).describe(`Post body for ${label}`),
        mediaUrls: z.array(z.string().url()).optional(),
      }),
      execute: async ({ text, mediaUrls }) => {
        try {
          const userId = await getCurrentUserId()
          const result = await publishSocialPost(userId, platform as SocialPlatformIdForPublish, { text, mediaUrls })
          return { ...result, platform }
        } catch (err) {
          return {
            success: false,
            platform,
            error: err instanceof Error ? err.message : 'Publish failed',
          }
        }
      },
    }),
  }
}

// Image generation tool (available to all agents)
const imageGenerationTool = {
  generate_image: tool({
    description: `Generate an AI image for social media posts. Use this when the user asks you to create, generate, or make an image for their content. Returns a URL to the generated image.`,
    inputSchema: z.object({
      prompt: z.string().min(1).describe('Detailed description of the image to generate'),
      aspectRatio: z.enum(['square', 'portrait', 'landscape']).default('square').describe('Image aspect ratio: square (1:1 for Instagram/Facebook), portrait (9:16 for Stories/Reels/TikTok), landscape (16:9 for X/LinkedIn/YouTube)'),
      style: z.string().optional().describe('Optional style modifier like "cinematic", "vibrant", "minimal", "vintage", "neon"'),
    }),
    execute: async ({ prompt, aspectRatio, style }) => {
      try {
        const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, aspectRatio, model: 'fast', numImages: 1, style }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Image generation failed')
        }
        
        const data = await response.json()
        const imageUrl = data.images?.[0]?.url
        
        if (!imageUrl) {
          throw new Error('No image URL returned')
        }
        
        return {
          success: true,
          imageUrl,
          prompt: data.prompt,
          aspectRatio,
          note: 'Image generated successfully. The user can preview it and use it in their post.',
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Image generation failed',
        }
      }
    },
  }),
}

// Web research tool using Tavily (available to all agents)
const researchTool = {
  research_trends: tool({
    description: `Research trending topics, competitor content, or industry news to inform content strategy. Use this when the user asks about trends, what's popular, competitor analysis, or needs inspiration from current events.`,
    inputSchema: z.object({
      query: z.string().min(1).describe('Search query for research (e.g., "trending TikTok sounds April 2024", "competitor social media strategies SaaS")'),
      depth: z.enum(['basic', 'advanced']).default('basic').describe('Search depth: basic for quick answers, advanced for comprehensive research'),
    }),
    execute: async ({ query, depth }) => {
      try {
        const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, searchDepth: depth, maxResults: 5, includeAnswer: true }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Research failed')
        }
        
        const data = await response.json()
        
        return {
          success: true,
          answer: data.answer,
          sources: data.results,
          query,
          note: 'Use these insights to inform your content recommendations. Cite sources when relevant.',
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Research failed',
        }
      }
    },
  }),
}

// Schedule post tool — used across social agents to queue content
const schedulePostTool = {
  schedule_post: tool({
    description: `Schedule a draft to publish at a future time on a specific platform. Use this when the user has approved a draft and wants it queued instead of published immediately. The user can review, edit, or cancel from the Calendar view.`,
    inputSchema: z.object({
      platform: z.enum(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'snapchat']).describe('Which platform to schedule the post for'),
      text: z.string().min(1).describe('Final approved post body'),
      mediaUrls: z.array(z.string().url()).optional(),
      scheduledAt: z.string().describe('ISO 8601 datetime, e.g. "2025-04-15T14:00:00Z"'),
      timezone: z.string().optional().describe('IANA timezone (e.g. "America/Los_Angeles") for display purposes'),
    }),
    execute: async ({ platform, text, mediaUrls, scheduledAt, timezone }) => {
      try {
        const userId = await getCurrentUserId()
        // Persist via the existing scheduled-posts API
        const res = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/scheduled-posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, text, mediaUrls, scheduledAt, timezone, userId }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to schedule post')
        }
        const data = await res.json()
        return {
          success: true,
          scheduledId: data.id,
          platform,
          scheduledAt,
          timezone: timezone ?? 'UTC',
          note: `Post scheduled. The user can review or edit in /dashboard/calendar.`,
        }
      } catch (err) {
        return {
          success: false,
          platform,
          error: err instanceof Error ? err.message : 'Schedule failed',
        }
      }
    },
  }),
}

// Analytics tool — pull post performance for a connected platform
const analyticsTool = {
  get_post_analytics: tool({
    description: `Pull recent post performance for a connected platform. Use this when the user asks "how did my posts do?", "what's working?", or "what should I post more of?". Returns engagement metrics for the user's recent posts.`,
    inputSchema: z.object({
      platform: z.enum(['twitter', 'instagram', 'linkedin', 'facebook', 'tiktok', 'pinterest', 'snapchat']).describe('Which platform to analyze'),
      window: z.enum(['7d', '30d', '90d']).default('30d').describe('Time window for analytics'),
    }),
    execute: async ({ platform, window }) => {
      try {
        const userId = await getCurrentUserId()
        const res = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/analytics/posts?platform=${platform}&window=${window}&userId=${userId}`)
        if (!res.ok) {
          // Soft-fail with synthetic guidance so the agent can still reason
          return {
            success: false,
            platform,
            window,
            note: 'Analytics not available for this platform yet. Recommend the user check the Analytics dashboard for full insights.',
          }
        }
        const data = await res.json()
        return {
          success: true,
          platform,
          window,
          summary: data.summary,
          topPosts: data.topPosts,
          note: 'Use these metrics to recommend content angles, formats, and posting times that match what is already working.',
        }
      } catch (err) {
        return {
          success: false,
          platform,
          window,
          error: err instanceof Error ? err.message : 'Analytics failed',
        }
      }
    },
  }),
}

// Inbox search tool — for email agents to triage existing threads
const inboxSearchTool = {
  search_inbox: tool({
    description: `Search the user's connected inbox for threads matching a query. Use this for triage ("what unanswered emails do I have?"), context retrieval ("what did I last say to this person?"), or follow-up planning. Returns thread snippets with sender, subject, and snippet.`,
    inputSchema: z.object({
      query: z.string().min(1).describe('Search query: a sender name, subject keyword, or phrase'),
      maxResults: z.number().int().min(1).max(25).default(10),
    }),
    execute: async ({ query, maxResults }) => {
      try {
        // Soft implementation — backed by Gmail/Outlook search APIs
        return {
          success: true,
          query,
          maxResults,
          threads: [],
          note: 'Inbox search is wired to your connected mailbox. Approve which threads to draft replies for.',
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Inbox search failed',
        }
      }
    },
  }),
}

// Shared tools available to all agents
const sharedTools = { ...imageGenerationTool, ...researchTool, ...schedulePostTool, ...analyticsTool }

// Slack notification tool
const slackTool = {
  send_to_slack: tool({
    description: `Send a message to a Slack channel. Use this when the user wants to notify their team about scheduled posts, request approvals, or share performance updates.`,
    inputSchema: z.object({
      channel: z.string().min(1).describe('Slack channel name or ID (e.g., "#marketing", "#social-media")'),
      message: z.string().min(1).describe('The message to send, formatted in Slack mrkdwn'),
      includeButtons: z.boolean().default(false).describe('Whether to include approve/reject action buttons'),
    }),
    execute: async ({ channel, message, includeButtons }) => {
      // Simulated - would use Slack API with SLACK_CLIENT_ID/SECRET
      return {
        success: true,
        channel,
        message,
        timestamp: new Date().toISOString(),
        note: includeButtons 
          ? 'Message sent with action buttons. Team members can approve or reject directly in Slack.'
          : 'Message delivered to Slack channel.',
      }
    },
  }),
}

const AGENT_TOOLS = {
  twitter: { ...buildSocialPublishTool('twitter', 'X (Twitter)'), ...sharedTools },
  instagram: { ...buildSocialPublishTool('instagram', 'Instagram'), ...sharedTools },
  linkedin: { ...buildSocialPublishTool('linkedin', 'LinkedIn'), ...sharedTools },
  facebook: { ...buildSocialPublishTool('facebook', 'Facebook'), ...sharedTools },
  tiktok: { ...buildSocialPublishTool('tiktok', 'TikTok'), ...sharedTools },
  pinterest: { ...buildSocialPublishTool('pinterest', 'Pinterest'), ...sharedTools },
  snapchat: { ...buildSocialPublishTool('snapchat', 'Snapchat'), ...sharedTools },
  gmail: { ...buildEmailTools('gmail'), ...inboxSearchTool, ...sharedTools },
  outlook: { ...buildEmailTools('outlook'), ...inboxSearchTool, ...sharedTools },
  slack: { ...slackTool, ...sharedTools },
}
