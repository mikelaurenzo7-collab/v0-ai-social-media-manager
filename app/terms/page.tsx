import { PolicyShell } from '@/components/marketing/policy-shell'

export const metadata = {
  title: 'Terms of Service',
  description: 'The rules of the road for using PostPilot.',
}

export default function TermsPage() {
  return (
    <PolicyShell
      eyebrow="Legal"
      title="Terms of Service"
      updated="May 7, 2026"
      description="The agreement between you and PostPilot, written in plain English. If you find anything unclear, that&rsquo;s our bug — please tell us."
    >
      <h2>1. The agreement</h2>
      <p>By using PostPilot you agree to these terms. If you&apos;re using PostPilot for an organization, you confirm you have authority to bind that organization.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 16 or older to create an account.</li>
        <li>You&apos;re responsible for activity on your account. Don&apos;t share credentials.</li>
        <li>Notify us at <a href="mailto:security@postpilot.app">security@postpilot.app</a> immediately on suspected compromise.</li>
      </ul>

      <h2>3. What you can&apos;t do</h2>
      <p>Don&apos;t use PostPilot to:</p>
      <ul>
        <li>Send spam, scams, harassment, or content that violates the rules of the destination platform (X, Meta, LinkedIn, etc.).</li>
        <li>Impersonate another person or entity.</li>
        <li>Reverse engineer, scrape, or interfere with the service.</li>
        <li>Resell the service without a written reseller agreement.</li>
        <li>Train competing AI models on outputs from our system.</li>
      </ul>
      <p>We&apos;ll suspend accounts that do. We&apos;ll try to give notice first when we can.</p>

      <h2>4. Your content</h2>
      <p>You own everything you create in PostPilot. We get a narrow license to host, process, and transmit it strictly to operate the service for you. We don&apos;t use your content to train shared models.</p>

      <h2>5. AI output</h2>
      <p>AI-generated drafts are tools — they may be wrong, biased, or sound like someone else. You&apos;re responsible for reviewing before publishing. We don&apos;t guarantee accuracy or fitness for any specific purpose.</p>

      <h2>6. Connected platforms</h2>
      <p>When you connect X, Meta, LinkedIn, TikTok, Gmail, Outlook, or any third-party platform, you also agree to that platform&apos;s terms. Their rate limits, content policies, and uptime apply. We do our best to surface their errors clearly.</p>

      <h2>7. Billing</h2>
      <ul>
        <li>Plans renew monthly or annually until cancelled.</li>
        <li>Cancel any time — your plan stays active until the end of the current period.</li>
        <li>Refunds within 30 days of first payment, no questions, just email <a href="mailto:billing@postpilot.app">billing@postpilot.app</a>.</li>
      </ul>

      <h2>8. Uptime and limits</h2>
      <p>Business and Enterprise plans include a 99.9% monthly uptime SLA with credits when we miss it. Free plan is best-effort. Live status: <a href="/status">/status</a>.</p>

      <h2>9. Liability</h2>
      <p>We&apos;ll be straightforward: our total liability to you for any claim is capped at the greater of $100 or what you paid us in the 12 months before the claim. We&apos;re not liable for indirect, consequential, or lost-profits damages.</p>

      <h2>10. Changes to these terms</h2>
      <p>We&apos;ll email you 30 days before any material change. If you don&apos;t agree, you can cancel and we&apos;ll refund the unused portion.</p>

      <h2>11. Contact</h2>
      <p>Questions? <a href="mailto:legal@postpilot.app">legal@postpilot.app</a></p>
    </PolicyShell>
  )
}
