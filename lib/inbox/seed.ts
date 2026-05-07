import type { SocialPlatformId } from '@/lib/constants/platforms'

export type InboxKind = 'comment' | 'dm' | 'mention' | 'reply'
export type InboxStatus = 'unread' | 'read' | 'replied' | 'snoozed'
export type Sentiment = 'positive' | 'question' | 'negative' | 'lead' | 'neutral'

export interface InboxAuthor {
  name: string
  handle: string
  avatar: string  // single character
  verified?: boolean
  followers?: string
}

export interface InboxMessage {
  id: string
  from: 'them' | 'you'
  body: string
  ts: string  // ISO
}

export interface InboxThread {
  id: string
  platform: SocialPlatformId
  kind: InboxKind
  status: InboxStatus
  sentiment: Sentiment
  priority: 'high' | 'normal'
  author: InboxAuthor
  /** Original post or context this thread is attached to (for comments/mentions) */
  postContext?: string
  preview: string
  unreadCount: number
  ts: string  // ISO of latest message
  messages: InboxMessage[]
  /** Signals for the AI reply coach */
  signals?: string[]
}

const NOW = new Date('2026-05-07T14:30:00Z').getTime()
const m = (mins: number) => new Date(NOW - mins * 60_000).toISOString()
const h = (hrs: number) => new Date(NOW - hrs * 60 * 60_000).toISOString()
const d = (days: number) => new Date(NOW - days * 24 * 60 * 60_000).toISOString()

