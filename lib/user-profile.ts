// ── User Profile ─────────────────────────────────────────────────────────────
// Single source of truth for everything an agent needs to know about the user.
// Persisted in localStorage under USER_PROFILE_KEY and passed to the chat route
// on every message so every agent operates with full context.

export type UserMode = 'business' | 'creator' | 'personal'

export type UserGoal =
  | 'growth'           // followers, reach, awareness
  | 'leads'            // sign-ups, demos, inbound interest
  | 'sales'            // direct revenue, conversions
  | 'community'        // engagement, retention, belonging
  | 'authority'        // thought leadership, credibility
  | 'monetization'     // sponsorships, ad revenue, creator income
  | 'personal-brand'   // career capital, networking, opportunities
  | 'recruiting'       // hiring, employer brand
  | 'support'          // customer service, replies, help

export type HashtagStyle = 'minimal' | 'moderate' | 'heavy'

export type PostingFrequency = 'daily' | '3x_week' | '5x_week' | 'custom'

export interface PerAgentDefaults {
  // Slack
  slackDefaultChannel?: string
  slackEscalationChannel?: string
  // Pinterest
  pinterestDefaultBoard?: string
  // Email (Gmail + Outlook)
  emailSignature?: string
  emailSenderName?: string
  emailFollowUpCadence?: string // e.g. "Day +3, +7, +14"
  // Social platforms
  defaultUtmSource?: string
  defaultUtmMedium?: string
  // LinkedIn
  linkedinPutLinksInComments?: boolean
  // Twitter / X
  twitterAvoidHashtags?: boolean
  // Instagram
  instagramHashtagCount?: number
  // TikTok
  tiktokDefaultTrendingSound?: boolean
}

export interface UserProfile {
  // Identity
  name: string
  email?: string
  brandName?: string
  website?: string

  // Mode — drives audience-aware behavior across every agent
  mode: UserMode

  // Strategy
  goals: UserGoal[]
  audience: string                 // freeform: "marketing managers at mid-sized e-com brands"
  contentPillars: string[]         // 3–5 themes the user posts about
  brandKeywords: string[]          // topical/SEO keywords

  // Voice
  brandVoice: string               // freeform tone description
  doWords: string[]                // phrases / words the agent must use when natural
  dontWords: string[]              // phrases / words the agent must never use
  defaultTone: string              // 'casual' | 'professional' | 'witty' | etc.

  // Cadence
  postingFrequency: PostingFrequency
  timezone: string

  // Tactical defaults
  hashtagStyle: HashtagStyle
  preferredContentTypes: string[]  // 'educational' | 'thought-leadership' | etc.

  // Per-agent platform-specific defaults
  perAgent: Record<string, PerAgentDefaults>
}

export const USER_PROFILE_KEY = 'user_profile_v1'

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  brandName: '',
  website: '',
  mode: 'creator',
  goals: ['growth', 'community'],
  audience: '',
  contentPillars: [],
  brandKeywords: [],
  brandVoice: '',
  doWords: [],
  dontWords: [],
  defaultTone: 'casual',
  postingFrequency: '3x_week',
  timezone: 'America/New_York',
  hashtagStyle: 'minimal',
  preferredContentTypes: ['educational', 'thought-leadership'],
  perAgent: {},
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY)
    if (!raw) return DEFAULT_USER_PROFILE
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    return { ...DEFAULT_USER_PROFILE, ...parsed, perAgent: { ...DEFAULT_USER_PROFILE.perAgent, ...(parsed.perAgent ?? {}) } }
  } catch {
    return DEFAULT_USER_PROFILE
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // quota exceeded or storage disabled — silent fail
  }
}

// ── Server-side: format profile into a system-prompt block ──────────────────
// The chat route calls this to produce an authoritative context block injected
// into every agent's system prompt.

