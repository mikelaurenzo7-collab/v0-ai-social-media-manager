import { streamText, tool, generateObject, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { getAgentById } from '@/lib/agents'

export const runtime = 'edge'

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
  const { messages, agentId, creativity, tone, memory } = (await req.json()) as {
    messages: UIMessage[],
    agentId?: string,
    creativity?: number,
    tone?: number,
    memory?: string
  }
  const modelMessages = await convertToModelMessages(messages)

  let systemPrompt = defaultSystemPrompt
  let temperature = 0.7

  if (agentId) {
    const agent = getAgentById(agentId)
    let memoryContext = ""
    if (memory) {
      try {
        const parsedMemory = JSON.parse(memory)
        memoryContext = `\n\nLONG-TERM MEMORY & CONTEXT:\n${parsedMemory.map((m: any) => `- ${m.content}`).join('\n')}`
      } catch (e) {}
    }

    const toneInstructions = tone ? `\n\nTONE ADJUSTMENT: Your tone should be ${tone > 70 ? 'highly casual and conversational' : tone < 30 ? 'strictly professional and formal' : 'balanced and modern'}.` : ""

    systemPrompt = `${agent.systemPrompt}${toneInstructions}${memoryContext}\n\nIn addition to your specific persona, you have access to the following shared capabilities:\n- Analyzing posts\n- Suggesting hashtags\n- Creating threads\n- Rewriting for platforms\n- Generating viral hooks\n- Content calendars\n- Bio optimization\n\nFormat: Keep responses professional yet persona-driven. Use bold text for emphasis. Be concise.`

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

const AGENT_TOOLS = {
  viral: {
    analyze_virality: tool({
      description: 'Analyze the virality potential of a post and give it a score.',
      inputSchema: z.object({
        content: z.string(),
      }),
      execute: async ({ content }) => {
        const { object } = await generateObject({
          model: anthropic('claude-3-5-haiku-20241022'),
          schema: z.object({
            score: z.number().min(1).max(100),
            reasoning: z.string(),
            improvement: z.string(),
          }),
          prompt: `Analyze this content for virality potential: ${content}`,
        })
        return object
      },
    }),
  },
  strategist: {
    strategic_alignment: tool({
      description: 'Check if a post aligns with brand pillars and long-term goals.',
      inputSchema: z.object({
        content: z.string(),
        pillars: z.array(z.string()),
      }),
      execute: async ({ content, pillars }) => {
        const { object } = await generateObject({
          model: anthropic('claude-3-5-haiku-20241022'),
          schema: z.object({
            alignmentScore: z.number().min(1).max(10),
            pillarMatches: z.array(z.string()),
            feedback: z.string(),
          }),
          prompt: `Check alignment for this content: ${content} against pillars: ${pillars.join(', ')}`,
        })
        return object
      },
    }),
  },
}
