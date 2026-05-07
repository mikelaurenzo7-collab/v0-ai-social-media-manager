import { PolicyShell } from '@/components/marketing/policy-shell'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How PostPilot collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <PolicyShell
      eyebrow="Legal"
      title="Privacy Policy"
      updated="May 7, 2026"
      description="We treat your data like we treat our own — minimal collection, encryption at rest, and your right to walk away with everything intact."
    >
      <h2>The short version</h2>
      <ul>
        <li>We collect only what we need to make the product work.</li>
        <li>OAuth tokens for connected accounts are encrypted with AES-256-GCM at rest, and never leave our infrastructure.</li>
        <li>We do not sell your data. Not to advertisers. Not to brokers. Not to anyone.</li>
        <li>You can export or delete everything, any time, in <strong>Settings → Account</strong>.</li>
        <li>We use your content only to operate PostPilot for you — never to train shared AI models.</li>
      </ul>

      <h2>What we collect</h2>
      <h3>You give us</h3>
      <ul>
        <li>Account info: name, email, profile photo, password (hashed with bcrypt).</li>
        <li>Workspace data: the posts, drafts, brand kits, schedules, and notes you create.</li>
        <li>Connection tokens: OAuth access and refresh tokens for any platform you connect.</li>
      </ul>
      <h3>We observe</h3>
      <ul>
        <li>Standard server logs (IP, timestamp, user agent) — retained 30 days.</li>
        <li>Aggregate, anonymized product analytics (page views, feature usage). Per-user analytics are opt-in.</li>
      </ul>
      <h3>We do not collect</h3>
      <ul>
        <li>Browsing history outside PostPilot.</li>
        <li>Cookies for advertising or cross-site tracking.</li>
        <li>Social graph data beyond what&apos;s required for the features you use.</li>
      </ul>

      <h2>How we use your data</h2>
      <p>To run PostPilot for you. Specifically: to draft, schedule, and publish your content; to power the AI agents you talk to; to render analytics; and to send you transactional email (receipts, security alerts, important account notices). That&apos;s it.</p>

      <h2>AI and your content</h2>
      <p>We use a mix of model providers (Anthropic Claude as our primary). Your content is sent over TLS to these providers only to fulfill your immediate request. We have signed data processing addenda (DPAs) with each provider explicitly forbidding training on your inputs.</p>

      <h2>Data retention &amp; deletion</h2>
      <ul>
        <li>Active workspaces: kept while your account is active.</li>
        <li>Deleted content: purged from production within 7 days, from backups within 30.</li>
        <li>Account deletion: one click in Settings. We acknowledge in 24h, fully purge within 30 days.</li>
      </ul>

      <h2>Sub-processors</h2>
      <p>We use a small set of vendors to operate the service: AWS (hosting), Vercel (delivery), Postgres (storage), Anthropic (AI), Stripe (billing), Resend (email). The full list with purposes is at <a href="/security#subprocessors">/security#subprocessors</a> and we notify customers of additions 30 days in advance.</p>

      <h2>Your rights</h2>
      <p>If you live in the EU, UK, California, or anywhere with similar rights, you can request access, correction, portability, deletion, or restriction of processing — at any time, free, no questions asked. Email <a href="mailto:privacy@postpilot.app">privacy@postpilot.app</a>. We respond within 7 business days.</p>

      <h2>Contact</h2>
      <p>Questions, concerns, complaints? We read every one. <a href="mailto:privacy@postpilot.app">privacy@postpilot.app</a> · or by post: PostPilot, Inc., Attn: Privacy, San Francisco, CA.</p>
    </PolicyShell>
  )
}