export function userProfileToContext(profile: Partial<UserProfile> | null | undefined, agentId?: string): string {
  if (!profile || typeof profile !== 'object') return ''

  const lines: string[] = []
  const push = (label: string, value: string | undefined) => {
    if (value && value.trim()) lines.push(`- ${label}: ${value.trim()}`)
  }
  const pushList = (label: string, values: string[] | undefined) => {
    if (values && values.length > 0) lines.push(`- ${label}: ${values.join(', ')}`)
  }

  // Mode — the most important signal
  if (profile.mode) {
    const modeDescription =
      profile.mode === 'business'
        ? 'Business / Brand operator. Optimize for ROI, brand consistency, and measurable conversion. Calendar-driven cadence. Avoid casual register unless explicitly requested.'
        : profile.mode === 'creator'
        ? 'Creator / Influencer. Optimize for growth, engagement, and monetization. Trend-responsive cadence. Personal voice over corporate voice. Treat every post as a chance to deepen audience connection.'
        : 'Personal account. Optimize for authenticity and low-effort consistency. No marketing register, no growth-hacking energy. Only post when the user has something real to say.'
    lines.push(`- Mode: ${profile.mode.toUpperCase()} — ${modeDescription}`)
  }

  push('Name', profile.name)
  push('Brand / Business', profile.brandName)
  push('Website', profile.website)
  push('Target audience', profile.audience)
  push('Brand voice', profile.brandVoice)
  push('Default tone', profile.defaultTone)
  push('Posting frequency', profile.postingFrequency)
  push('Timezone', profile.timezone)
  push('Hashtag style', profile.hashtagStyle)

  pushList('Goals', profile.goals)
  pushList('Content pillars', profile.contentPillars)
  pushList('Brand keywords', profile.brandKeywords)
  pushList('Preferred content types', profile.preferredContentTypes)
  pushList('Words / phrases to USE when natural', profile.doWords)
  pushList('Words / phrases to NEVER USE', profile.dontWords)

  // Per-agent defaults relevant to this conversation
  if (agentId && profile.perAgent && profile.perAgent[agentId]) {
    const a = profile.perAgent[agentId]
    const agentLines: string[] = []
    if (a.slackDefaultChannel) agentLines.push(`Default Slack channel: ${a.slackDefaultChannel}`)
    if (a.slackEscalationChannel) agentLines.push(`Escalation channel: ${a.slackEscalationChannel}`)
    if (a.pinterestDefaultBoard) agentLines.push(`Default Pinterest board: ${a.pinterestDefaultBoard}`)
    if (a.emailSignature) agentLines.push(`Email signature:\n${a.emailSignature}`)
    if (a.emailSenderName) agentLines.push(`Sender display name: ${a.emailSenderName}`)
    if (a.emailFollowUpCadence) agentLines.push(`Follow-up cadence: ${a.emailFollowUpCadence}`)
    if (a.defaultUtmSource) agentLines.push(`Default UTM source: ${a.defaultUtmSource}`)
    if (a.defaultUtmMedium) agentLines.push(`Default UTM medium: ${a.defaultUtmMedium}`)
    if (a.linkedinPutLinksInComments) agentLines.push(`Always put links in the first comment, never in the post body`)
    if (a.twitterAvoidHashtags) agentLines.push(`Never use hashtags on X`)
    if (typeof a.instagramHashtagCount === 'number') agentLines.push(`Instagram hashtag count: ${a.instagramHashtagCount}`)
    if (a.tiktokDefaultTrendingSound) agentLines.push(`Always suggest a trending sound for TikTok scripts`)
    if (agentLines.length > 0) {
      lines.push('')
      lines.push('Platform-specific defaults for this agent:')
      agentLines.forEach((l) => lines.push(`- ${l}`))
    }
  }

  if (lines.length === 0) return ''

  return `\n\nUSER PROFILE (authoritative — apply to every draft, every recommendation, every tool call):\n${lines.join('\n')}\n\nRules:\n- The Mode field above governs voice, register, and cadence. Match it.\n- Bias every suggestion toward the user's Goals.\n- Stay inside the Content pillars unless the user explicitly asks you to explore outside them.\n- Words to NEVER USE are absolute — substitute even when they would be natural.\n- Words to USE when natural are preferred but never forced.`
}
