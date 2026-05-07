'use client'

import { useState } from 'react'
import { PLATFORMS, SOCIAL_PLATFORM_IDS, type SocialPlatformId } from '@/lib/constants/platforms'
import { PlatformIcon } from '@/components/create/platform-selector'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { Agent } from '@/lib/agents'

const AGENT_PLATFORM_ADVICE: Record<string, Record<SocialPlatformId, { headline: string; tips: string[]; formats: string[] }>> = {
  linkedin: {
    twitter: {
      headline: 'Build a thread-first X strategy',
      tips: [
        'Post daily at consistent times to train your audience\'s expectations',
        'Use threads for deep-dives; reserve single tweets for hot takes and reactions',
        'Spend 15 min after posting engaging with 5–10 accounts in your niche',
      ],
      formats: ['Daily insight thread', 'Weekly recap thread', 'Pinned strategy post'],
    },
    instagram: {
      headline: 'Carousel-first for maximum saves and reach',
      tips: [
        'Build 3–4 content pillars: Educational, Motivational, Behind-the-Scenes, Promotional',
        'The 3×1 rule: 3 value posts for every 1 promotional post',
        'Daily Stories keep you top-of-mind even when you don\'t post to feed',
      ],
      formats: ['Educational carousel', 'Before/After carousel', 'Story series', 'Monthly theme Reel'],
    },
    facebook: {
      headline: 'Community-first Facebook strategy',
      tips: [
        'Facebook Groups outperform pages — create one around your niche',
        'Post 3–5× per week to maintain organic reach',
        'Native video beats external links — upload directly every time',
      ],
      formats: ['Long-form story post', 'Native video', 'Group discussion prompt', 'Monthly event'],
    },
    linkedin: {
      headline: 'Thought leadership that builds lasting authority',
      tips: [
        'Publish one long-form article per week to grow your newsletter subscribers',
        'Respond to comments within the first 90 minutes to boost algorithm velocity',
        'Mix personal stories with professional insights at 50/50 for maximum reach',
      ],
      formats: ['Personal lesson post', 'Data insight post', 'Document carousel', 'Newsletter article'],
    },
    tiktok: {
      headline: 'Consistency beats perfection on TikTok',
      tips: [
        'Post 1–2× per day — the algorithm rewards volume above all else',
        'Batch-shoot 5–10 videos in one session to stay consistent all week',
        'Plan a 30-day calendar with repeating series so you never face a blank page',
      ],
      formats: ['Educational series', 'Day-in-the-life', 'Tips & tricks', 'Weekly recurring format'],
    },
  },
  x: {
    twitter: {
      headline: 'Dominate the feed with hooks and hot takes',
      tips: [
        'Every tweet needs a hook in the first 8 words — test 3 versions and pick the best',
        'Controversial (not offensive) opinions get 5× more replies than safe statements',
        'Reply to viral tweets in your niche within 15 minutes while the thread is hot',
      ],
      formats: ['Hot take', 'Unpopular opinion thread', 'Bold prediction', 'Behind-the-numbers exposé'],
    },
    instagram: {
      headline: 'Reels are your #1 growth lever right now',
      tips: [
        'Put 80% of your Instagram effort into Reels — they get 3× more reach than carousels',
        'Hook in the first 0.5 seconds: use text overlay, sudden movement, or a bold statement',
        'Remix and stitch trending Reels with your own unique take to piggyback on reach',
      ],
      formats: ['Trending audio Reel', 'POV content', 'Transformation Reel', 'Collab Reel'],
    },
    facebook: {
      headline: 'Emotional triggers drive shares — engineer them',
      tips: [
        'Lead every post with a story that triggers curiosity, surprise, or nostalgia',
        'Short video under 60 seconds with captions performs best in the feed',
        'The most-shared posts on Facebook make people feel something real',
      ],
      formats: ['Emotional story video', 'Viral list post', 'Opinion question', 'Relatable story'],
    },
    linkedin: {
      headline: 'Pattern-interrupt the boring professional feed',
      tips: [
        'Open with a shocking stat or bold claim — never a greeting or "I\'m excited to share"',
        'Contrarian takes in your industry get massive engagement from experts who want to debate',
        'Story structure that works: Hook → Tension → Resolution → Lesson',
      ],
      formats: ['Contrarian take', 'Failure/lesson story', 'Industry myth-bust', 'Data-driven hot take'],
    },
    tiktok: {
      headline: 'Engineer your way to the For You Page',
      tips: [
        'You have 1.5 seconds to hook — use visual shock, text overlay, or a cliffhanger question',
        'Use trending sounds on your niche topics (the audio remix strategy that top creators use)',
        'Watch your retention curve in analytics — every dip tells you where people leave',
      ],
      formats: ['Trending sound + niche twist', 'Story-driven video', 'Tutorial with surprise ending', 'Controversial take'],
    },
  },
  meta: {
    twitter: {
      headline: 'Write with your authentic voice every single day',
      tips: [
        'Read 10 tweets from your target persona before writing — absorb the rhythm and voice',
        'Never use corporate-speak; write the way you talk in actual conversations',
        'Your unique perspective is your competitive moat — sound like no one else',
      ],
      formats: ['Personal reflection', 'Voice-first single tweet', 'Authentic thread', 'Unfiltered take'],
    },
    instagram: {
      headline: 'Your caption voice is your brand\'s fingerprint',
      tips: [
        'Write your first draft, then rewrite it as if speaking to one specific person',
        'Create a 20-word brand vocabulary and use it consistently across every caption',
        'Stories can be 20% more casual than feed captions — it creates depth',
      ],
      formats: ['Personal caption post', 'Brand voice carousel', 'Story poll', 'Behind-the-brand Story'],
    },
    facebook: {
      headline: 'Conversational tone is what wins on Facebook',
      tips: [
        'Write as if talking to a friend at coffee — no corporate language',
        'Ask yourself "would I say this out loud?" — if no, rewrite it',
        'Emojis used sparingly reinforce personality without feeling performative',
      ],
      formats: ['Conversation-starter post', 'Personal story', 'Behind-the-brand post', 'Open Q&A'],
    },
    linkedin: {
      headline: 'Professional authority with human soul',
      tips: [
        'LinkedIn readers want expertise + humanity in equal measure',
        'Vulnerability done tastefully outperforms any pure thought leadership piece',
        'Write in first person; cut all passive voice and corporate jargon ruthlessly',
      ],
      formats: ['Personal lesson post', 'Professional story', 'Considered opinion', 'Gratitude post'],
    },
    tiktok: {
      headline: 'Be yourself on camera — that\'s literally the algorithm',
      tips: [
        'Scripted TikToks feel fake and destroy watch time — speak naturally',
        'Your accent, mannerisms, and quirks are features, not bugs — embrace them',
        'First-person storytelling structure: "This is what happened to me..." always wins',
      ],
      formats: ['Talking-head story', 'Day-in-my-life', 'Unfiltered opinion', 'Q&A response video'],
    },
  },
  tiktok: {
    twitter: {
      headline: 'Reply-first strategy is your fastest path to loyal followers',
      tips: [
        'Spend 20 minutes per day replying — both to your posts and others\' in your niche',
        'Quote-tweet your followers\' wins publicly — they\'ll remember it forever',
        'Create a weekly ritual (e.g., #WinWednesday featuring community achievements)',
      ],
      formats: ['Community spotlight', 'Weekly ritual thread', 'Audience input poll', 'Reply-worthy open question'],
    },
    instagram: {
      headline: 'Stories are your real community hub',
      tips: [
        'Use polls, questions, and sliders every day — these create the most replies',
        'Reply to every DM within 24 hours — even just a voice note or emoji',
        'Create a Close Friends story for your most engaged 10% of followers',
      ],
      formats: ['Poll story', 'Q&A story', 'Community shoutout post', 'UGC repost'],
    },
    facebook: {
      headline: 'Build a community, not just a following',
      tips: [
        'Create or join a Facebook Group and become the most helpful person in it',
        'Ask open-ended questions that invite personal stories — not yes/no questions',
        'Comment meaningfully on your followers\' own posts — it builds deep loyalty',
      ],
      formats: ['Community question post', 'Member spotlight', 'Weekly group challenge', 'Monthly check-in'],
    },
    linkedin: {
      headline: 'Your comments are more powerful than your posts',
      tips: [
        'Leave one thoughtful paragraph comment daily on posts from industry leaders',
        'Respond to every comment on your own posts within the first 2 hours',
        'Tag and celebrate community members publicly — they\'ll amplify everything you post',
      ],
      formats: ['Community appreciation post', 'Engagement question', 'Collaborative poll', 'Industry discussion'],
    },
    tiktok: {
      headline: 'Reply with videos to create conversation chains',
      tips: [
        'Reply to comments with video responses — TikTok heavily rewards this',
        'Pin a question comment to every video to drive comment volume',
        'Go LIVE once per week — TikTok LIVE creates the deepest community bonds of any feature',
      ],
      formats: ['Comment-reply video', 'Duet with a follower', 'LIVE Q&A session', 'Community challenge'],
    },
  },
}