export const INBOX_THREADS: InboxThread[] = [
  // ── 1. Hot inbound lead — DM on LinkedIn ───────────────────────────────────
  {
    id: 't-001',
    platform: 'linkedin',
    kind: 'dm',
    status: 'unread',
    sentiment: 'lead',
    priority: 'high',
    author: {
      name: 'Priya Shah',
      handle: 'priya-shah',
      avatar: 'P',
      verified: true,
      followers: '14.2k',
    },
    preview:
      "Hey! Loved your thread on the creator plateau. We're a Series A SaaS looking for a fractional content lead — would love to chat.",
    unreadCount: 2,
    ts: m(8),
    signals: ['Inbound lead', 'Decision-maker', 'Mentioned recent thread'],
    messages: [
      {
        id: 'm-001-1',
        from: 'them',
        body:
          "Hey! Loved your thread on the creator plateau — sent it to our whole team. Genuinely the most useful piece I've read this quarter.",
        ts: m(11),
      },
      {
        id: 'm-001-2',
        from: 'them',
        body:
          "Quick context: I'm Head of Marketing at Lumen (Series A SaaS, ~40 people). We're looking for a fractional content lead 1 day/week to help us think strategically. Open to a chat?",
        ts: m(8),
      },
    ],
  },

  // ── 2. Negative reply on X — needs careful response ────────────────────────
  {
    id: 't-002',
    platform: 'twitter',
    kind: 'reply',
    status: 'unread',
    sentiment: 'negative',
    priority: 'high',
    author: {
      name: 'Mark Reed',
      handle: 'markreedwrites',
      avatar: 'M',
      followers: '8.3k',
    },
    postContext: '"Consistency is overrated. What matters more is..." — your thread, 3h ago',
    preview:
      "Hard disagree. Without consistency, none of these other levers move the needle. This take feels like rage-bait.",
    unreadCount: 1,
    ts: m(22),
    signals: ['Critical tone', 'Public reply', 'Engaged audience watching'],
    messages: [
      {
        id: 'm-002-1',
        from: 'them',
        body:
          "Hard disagree. Without consistency, none of these other levers move the needle. This take feels like rage-bait honestly.",
        ts: m(22),
      },
    ],
  },

  // ── 3. Positive comment on Instagram ──────────────────────────────────────
  {
    id: 't-003',
    platform: 'instagram',
    kind: 'comment',
    status: 'unread',
    sentiment: 'positive',
    priority: 'normal',
    author: {
      name: 'Jess Tanaka',
      handle: 'jess.builds',
      avatar: 'J',
      followers: '32.1k',
    },
    postContext: 'Carousel: "5 hooks that took my LinkedIn from 200 → 12k" — posted 1d ago',
    preview:
      "Saved this to my swipe file. Slide 3 alone is worth the follow — zero one ever talks about this.",
    unreadCount: 1,
    ts: m(45),
    signals: ['High follower count', 'Saved the post', 'Specific praise'],
    messages: [
      {
        id: 'm-003-1',
        from: 'them',
        body:
          "Saved this to my swipe file. Slide 3 alone is worth the follow — no one ever talks about this 🙌",
        ts: m(45),
      },
    ],
  },

  // ── 4. TikTok comment — question ──────────────────────────────────────────
  {
    id: 't-004',
    platform: 'tiktok',
    kind: 'comment',
    status: 'unread',
    sentiment: 'question',
    priority: 'normal',
    author: {
      name: 'devondoescontent',
      handle: 'devondoescontent',
      avatar: 'D',
      followers: '4.1k',
    },
    postContext: 'Video: "Stop optimizing for reach. Do this instead:" — 12h ago',
    preview:
      "wait can you make a follow up about HOW to track this? I keep getting lost in my own metrics 😭",
    unreadCount: 1,
    ts: h(1),
    signals: ['Content-idea opportunity', 'High-intent question'],
    messages: [
      {
        id: 'm-004-1',
        from: 'them',
        body:
          "wait can you make a follow up about HOW to track this? I keep getting lost in my own metrics 😭",
        ts: h(1),
      },
    ],
  },

  // ── 5. LinkedIn mention — community recognition ───────────────────────────
  {
    id: 't-005',
    platform: 'linkedin',
    kind: 'mention',
    status: 'read',
    sentiment: 'positive',
    priority: 'normal',
    author: {
      name: 'Aaron Kim',
      handle: 'aaronkim',
      avatar: 'A',
      verified: true,
      followers: '47.8k',
    },
    postContext: 'Aaron tagged you in a public post about top creators to follow in 2026',
    preview:
      "I've been following @you for 6 months and the content quality is wild. This is one of the few accounts I actually look forward to.",
    unreadCount: 0,
    ts: h(2),
    signals: ['High-influence author', 'Public endorsement', 'Reshare opportunity'],
    messages: [
      {
        id: 'm-005-1',
        from: 'them',
        body:
          "I've been following @you for 6 months and the content quality is wild. Most creators talk about \"strategy\" without showing the receipts — they actually show the work. One of the few accounts I look forward to.",
        ts: h(2),
      },
    ],
  },

  // ── 6. Instagram DM — collab pitch ────────────────────────────────────────
  {
    id: 't-006',
    platform: 'instagram',
    kind: 'dm',
    status: 'unread',
    sentiment: 'lead',
    priority: 'high',
    author: {
      name: 'Riley Carmen',
      handle: 'rileymakes',
      avatar: 'R',
      verified: true,
      followers: '128k',
    },
    preview:
      "Hey! I run a creator newsletter (~50k subs) and would love to feature your carousel framework. Compensated of course.",
    unreadCount: 1,
    ts: h(3),
    signals: ['Paid collab', 'Established creator', 'Audience overlap'],
    messages: [
      {
        id: 'm-006-1',
        from: 'them',
        body: "Hey! Big fan of your carousels. Got a sec?",
        ts: h(4),
      },
      {
        id: 'm-006-2',
        from: 'them',
        body:
          "I run a creator newsletter (~50k subs, 38% open rate) and we'd love to feature your carousel framework as our deep dive next month. Compensated of course — usually $1.5–2k for original content. Open to it?",
        ts: h(3),
      },
    ],
  },

  // ── 7. Twitter mention — friendly mention from peer ───────────────────────
  {
    id: 't-007',
    platform: 'twitter',
    kind: 'mention',
    status: 'read',
    sentiment: 'positive',
    priority: 'normal',
    author: {
      name: 'Sam Liu',
      handle: 'samliubuilds',
      avatar: 'S',
      followers: '21.4k',
    },
    postContext: 'Sam tagged you in a thread about content frameworks',
    preview:
      "Steal this — @you's hook framework is the single biggest unlock I've found this year. 1/",
    unreadCount: 0,
    ts: h(4),
    signals: ['Peer endorsement', 'Top-of-thread mention'],
    messages: [
      {
        id: 'm-007-1',
        from: 'them',
        body:
          "Steal this — @you's hook framework is the single biggest unlock I've found this year. Going to break it down 👇 1/",
        ts: h(4),
      },
    ],
  },

  // ── 8. Facebook comment — confused user ───────────────────────────────────
  {
    id: 't-008',
    platform: 'facebook',
    kind: 'comment',
    status: 'unread',
    sentiment: 'question',
    priority: 'normal',
    author: {
      name: 'Linda Bauer',
      handle: 'linda.b',
      avatar: 'L',
    },
    postContext: 'Post: "The 3-sentence hook formula that tripled my engagement"',
    preview:
      "Could you explain step 2 again? I tried it on my last post and got crickets. What am I missing?",
    unreadCount: 1,
    ts: h(5),
    signals: ['Earnest question', 'Newer audience member'],
    messages: [
      {
        id: 'm-008-1',
        from: 'them',
        body:
          "Could you explain step 2 again? I tried it on my last post and got crickets. What am I missing? 😅",
        ts: h(5),
      },
    ],
  },

  // ── 9. TikTok DM — already replied (closed-loop example) ──────────────────
  {
    id: 't-009',
    platform: 'tiktok',
    kind: 'dm',
    status: 'replied',
    sentiment: 'positive',
    priority: 'normal',
    author: {
      name: 'mayaedits',
      handle: 'mayaedits',
      avatar: 'M',
      followers: '6.7k',
    },
    preview: "thank you so so much, i'm going to apply this tonight 🙏",
    unreadCount: 0,
    ts: h(8),
    signals: ['Conversation closed positively'],
    messages: [
      {
        id: 'm-009-1',
        from: 'them',
        body:
          "hey! love the breakdown on hooks. quick q — what should I do if my hook is good but ppl still drop off at 3 secs?",
        ts: h(10),
      },
      {
        id: 'm-009-2',
        from: 'you',
        body:
          "Great q. If the hook is landing but they drop, your second beat probably feels generic. Try adding a specific number or unexpected detail in seconds 3–5. Promise → unexpected detail → reason to stay.",
        ts: h(9),
      },
      {
        id: 'm-009-3',
        from: 'them',
        body: "thank you so so much, i'm going to apply this tonight 🙏",
        ts: h(8),
      },
    ],
  },

  // ── 10. LinkedIn comment — neutral question ───────────────────────────────
  {
    id: 't-010',
    platform: 'linkedin',
    kind: 'comment',
    status: 'read',
    sentiment: 'question',
    priority: 'normal',
    author: {
      name: 'Daniel Okafor',
      handle: 'danielokafor',
      avatar: 'D',
      followers: '11.5k',
    },
    postContext: 'Post: "Building in public is the most underrated growth strategy in 2026"',
    preview: "What does 'building in public' look like for a B2B founder selling to enterprise? Curious if same playbook applies.",
    unreadCount: 0,
    ts: h(12),
    signals: ['B2B audience', 'Thoughtful question', 'Engagement-driver if answered well'],
    messages: [
      {
        id: 'm-010-1',
        from: 'them',
        body:
          "What does \"building in public\" look like for a B2B founder selling to enterprise? Curious if the same playbook applies or if it actually hurts you in long sales cycles.",
        ts: h(12),
      },
    ],
  },

  // ── 11. Instagram comment — spam-ish ──────────────────────────────────────
  {
    id: 't-011',
    platform: 'instagram',
    kind: 'comment',
    status: 'unread',
    sentiment: 'neutral',
    priority: 'normal',
    author: {
      name: 'growthhack.tools',
      handle: 'growthhack.tools',
      avatar: 'G',
    },
    postContext: 'Reel: "Behind the scenes of my content creation workflow"',
    preview: "🔥🔥🔥 link in bio for free growth tools",
    unreadCount: 1,
    ts: h(18),
    signals: ['Likely spam', 'Low engagement value'],
    messages: [
      {
        id: 'm-011-1',
        from: 'them',
        body: "🔥🔥🔥 link in bio for free growth tools",
        ts: h(18),
      },
    ],
  },

  // ── 12. Twitter DM — speaking opportunity ─────────────────────────────────
  {
    id: 't-012',
    platform: 'twitter',
    kind: 'dm',
    status: 'snoozed',
    sentiment: 'lead',
    priority: 'high',
    author: {
      name: 'Conf Organizer',
      handle: 'creatorsummit',
      avatar: 'C',
      verified: true,
      followers: '67.2k',
    },
    preview:
      "Would you be interested in giving a 25-min talk at Creator Summit 2026 (LA, Sept)? Compensated speaker role.",
    unreadCount: 0,
    ts: d(1),
    signals: ['Speaking opportunity', 'Brand exposure', 'Compensated'],
    messages: [
      {
        id: 'm-012-1',
        from: 'them',
        body:
          "Hey! Reaching out from Creator Summit 2026 (LA, Sept 18–20). Loved your work this year — would you be interested in giving a 25-min talk on the main stage? Compensated speaker role + travel covered.",
        ts: d(1),
      },
    ],
  },
]

