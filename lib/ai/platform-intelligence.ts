/**
 * PostPilot AI Platform Intelligence
 * 
 * Deep knowledge about each social platform's algorithm, content formats,
 * best practices, and audience behavior patterns.
 */

export const PLATFORM_INTELLIGENCE = {
  twitter: {
    name: 'X (Twitter)',
    charLimit: 280,
    algorithm: {
      priorities: [
        'Replies and conversations boost reach more than likes',
        'Threads get 2-3x more impressions than single tweets',
        'First 30 minutes of engagement determine viral potential',
        'Quote tweets outperform retweets for algorithm visibility',
        'Posts with 1-2 hashtags perform better than 3+',
      ],
      bestFormats: ['Hot takes', 'Threads', 'Polls', 'Quote tweets', 'Lists'],
      peakTimes: 'Weekdays 8-10 AM and 6-9 PM, lunch hours',
    },
    contentRules: [
      'Keep under 280 characters for single tweets',
      'Use line breaks for readability - one idea per line',
      'Start with a hook in the first 7 words',
      'End with a question or call to engage',
      'Use 0-2 hashtags maximum - more looks spammy',
      'Threads should have a strong hook tweet and numbered format',
      'Avoid external links in tweets - put in replies instead',
    ],
    voiceGuidelines: {
      professional: 'Authoritative but approachable. Use industry terms naturally. Share insights like a trusted advisor.',
      casual: 'Talk like a friend sharing something cool. Short punchy sentences. Incomplete thoughts are fine.',
      witty: 'Observational humor. Subvert expectations. Self-deprecating beats arrogant. Memes welcome.',
      inspirational: 'Personal stories over generic quotes. Show vulnerability. Concrete > abstract.',
      educational: 'One insight per tweet. "Most people don\'t know..." or "Here\'s what I learned..." hooks work well.',
    },
  },
  instagram: {
    name: 'Instagram',
    charLimit: 2200,
    algorithm: {
      priorities: [
        'Saves and shares matter more than likes for reach',
        'Carousel posts get 3x more engagement than single images',
        'Reels have highest organic reach potential',
        'Caption length matters - longer captions drive saves',
        'First 125 characters show before "more" - make them count',
      ],
      bestFormats: ['Carousel tips', 'Before/After', 'Behind-the-scenes', 'Tutorial Reels', 'Story polls'],
      peakTimes: 'Weekdays 11 AM-1 PM, Tuesday and Thursday best',
    },
    contentRules: [
      'First line is your hook - it shows before "...more"',
      'Use line breaks and spacing for readability',
      'Include a clear call-to-action (save this, share with a friend, comment below)',
      'Use 20-30 hashtags in a separate comment or at end of caption',
      'Mix popular, niche, and branded hashtags',
      'Add location tags for local discovery',
      'Carousel posts: lead with the most compelling slide',
    ],
    voiceGuidelines: {
      professional: 'Polished but warm. Share expertise through stories. Use "you" language. End with clear CTAs.',
      casual: 'Authentic and relatable. Behind-the-scenes energy. Ask questions. Use conversational language.',
      witty: 'Playful captions that complement visuals. Pop culture references. Wordplay and puns work.',
      inspirational: 'Storytelling-first. Vulnerable moments. "Here\'s what nobody tells you about..." hooks.',
      educational: 'Value-packed lists and tips. "Save this for later" hooks. Step-by-step breakdowns.',
    },
  },
  facebook: {
    name: 'Facebook',
    charLimit: 63206,
    algorithm: {
      priorities: [
        'Meaningful interactions (comments, shares) > passive engagement',
        'Posts that spark conversations get higher reach',
        'Video content, especially live video, is heavily prioritized',
        'Group posts get more organic reach than page posts',
        'Stories and Reels are getting increasing visibility',
      ],
      bestFormats: ['Stories', 'Long-form posts', 'Live video', 'Polls', 'Community questions'],
      peakTimes: 'Wednesday 11 AM, Friday 10-11 AM, weekday afternoons',
    },
    contentRules: [
      'Longer posts often perform better than short ones',
      'Ask genuine questions to spark conversation',
      'Share personal stories - Facebook rewards authentic content',
      'Native video outperforms YouTube links',
      'Use 1-3 hashtags maximum - Facebook is not hashtag-driven',
      'Tag relevant people and pages when appropriate',
      'Use Facebook-specific features like polls, events, and fundraisers',
    ],
    voiceGuidelines: {
      professional: 'Thought leadership style. Longer-form insights. Industry news commentary. Community-building language.',
      casual: 'Like talking to family and friends. Personal updates. Shared experiences. Ask for opinions.',
      witty: 'Shareable humor. Relatable observations. Memes and cultural commentary. Keep it inclusive.',
      inspirational: 'Longer personal stories. Milestones and gratitude. Community shout-outs. Before/after journeys.',
      educational: 'How-to guides. Resource sharing. Expert Q&A format. "Did you know..." hooks.',
    },
  },
} as const

export type PlatformIntelligenceId = keyof typeof PLATFORM_INTELLIGENCE
