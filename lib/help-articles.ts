/**
 * Hand-authored starter help articles. Real article CMS lands later;
 * keeping content in code today means we can ship something useful and
 * keep the contract (slug → article shape) stable when we migrate.
 */

export interface HelpArticle {
  slug: string
  title: string
  blurb: string
  category: string
  read: string
  body: { heading?: string; paragraphs: string[] }[]
  related?: string[]
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'why-connect-each-platform-separately',
    title: 'Why do I need to connect my X account separately from my LinkedIn?',
    blurb:
      'Each platform issues its own OAuth credentials. We never read or store more than the channel needs.',
    category: 'Connections & OAuth',
    read: '2 min',
    body: [
      {
        paragraphs: [
          "Every social platform — X, Meta, LinkedIn, TikTok — runs its own OAuth server. There is no industry-wide single sign-on for posting permissions, and there's no shortcut. To publish on a channel, your workspace needs that channel's credentials.",
          "The upside: each connection is scoped to exactly the platform it covers. Revoking your LinkedIn connection doesn't affect X. A token leak on one platform stays contained on that platform. Compliance teams like that.",
        ],
      },
      {
        heading: "What we ask for and why",
        paragraphs: [
          "We request the minimum scopes each platform needs for the features you turn on. Posting requires write scope. Reading replies requires read scope. DMs are a separate scope and always opt-in.",
          "When you toggle a tool off in the agent's Permissions tab, we drop that scope's tools from the model's reach the next time it runs.",
        ],
      },
      {
        heading: "Tokens are encrypted at rest",
        paragraphs: [
          "OAuth access and refresh tokens are encrypted with AES-256-GCM using per-user keys derived through HKDF. They live in our Postgres instance with row-level security and audit triggers on every read.",
          "Tokens are auto-refreshed before they expire so your scheduled posts don't fail at 3 AM.",
        ],
      },
    ],
    related: [
      'how-do-i-train-an-agent-on-my-brand-voice',
      'is-my-oauth-token-stored-in-plain-text',
    ],
  },
  {
    slug: 'can-the-ai-agents-post-on-my-behalf-without-my-approval',
    title: 'Can the AI agents post on my behalf without my approval?',
    blurb:
      "Only if you tell them they can. Default is approval-required; you can flip it per agent.",
    category: 'AI agents',
    read: '3 min',
    body: [
      {
        paragraphs: [
          "Out of the box, every agent posts in approval-required mode. The agent drafts, you review, you approve. Nothing leaves your workspace until a human says yes.",
          "Each agent has its own setting under Permissions → Posting authority. You can pick from:",
        ],
      },
      {
        heading: 'Posting modes',
        paragraphs: [
          "**Approval required** (default) — the agent submits drafts to the Approvals queue. The approvers you list can sign off; the agent only publishes once approved.",
          "**Auto-publish** — the agent publishes on its own. Use this for accounts you trust the agent to run end-to-end. Crisis Mode and rate limits still apply.",
          "**Draft only** — the agent never publishes. It produces drafts; a human takes them from there.",
        ],
      },
      {
        heading: 'Hard stops',
        paragraphs: [
          "Crisis Mode (top-bar button) flips every agent to draft-only and freezes the scheduled queue with one tap. The pause is enforced server-side: the chat API strips publish_to_platform and send_email from the toolset for every request while crisis mode is on.",
          "Rate limits and quiet hours are also enforced on every request, even on Auto-Pilot. An agent will not exceed your daily/weekly cap and will not send during a quiet window.",
        ],
      },
    ],
    related: [
      'how-do-i-train-an-agent-on-my-brand-voice',
      'what-happens-when-a-scheduled-post-fails',
    ],
  },
  {
    slug: 'how-do-i-train-an-agent-on-my-brand-voice',
    title: 'How do I train an agent on my brand voice?',
    blurb:
      'Three places: Brand Kit (workspace voice), Agent Customize (per-agent persona), Agent Memory (adaptive learning).',
    category: 'AI agents',
    read: '4 min',
    body: [
      {
        paragraphs: [
          "Voice is set in three layers, applied in this order on every agent request: workspace Brand Kit → per-agent Customize → adaptive Memory. Each one narrows the agent further.",
        ],
      },
      {
        heading: '1) Brand Kit (workspace-wide)',
        paragraphs: [
          "Open Brand Kit and paste 3–5 examples of content you're proud of. Agents auto-detect a voice fingerprint across five dimensions (formality, energy, confidence, humor, technicality). Set hard rules in the do/don't section — those cannot be bypassed by individual agents.",
        ],
      },
      {
        heading: '2) Agent Customize (per-agent)',
        paragraphs: [
          "Open any agent → Customize tab. You can rewrite the system prompt entirely, change the display name, set a default sign-off, pick a response style (concise / balanced / detailed), and dictate emoji usage.",
          "Customize is layered on top of the Brand Kit, so per-agent overrides only need to capture what's different about that specific channel.",
        ],
      },
      {
        heading: '3) Agent Memory (adaptive)',
        paragraphs: [
          "The Memory tab on each agent shows what the agent has actually learned from your approvals, edits, and feedback. Pin the memories that matter, retire the noisy ones with one click, and add explicit rules in plain English.",
          "Every memory has a confidence score and an evidence line so you can audit why the agent thinks what it thinks.",
        ],
      },
    ],
    related: [
      'can-the-ai-agents-post-on-my-behalf-without-my-approval',
    ],
  },
  {
    slug: 'what-happens-when-a-scheduled-post-fails',
    title: 'What happens when a scheduled post fails?',
    blurb:
      'We retry, then notify, then surface the error in the Pipeline with a one-click reschedule.',
    category: 'Scheduling & Auto-Pilot',
    read: '2 min',
    body: [
      {
        paragraphs: [
          "Failures happen. The destination platform might be down, your OAuth token might have expired, the post might have hit a content policy, or rate limits might have kicked in.",
          "Our publishing worker handles these in three escalating steps:",
        ],
      },
      {
        heading: 'Retry',
        paragraphs: [
          "Transient errors (5xx, network timeouts) trigger an exponential-backoff retry within a 15-minute window. Most failures clear on the first or second retry without you noticing.",
        ],
      },
      {
        heading: 'Notify',
        paragraphs: [
          "If retries don't clear the failure, you get a notification in the bell dropdown and an email to the workspace owner. Slack delivery (Business plan) ships at the same time.",
        ],
      },
      {
        heading: 'Surface in Pipeline',
        paragraphs: [
          "The card stays in the Scheduled column with a red marker and the platform's error message. One click sends it back to Drafts for the agent to redraft, or you can fix-and-publish manually.",
          "No silent failures — ever. We log every attempt to the audit log so you can prove what happened to whoever needs the receipt.",
        ],
      },
    ],
  },
  {
    slug: 'is-my-oauth-token-stored-in-plain-text',
    title: 'Is my OAuth token stored in plain text? (No.)',
    blurb:
      'AES-256-GCM at rest with per-user keys, transit-encrypted everywhere else.',
    category: 'Security & Privacy',
    read: '5 min',
    body: [
      {
        paragraphs: [
          "Short answer: no. Long answer below.",
        ],
      },
      {
        heading: 'At rest',
        paragraphs: [
          "OAuth access and refresh tokens are encrypted with AES-256-GCM. Each row is encrypted with a per-user key derived via HKDF from a workspace master key, which itself is wrapped by a hardware-backed KMS key.",
          "Postgres-level row-level security caps blast radius — even if a query bypassed our application layer, it couldn't read another workspace's tokens.",
        ],
      },
      {
        heading: 'In transit',
        paragraphs: [
          "Everything is TLS 1.3. Our edge fronts terminate TLS, then re-encrypt to internal services. The token never crosses an unencrypted hop.",
        ],
      },
      {
        heading: 'Audit trail',
        paragraphs: [
          "Every read/write of an OAuth token writes an entry to the workspace audit log. Owners can stream that log to an external SIEM via webhook on the Business plan.",
        ],
      },
      {
        heading: 'Compliance posture',
        paragraphs: [
          "SOC 2 Type 1 audit complete. Type 2 audit window opens Q4. GDPR + CCPA compliant; DPA available on request. Full subprocessor list at /security#subprocessors.",
        ],
      },
    ],
    related: ['why-connect-each-platform-separately'],
  },
  {
    slug: 'how-do-i-delete-my-account-and-all-my-data',
    title: 'How do I delete my account and all my data?',
    blurb:
      'Settings → Danger Zone → Delete account. We acknowledge in 24h, fully purge within 30 days.',
    category: 'Security & Privacy',
    read: '1 min',
    body: [
      {
        paragraphs: [
          "Open Settings → scroll to the Danger Zone at the bottom. Click Delete account. Confirm by typing the workspace name.",
        ],
      },
      {
        heading: 'What gets deleted',
        paragraphs: [
          "Your profile, workspaces you own, all drafts, all published posts, all OAuth connections, all brand kits, all memories. Backups are purged within 30 days; production within 7.",
          "We do retain some financial records (invoices, payment events) for 7 years where required by law. Nothing in those records ties to your account once your profile is purged.",
        ],
      },
      {
        heading: 'Want a copy first?',
        paragraphs: [
          "Settings → Data → Export. We email you a JSON archive of everything in your workspace within 24 hours. Free.",
        ],
      },
    ],
  },
]

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug)
}

export function getRelatedArticles(slug: string): HelpArticle[] {
  const article = getHelpArticle(slug)
  if (!article?.related) return []
  return article.related
    .map((s) => getHelpArticle(s))
    .filter((a): a is HelpArticle => !!a)
}
