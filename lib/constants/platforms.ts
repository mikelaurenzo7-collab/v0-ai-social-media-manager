export const PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    shortName: 'X',
    maxLength: 280,
    color: '#000000',
    bgColor: 'bg-black',
    textColor: 'text-white',
    icon: 'twitter',
    features: ['Threads support', 'Hashtag optimization', 'Engagement hooks'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    maxLength: 2200,
    color: '#E4405F',
    bgColor: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    textColor: 'text-white',
    icon: 'instagram',
    features: ['Caption optimization', 'Hashtag strategy', 'Call-to-action'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'Facebook',
    maxLength: 63206,
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]',
    textColor: 'text-white',
    icon: 'facebook',
    features: ['Link previews', 'Engagement optimization', 'Audience targeting'],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    maxLength: 3000,
    color: '#0A66C2',
    bgColor: 'bg-[#0A66C2]',
    textColor: 'text-white',
    icon: 'linkedin',
    features: ['Professional tone', 'Industry hashtags', 'Thought leadership'],
  },
} as const

export type PlatformId = keyof typeof PLATFORMS

export const TONES = [
  { id: 'professional', name: 'Professional', description: 'Polished and business-appropriate' },
  { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
  { id: 'witty', name: 'Witty', description: 'Clever and entertaining' },
  { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
  { id: 'educational', name: 'Educational', description: 'Informative and helpful' },
  { id: 'bold', name: 'Bold', description: 'Confident and direct — no hedging' },
  { id: 'storytelling', name: 'Storytelling', description: 'Narrative-driven and personal' },
] as const

export type ToneId = typeof TONES[number]['id']

export const CONTENT_TYPES = [
  { id: 'promotional', name: 'Promotional', description: 'Showcase products or services' },
  { id: 'educational', name: 'Educational', description: 'Share knowledge and tips' },
  { id: 'entertaining', name: 'Entertaining', description: 'Engage and amuse your audience' },
  { id: 'personal', name: 'Personal', description: 'Share stories and experiences' },
  { id: 'announcement', name: 'Announcement', description: 'Share news and updates' },
  { id: 'thought-leadership', name: 'Thought Leadership', description: 'Industry expertise and insights' },
  { id: 'engagement', name: 'Engagement', description: 'Questions, polls, conversation starters' },
] as const

export type ContentTypeId = typeof CONTENT_TYPES[number]['id']

export const THREAD_TWEET_COUNTS = [3, 5, 7, 9, 12] as const

export type ThreadTweetCount = typeof THREAD_TWEET_COUNTS[number]