interface AgentPlatformConfigProps {
  agent: Agent
}

export function AgentPlatformConfig({ agent }: AgentPlatformConfigProps) {
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<SocialPlatformId>>(
    new Set(['twitter', 'instagram', 'linkedin'] as SocialPlatformId[])
  )
  const [expandedPlatform, setExpandedPlatform] = useState<SocialPlatformId | null>('twitter')

  const advice = AGENT_PLATFORM_ADVICE[agent.id] ?? AGENT_PLATFORM_ADVICE['linkedin']

  const togglePlatform = (platformId: SocialPlatformId) => {
    setEnabledPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(platformId)) {
        next.delete(platformId)
      } else {
        next.add(platformId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Platform Configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how {agent.name} operates across each of your platforms. Toggle platforms on or off, then expand each one for agent-specific strategy.
        </p>
      </div>

      <div className="space-y-3">
        {SOCIAL_PLATFORM_IDS.map((platformId) => {
          const platform = PLATFORMS[platformId]
          const isEnabled = enabledPlatforms.has(platformId)
          const isExpanded = expandedPlatform === platformId && isEnabled
          const platformAdvice = advice[platformId]

          return (
            <div
              key={platformId}
              className={cn(
                'rounded-2xl border transition-all duration-300',
                isEnabled
                  ? 'border-orange-200/60 shadow-sm'
                  : 'border-border/60'
              )}
              style={isEnabled ? { background: 'linear-gradient(135deg, #FFF8F5 0%, #ffffff 100%)' } : { background: 'var(--card)' }}
            >
              {/* Platform header row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-opacity', !isEnabled && 'opacity-40')}
                  style={{ background: platform.color === '#000000' ? '#111827' : platform.color }}
                >
                  <PlatformIcon platform={platformId} className="h-4 w-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', !isEnabled && 'text-muted-foreground')}>{platform.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isEnabled ? `${platform.contentFormats.length} content formats` : 'Disabled'}
                  </p>
                </div>

                {isEnabled && (
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-1"
                    onClick={() => setExpandedPlatform(isExpanded ? null : platformId)}
                  >
                    {isExpanded ? 'Collapse ↑' : 'Configure ↓'}
                  </button>
                )}

                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => togglePlatform(platformId)}
                />
              </div>

              {/* Expanded strategy panel */}
              {isExpanded && (
                <div className="border-t border-orange-100/80 px-5 pb-5 pt-4 space-y-5">

                  {/* Agent's headline strategy */}
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'linear-gradient(135deg, #EA580C12 0%, #DB277712 100%)', border: '1px solid #EA580C22' }}
                  >
                    <p className="text-sm font-semibold leading-snug" style={{ color: '#EA580C' }}>
                      {agent.name}&apos;s strategy: {platformAdvice.headline}
                    </p>
                  </div>

                  {/* Agent-specific tips */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {agent.name}&apos;s Playbook for {platform.shortName}
                    </p>
                    {platformAdvice.tips.map((tip, i) => (
                      <div key={i} className="flex gap-3">
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recommended formats */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Recommended Content Formats
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {platformAdvice.formats.map((fmt) => (
                        <span
                          key={fmt}
                          className="rounded-full border border-orange-200/70 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Algorithm tips from platform constants */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {platform.shortName} Algorithm Tips
                    </p>
                    <div className="space-y-1.5">
                      {platform.algorithmTips.slice(0, 3).map((tip, i) => (
                        <div key={i} className="flex gap-2.5 rounded-lg bg-muted/40 px-3 py-2 border border-border/40">
                          <span className="text-sm shrink-0">⚡</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content format grid */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      All Supported Formats
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {platform.contentFormats.map((fmt) => (
                        <div key={fmt} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5">
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#EA580C' }} />
                          <span className="text-xs text-foreground/80">{fmt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary footer */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'oklch(0.135 0.018 48)' }}
      >
        <div className="flex -space-x-1.5">
          {[...enabledPlatforms].map((p) => (
            <div
              key={p}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-white"
              style={{
                background: PLATFORMS[p].color === '#000000' ? '#111827' : PLATFORMS[p].color,
                borderColor: 'oklch(0.135 0.018 48)',
              }}
            >
              <PlatformIcon platform={p} className="h-3 w-3" />
            </div>
          ))}
        </div>
        <p className="text-sm text-white/80 flex-1">
          {agent.name} is active on{' '}
          <span className="font-semibold text-white">{enabledPlatforms.size} platform{enabledPlatforms.size !== 1 ? 's' : ''}</span>
        </p>
      </div>
    </div>
  )
}
