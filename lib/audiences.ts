/**
 * Marketing-side audience configs powering /for/[audience].
 * Each one re-frames the same product around a specific reader.
 */

export interface AudienceConfig {
  slug: 'founders' | 'agencies' | 'creators'
  navLabel: string
  eyebrow: string
  title: string
  titleAccent: string
  subhead: string
  pains: { emoji: string; pain: string; fix: string }[]
  spotlightAgents: { id: string; reason: string }[]
  killerFeatures: { emoji: string; title: string; body: string }[]
  testimonial: {
    quote: string
    name: string
    role: string
  }
  ctaTitle: string
  ctaSub: string
}

export const AUDIENCES: Record<AudienceConfig['slug'], AudienceConfig> = {
  founders: {
    slug: 'founders',
    navLabel: 'For founders',
    eyebrow: 'Indie founders, solo operators, "team of one + 6 agents"',
    title: 'Build in public',
    titleAccent: 'without the calendar',
    subhead:
      'You\'re shipping product, hiring, talking to customers, and somehow expected to also post every day. PostPilot lets six channel agents draft, schedule, and engage in your voice — you keep approval, the pace, and the receipts.',
    pains: [
      {
        emoji: '🌀',
        pain: 'Posting consistency dies the week things get busy',
        fix: 'Auto-Pilot keeps a steady cadence; Crisis Mode pauses everything in one tap when a real fire shows up.',
      },
      {
        emoji: '🪞',
        pain: 'Every post starts to sound like a generic AI tweet',
        fix: 'Brand Kit + per-agent Customize keep your voice consistent across X, LinkedIn, and TikTok. Memories grow per agent.',
      },
      {
        emoji: '⚡',
        pain: 'Replies pile up faster than you can answer them',
        fix: 'Inbox triages every reply, mention, and DM with sentiment + brand-voice draft — approve in one tap.',
      },
    ],
    spotlightAgents: [
      { id: 'x', reason: 'Threads when you have lessons to share. Hot takes that drive comment volume.' },
      { id: 'linkedin', reason: 'Personal-story posts that pull 7× your average. The bread-and-butter for early-stage credibility.' },
      { id: 'gmail', reason: 'Cold intros and partnership notes that read like a senior salesperson, not a bot.' },
    ],
    killerFeatures: [
      {
        emoji: '🧵',
        title: 'Studio: one prompt, every format',
        body: 'Drop "we hit 10k customers" in Studio. Get back the LinkedIn post, the X thread, the IG carousel, the TikTok script, the founder note — collaborated on by every channel agent. Pick what ships.',
      },
      {
        emoji: '🛑',
        title: 'Crisis Mode',
        body: 'Customer complaint blowing up? One tap halts every agent and the entire scheduled queue. Server-side enforcement, not a UI flag.',
      },
      {
        emoji: '🎯',
        title: 'Insights that point at action',
        body: '"Your Wed 9 AM LinkedIn slot beats every other window 2.4×." Each insight has a one-click "Try it" that drafts a post.',
      },
    ],
    testimonial: {
      quote:
        "I shipped a thread, a LinkedIn post, two follow-up emails, and a TikTok script for our launch in the time it used to take me to write one tweet. The agents already sound like me.",
      name: 'Maya Chen',
      role: 'Founder, Ratio',
    },
    ctaTitle: 'Build the company. The agents handle the rest.',
    ctaSub: 'Free for solo. Pro at $29/mo unlocks everything except teams.',
  },
  agencies: {
    slug: 'agencies',
    navLabel: 'For agencies',
    eyebrow: 'Agencies running 5+ clients',
    title: 'Run every client',
    titleAccent: 'without the chaos',
    subhead:
      'Multi-workspace operator console, audit-logged approvals, role-based permissions, agent access matrix, and a public API your ops team can build on. Treat each client like its own brand. Bill it, audit it, sleep at night.',
    pains: [
      {
        emoji: '🔀',
        pain: 'Switching between client accounts loses context every time',
        fix: 'Workspace switcher in the sidebar. Each workspace has its own Brand Kit, agents, audit log, and team.',
      },
      {
        emoji: '🪪',
        pain: 'Approvers, editors, and viewers all need different power',
        fix: 'Five built-in roles (Owner / Admin / Editor / Approver / Viewer) plus a per-member agent access matrix. Approvers approve; editors edit; viewers stay out of trouble.',
      },
      {
        emoji: '📜',
        pain: 'Compliance audits are the worst week of every quarter',
        fix: 'Every action is logged and streamable to your SIEM (Business plan). SOC 2 Type 1 complete; Type 2 in motion.',
      },
    ],
    spotlightAgents: [
      { id: 'linkedin', reason: 'For B2B clients — long-form, thought leadership, document carousels.' },
      { id: 'meta', reason: 'For consumer brands — Instagram + Facebook, carousel-first.' },
      { id: 'gmail', reason: 'For sales-driven clients — cold outreach with reply-driven deliverability.' },
    ],
    killerFeatures: [
      {
        emoji: '🏢',
        title: 'Workspace per client',
        body: 'Each client gets isolated brand kits, agents, audit logs, and team. Switch with one keystroke. New workspace ships with the same six channel agents already trained on the new brand.',
      },
      {
        emoji: '✅',
        title: 'Multi-stage approvals',
        body: 'Editor drafts. Approver clears. Owner publishes. Or any combination — agents pick from the approver list you configure per agent.',
      },
      {
        emoji: '🛠',
        title: 'API + webhooks',
        body: 'Build PostPilot into your stack. Trigger workflows from internal tools, stream events to your SIEM, automate billing per workspace.',
      },
    ],
    testimonial: {
      quote:
        "We replaced three tools and one full-time scheduler. The audit log was the deal-closer for our regulated clients — they could prove who approved what, when, with one export.",
      name: 'Daniel Reyes',
      role: 'Founder, Northwave',
    },
    ctaTitle: 'Built for agencies. Trusted by teams shipping for clients.',
    ctaSub: 'Business at $99/workspace/mo. Talk to sales for 5+ workspaces.',
  },
  creators: {
    slug: 'creators',
    navLabel: 'For creators',
    eyebrow: 'Creators, indie media, founders-of-one',
    title: 'Show up everywhere.',
    titleAccent: 'Without burning out.',
    subhead:
      'You\'re the show. The agents are the production team. They turn one idea into a thread, a Reel, a carousel, an email — all in your voice — so you can focus on the work and not the publishing schedule.',
    pains: [
      {
        emoji: '🎙',
        pain: 'You\'re a one-person production team and it shows',
        fix: 'Studio remixes one prompt into every format. The agents collaborate; you pick what ships.',
      },
      {
        emoji: '🪜',
        pain: 'Growth across platforms means doing each one wrong',
        fix: 'Each agent is a specialist — TikTok hooks, IG carousels, X threads. Voice stays consistent because it\'s your Brand Kit.',
      },
      {
        emoji: '📩',
        pain: 'Inbox replies are how your community grows — but they take hours',
        fix: 'Inbox surfaces every mention with a brand-voice reply ready to approve. Mute spam clusters in one tap.',
      },
    ],
    spotlightAgents: [
      { id: 'tiktok', reason: 'Hook in 1.5s, on-screen text, audio direction. Built for the scroll.' },
      { id: 'meta', reason: 'Reels scripts, carousel storyboards, behind-the-scenes captions.' },
      { id: 'x', reason: 'Threads on what you actually think. Replies that earn community.' },
    ],
    killerFeatures: [
      {
        emoji: '🎨',
        title: 'Studio: idea → every format',
        body: 'A single prompt produces a thread, a carousel, a video script, an image brief, an email. Channel agents collaborate on the remix.',
      },
      {
        emoji: '🧠',
        title: 'Agents that learn your voice',
        body: 'Adaptive memory shows what each agent has actually learned from your approvals + edits. Pin what works, retire what doesn\'t.',
      },
      {
        emoji: '🔥',
        title: 'Trends scored for your audience',
        body: 'Velocity + audience-match scoring + your specific angle. One click drafts the post.',
      },
    ],
    testimonial: {
      quote:
        "I went from posting once a week and feeling guilty to publishing daily across three platforms in voice. The TikTok agent caught hooks I would never have written.",
      name: 'Nadia Park',
      role: 'Creator, @nadiawrites',
    },
    ctaTitle: 'You make the work. The agents make sure people see it.',
    ctaSub: 'Free for one channel each. Pro unlocks the full studio.',
  },
}