// ── AI Reply Coach: pre-canned smart replies tied to each thread ────────────

export interface AISuggestion {
  tone: 'warm' | 'direct' | 'witty'
  text: string
}

export const AI_SUGGESTIONS: Record<string, AISuggestion[]> = {
  't-001': [
    {
      tone: 'warm',
      text:
        "Priya, thank you — really glad it landed. I'd love to learn more about Lumen. Want to grab 25 min next week? I have Tues 10am or Wed 2pm PT free. Or if it's easier, drop the goals and current content motion in here and I'll come prepped.",
    },
    {
      tone: 'direct',
      text:
        "Happy to chat. To save us a meeting if it's not a fit: what's your current weekly content cadence, what platforms matter most, and what does success look like in 90 days? If those line up I'll send a calendar link.",
    },
    {
      tone: 'witty',
      text:
        "Priya — \"sent it to our whole team\" is the highest praise you can give a writer, so thank you. Yes to a chat. Tuesday 10am PT? You bring the context, I'll bring opinions.",
    },
  ],
  't-002': [
    {
      tone: 'warm',
      text:
        "Fair pushback. I should've been clearer: I think frequency without intention is the trap, not consistency itself. The thread argues for quality over volume, but you're right that disappearing for 3 weeks doesn't help anyone either. Appreciate the read.",
    },
    {
      tone: 'direct',
      text:
        "I think we mostly agree but are using \"consistency\" differently. I mean it as \"showing up at any frequency.\" You mean it as a non-negotiable. Both are true — it's the floor, not the strategy.",
    },
    {
      tone: 'witty',
      text:
        "Fair. \"Consistency is overrated\" is a hook, not a thesis — the actual point is buried in tweet 4. Take it as a steelman of \"don't post junk to maintain a streak.\" 😅",
    },
  ],
  't-003': [
    {
      tone: 'warm',
      text:
        "Jess this means a lot 🙏 Slide 3 was the one I almost cut — glad it stayed. If you end up using the framework on your own carousels I'd genuinely love to see what you make.",
    },
    {
      tone: 'direct',
      text:
        "Thanks Jess. Slide 3 is the one most people miss. If you remix the framework, tag me — I want to see it.",
    },
    {
      tone: 'witty',
      text:
        "Jess swipe-filing it is the highest honor. Now I have to make the next one even better, no pressure 😤",
    },
  ],
  't-004': [
    {
      tone: 'warm',
      text:
        "Yes — actually was already on the list, but you just bumped it to next 🙌 Quick teaser: there are 3 metrics that actually matter and the rest are noise. I'll DM you when it's up.",
    },
    {
      tone: 'direct',
      text:
        "Filming it Friday. Short version: track these 3 — completion %, saves, and reply velocity in hour 1. Ignore the rest until those are good.",
    },
    {
      tone: 'witty',
      text:
        "ok ok new video locked in for Friday. \"How to track this without losing your mind\" — coming right up 📊",
    },
  ],
  't-005': [
    {
      tone: 'warm',
      text:
        "Aaron, this is so kind — genuinely made my day. Receipts > strategy is exactly what I'm trying to do. Thank you for the trust 🙏",
    },
    {
      tone: 'direct',
      text:
        "Aaron — thank you. Means more coming from you. The plan is to keep showing the work whether it succeeds or flops. Reposting this to my story.",
    },
    {
      tone: 'witty',
      text:
        "Aaron writing this about me is going on the fridge. Forever indebted 🙏",
    },
  ],
  't-006': [
    {
      tone: 'warm',
      text:
        "Riley, huge fan of what you're building — yes, I'd love to. The carousel framework is a 6-slide deep dive: I can write it custom for your audience or adapt the existing one. Want to hop on a 15 min call to scope?",
    },
    {
      tone: 'direct',
      text:
        "Yes. $1.8k for an original 6-slide adaptation written for your audience, 1 round of revisions, you keep IP for newsletter use only. If that works I'll send a quick scoping doc and we can lock dates.",
    },
    {
      tone: 'witty',
      text:
        "Riley's newsletter is one of my actual favorites so this might be the easiest \"yes\" of the year. $1.8k for an original carousel custom-written for your subs — let's do it.",
    },
  ],
  't-007': [
    {
      tone: 'warm',
      text:
        "Sam this is so generous, thank you. Watching to see your breakdown — your spin on these is always sharper than mine 🙌",
    },
    {
      tone: 'direct',
      text:
        "Sam thank you. Quote-tweeting it now. Curious which part of the framework hit hardest for you.",
    },
    {
      tone: 'witty',
      text:
        "Sam quote-tweeting me is illegal, I'll be calling the police. Thank you 🙏",
    },
  ],
  't-008': [
    {
      tone: 'warm',
      text:
        "No problem Linda — step 2 is the one most people get wrong. The trick is making it specific to one person, not \"audiences.\" Reply with your last post and I'll show you exactly where it's going generic.",
    },
    {
      tone: 'direct',
      text:
        "Step 2 = write to one person, not your audience. \"You\" beats \"all of you\" every time. Send me your post and I'll point at the line that needs to change.",
    },
    {
      tone: 'witty',
      text:
        "Linda the cricket sound is real and I've heard it many times 🦗 Step 2 is just \"write to one human.\" Drop your post here, I'll give you the line that needs to change.",
    },
  ],
  't-010': [
    {
      tone: 'warm',
      text:
        "Great question Daniel. For B2B/enterprise it actually does work — but the format shifts. Less \"here's our MRR,\" more \"here's the problem we're working on right now and how we're thinking about it.\" Buyers want competence and judgment, not vibes. Happy to expand if useful.",
    },
    {
      tone: 'direct',
      text:
        "Same playbook, different content. For enterprise: skip metrics, share the problem you're chewing on this quarter and your reasoning. Demonstrates judgment, not desperation.",
    },
    {
      tone: 'witty',
      text:
        "Yes but stop posting your MRR — your buyers don't care and your competitors will frame it. Post the questions you're wrestling with instead. That's the version of building in public that closes deals.",
    },
  ],
  't-011': [
    {
      tone: 'direct',
      text: "Hide & report — looks like spam.",
    },
  ],
  't-012': [
    {
      tone: 'warm',
      text:
        "Thanks for thinking of me — really flattered. Sept 18–20 in LA could work depending on the topic and audience. What's the talk angle you had in mind, and what's the speaker fee + travel structure?",
    },
    {
      tone: 'direct',
      text:
        "Interested. Need three things to confirm: (1) topic angle, (2) speaker fee, (3) travel coverage details. If those line up, I'm in.",
    },
  ],
}
