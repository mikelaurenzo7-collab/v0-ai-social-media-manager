/**
 * Competitive comparison configs powering /compare/[competitor].
 * Honest comparisons — we say what they do well, not just what we do better.
 */

export interface CompetitorConfig {
  slug: 'buffer' | 'hootsuite' | 'later'
  name: string
  navLabel: string
  tagline: string
  shortIntro: string
  theyDoWell: string[]
  whereWeDiffer: { dim: string; them: string; us: string }[]
  whoShouldStay: string
  whoShouldSwitch: string
  features: { feature: string; them: 'yes' | 'no' | 'limited' | string; us: 'yes' | 'no' | 'limited' | string }[]
}

export const COMPETITORS: Record<CompetitorConfig['slug'], CompetitorConfig> = {
  buffer: {
    slug: 'buffer',
    name: 'Buffer',
    navLabel: 'PostPilot vs. Buffer',
    tagline: 'Great scheduler. Built for a different decade.',
    shortIntro:
      "Buffer pioneered social scheduling and they're still excellent at queuing posts across channels. PostPilot is built around AI agents that draft, design, and engage — scheduling is a means to an end. If you mostly need a queue, Buffer might be all you need. If you want creation + engagement + insights in one product, you'll outgrow it fast.",
    theyDoWell: [
      'Mature, predictable scheduler',
      'Clean cross-platform analytics dashboard',
      'Long track record + lots of integrations',
      'Familiar to teams that have used it for years',
    ],
    whereWeDiffer: [
      {
        dim: 'How content gets made',
        them: 'You write it. Buffer queues it.',
        us: 'Six channel-specialist AI agents draft, design (carousels, video storyboards, image briefs), and adapt across channels. You approve.',
      },
      {
        dim: 'Replies, mentions, DMs',
        them: 'Add-on (Buffer Engage) on higher tiers; basic.',
        us: 'Unified Inbox with sentiment + brand-voice replies suggested for every conversation, included on Pro.',
      },
      {
        dim: 'Brand consistency',
        them: 'You type it the same way each time.',
        us: 'Brand Kit with voice fingerprint + per-agent customization + adaptive memory that learns from your approvals.',
      },
      {
        dim: 'Insights',
        them: 'Analytics dashboard with charts.',
        us: 'Anomaly + opportunity feed with one-click "Try it" actions that draft the post implementing the insight.',
      },
    ],
    whoShouldStay:
      "If your workflow is 'write, queue, post' and you don't need help making the work — Buffer is solid and we'd rather you stay there than churn from us.",
    whoShouldSwitch:
      "If you're a creator, founder, or agency where the bottleneck is making the content (not scheduling it), and you want voice-consistent output across X, LinkedIn, IG, TikTok, Gmail, and Outlook — switch.",
    features: [
      { feature: 'Multi-platform scheduling', them: 'yes', us: 'yes' },
      { feature: 'AI agents that draft + design + adapt', them: 'limited', us: 'yes' },
      { feature: 'Unified inbox across platforms', them: 'limited', us: 'yes' },
      { feature: 'Brand voice training', them: 'no', us: 'yes' },
      { feature: 'Carousel / video storyboards', them: 'no', us: 'yes' },
      { feature: 'Crisis mode (one-tap pause)', them: 'no', us: 'yes' },
      { feature: 'Public REST API + webhooks', them: 'limited', us: 'yes' },
      { feature: 'Per-agent permission gating', them: 'no', us: 'yes' },
      { feature: 'Audit log (SIEM stream)', them: 'no', us: 'yes' },
      { feature: 'Workspace switcher for agencies', them: 'limited', us: 'yes' },
    ],
  },
  hootsuite: {
    slug: 'hootsuite',
    name: 'Hootsuite',
    navLabel: 'PostPilot vs. Hootsuite',
    tagline: 'Enterprise heavy. Built before AI agents.',
    shortIntro:
      "Hootsuite is the enterprise-grade option for big social teams — every feature, every channel, every report. The flip side is the price tag, the learning curve, and a UI that predates AI co-pilots. PostPilot trades depth-of-features for depth-of-AI: fewer dashboards, more agents that actually do the work.",
    theyDoWell: [
      'Battle-tested at large scale (10k+ social teams)',
      'Deep enterprise compliance + custom MSAs',
      'Massive integration catalog',
      'Mature reporting / analytics across many channels',
    ],
    whereWeDiffer: [
      {
        dim: 'Pricing',
        them: 'Plans start at $99/seat/mo and rise quickly.',
        us: 'Pro at $29/mo unlocks every agent + Studio + Auto-Pilot. Business at $99/workspace (not per seat) for teams.',
      },
      {
        dim: 'Time-to-first-post',
        them: 'Days of onboarding for new teams.',
        us: 'Five-step welcome wizard. First draft in under 5 minutes.',
      },
      {
        dim: 'AI defaults',
        them: 'AI assistant bolted on; you still build dashboards.',
        us: 'AI agents are the product. Six specialists, one per channel, working in concert.',
      },
      {
        dim: 'Trust posture',
        them: 'Enterprise compliance you have to dig for in PDF docs.',
        us: 'Public security page, sub-processor table, status page, changelog, roadmap. All linked from the footer.',
      },
    ],
    whoShouldStay:
      "If you're a 100+ person social team at a Fortune 500 with regulatory needs Hootsuite has explicitly addressed for years — they earned that position.",
    whoShouldSwitch:
      "If you're a team of 1–50 building something modern, want AI as the foundation (not a tab), and don't want to rebuild your stack around enterprise procurement — switch.",
    features: [
      { feature: 'Multi-platform scheduling', them: 'yes', us: 'yes' },
      { feature: 'AI agents that draft + design', them: 'limited', us: 'yes' },
      { feature: 'Unified inbox', them: 'yes', us: 'yes' },
      { feature: 'Brand voice training', them: 'limited', us: 'yes' },
      { feature: 'Public roadmap', them: 'no', us: 'yes' },
      { feature: 'SOC 2', them: 'yes', us: 'yes (Type 1 done, Type 2 in motion)' },
      { feature: 'Per-channel ai specialist', them: 'no', us: 'yes' },
      { feature: 'Reasonable price under 50 seats', them: 'no', us: 'yes' },
      { feature: 'Crisis mode', them: 'no', us: 'yes' },
      { feature: 'Adaptive per-agent memory', them: 'no', us: 'yes' },
    ],
  },
  later: {
    slug: 'later',
    name: 'Later',
    navLabel: 'PostPilot vs. Later',
    tagline: 'Visual planner. Mostly Instagram.',
    shortIntro:
      "Later is a beautiful visual content planner with a strong Instagram heritage — link-in-bio, grid preview, Pinterest scheduler. PostPilot covers more channels, more deeply, and the AI agents do the actual writing. If you live mostly on Instagram and your bottleneck is the grid, Later might be it.",
    theyDoWell: [
      'Instagram-first design philosophy (grid preview, hashtag suggestions)',
      'Excellent link-in-bio product',
      'Visual content calendar that looks like Instagram',
      'Solid Pinterest support',
    ],
    whereWeDiffer: [
      {
        dim: 'Channels covered deeply',
        them: 'Instagram-first; others are bolted on.',
        us: 'Six channels with a specialist agent each. X, Meta, LinkedIn, TikTok, Gmail, Outlook all first-class.',
      },
      {
        dim: 'Email outreach',
        them: 'Not in the product.',
        us: 'Gmail Agent + Outlook Agent for cold outreach, follow-ups, executive comms — same workspace.',
      },
      {
        dim: 'AI authoring',
        them: 'Caption generator (basic).',
        us: 'Studio multi-format remix, image briefs, video storyboards, carousel design — all collaborated by channel agents.',
      },
      {
        dim: 'Audit + compliance',
        them: 'Basic team controls.',
        us: 'Roles + agent access matrix + audit log + Crisis Mode + SIEM stream.',
      },
    ],
    whoShouldStay:
      'Pure Instagram play with a heavy emphasis on visual planning and link-in-bio? Later is purpose-built for that.',
    whoShouldSwitch:
      "Need to publish across multiple channels, want AI to do the writing (not just the scheduling), or care about email + audit log? Switch.",
    features: [
      { feature: 'Instagram + Meta', them: 'yes', us: 'yes' },
      { feature: 'X / TikTok / LinkedIn', them: 'limited', us: 'yes' },
      { feature: 'Email channel (Gmail + Outlook)', them: 'no', us: 'yes' },
      { feature: 'AI agents that draft', them: 'limited', us: 'yes' },
      { feature: 'Carousel storyboards', them: 'no', us: 'yes' },
      { feature: 'Video script + storyboard', them: 'no', us: 'yes' },
      { feature: 'Brand voice fingerprint', them: 'no', us: 'yes' },
      { feature: 'Audit log', them: 'no', us: 'yes' },
      { feature: 'Crisis mode', them: 'no', us: 'yes' },
      { feature: 'Link in bio', them: 'yes', us: 'no' },
    ],
  },
}
