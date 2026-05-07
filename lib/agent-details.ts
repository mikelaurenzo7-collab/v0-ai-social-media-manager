export interface AgentDetail {
  id: string
  hue: string
  oneLine: string
  knows: string[]
  produces: string[]
  excerpt: { hook: string; body: string }
}

export const AGENT_DETAILS: Record<string, AgentDetail> = {
  x: {
    id: 'x',
    hue: 'from-zinc-700 to-zinc-900',
    oneLine: 'Owns hooks, threads, and reply velocity on X.',
    knows: [
      '280-char limits, thread mechanics, quote-tweet etiquette',
      'The first 10 words decide everything',
      'Reply velocity in the first hour beats post-time optimization',
    ],
    produces: [
      'Single tweets with stop-the-scroll hooks',
      'Threads (3–20 tweets) — opens strong, closes with a CTA',
      'Quote tweets, polls, reply chains',
    ],
    excerpt: {
      hook: '5 lessons from launch week. A thread.',
      body: '1/ Ship before you’re ready. We weren’t. It still worked. 2/ The first hour matters more than the first day. 3/ Pin the demo, not the announcement.',
    },
  },
  meta: {
    id: 'meta',
    hue: 'from-pink-500 to-rose-500',
    oneLine: 'Owns Instagram and Facebook — captions, carousels, Reels.',
    knows: [
      'IG: first 125 chars are the post; carousels keep them swiping',
      'FB: emotional storytelling drives shares; native video > links',
      'Save rate predicts Explore-page reach',
    ],
    produces: [
      'Captions with hook → value → CTA',
      'Carousel storyboards (5–10 slides) with save bait',
      'Reels scripts: hook in 1.5s, on-screen text overlays',
    ],
    excerpt: {
      hook: 'Inside the studio at 7am.',
      body: 'Workbench, no stylists. The version we almost shipped, and the one we sent. Save this if you’ve ever wondered what crafted actually looks like.',
    },
  },
  linkedin: {
    id: 'linkedin',
    hue: 'from-sky-500 to-blue-700',
    oneLine: 'Owns LinkedIn — long-form, thought leadership, document carousels.',
    knows: [
      'First 3 lines decide whether anyone clicks "see more"',
      'Personal stories outperform feature posts 7×',
      'Links in the body kill reach — first comment instead',
    ],
    produces: [
      'Long-form posts with line breaks every 1–2 sentences',
      'Document carousels (7–10 slides)',
      'Polls and newsletter drafts',
    ],
    excerpt: {
      hook: 'We hit 10k customers.',
      body: 'I cry-laughed in the car after the call with #6,142. Building means caring about every single one. If you’re early, that’s the bar.',
    },
  },
  tiktok: {
    id: 'tiktok',
    hue: 'from-fuchsia-500 to-rose-600',
    oneLine: 'Owns TikTok — hooks, scripts, on-screen text, audio direction.',
    knows: [
      '1.5-second hook or you lose the viewer forever',
      'On-screen text drives watch-time more than VO',
      'Trending audio amplifies the FYP algorithm',
    ],
    produces: [
      'Shot-by-shot storyboards: hook → payoff → CTA',
      'On-screen text overlays + voiceover scripts',
      'Series planning (Part 1 → 2 → 3)',
    ],
    excerpt: {
      hook: 'I broke every productivity rule for 30 days.',
      body: 'Rule #4 made me 3× more focused. Don’t skip — wait for the green sticky note.',
    },
  },
  gmail: {
    id: 'gmail',
    hue: 'from-red-500 to-orange-500',
    oneLine: 'Owns Gmail — cold outreach, follow-ups, reply drafts that get answered.',
    knows: [
      'Subjects under 50 chars open at 2× the rate',
      'Personalization beyond {first_name} drives 2–3× reply rate',
      'Reply chains improve deliverability — keep threads going',
    ],
    produces: [
      'Cold intros that read human, not automated',
      'Smart follow-ups when threads go quiet',
      'Reply drafts that match prior thread tone',
    ],
    excerpt: {
      hook: 'subject: small idea, big fan',
      body: 'short version — love what you’re building. one specific way we could collab in 15 min, happy to send the deck if it’s a fit.',
    },
  },
  outlook: {
    id: 'outlook',
    hue: 'from-blue-600 to-indigo-700',
    oneLine: 'Owns Outlook — executive comms, board updates, internal memos.',
    knows: [
      'Subject prefixes ([Action], [Decision], [Update]) help triage',
      'M365 spam filters favor authenticated domains',
      'Calendar links inside emails dramatically lift meeting conversion',
    ],
    produces: [
      'Executive summaries with headline + drivers + ask',
      'Board updates and internal memos',
      'Meeting invites with agenda baked into the body',
    ],
    excerpt: {
      hook: 'Subject: [Update] Q3 revenue + commentary',
      body: 'Headline: $4.2M (+38% YoY). Three drivers below, two risks I’m watching, one ask.',
    },
  },
}

export function getAgentDetail(id: string): AgentDetail | undefined {
  return AGENT_DETAILS[id]
}
