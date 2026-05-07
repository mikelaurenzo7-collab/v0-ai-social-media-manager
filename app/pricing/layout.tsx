import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free forever, fair as you grow',
  description:
    'Six specialist AI agents on every plan. Free for solo creators, Pro for growing teams, Business for agencies, Enterprise for everyone else. No seat tax surprises.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'PostPilot pricing — Free forever, fair as you grow',
    description:
      'All six AI channel agents on every tier. Posting volume scales with the plan. Cancel anytime.',
    url: '/pricing',
    images: [
      {
        url: '/api/og?eyebrow=Pricing&title=Free+forever%2C+fair+as+you+grow.&subtitle=All+six+agents+on+every+plan',
        width: 1200,
        height: 630,
        alt: 'PostPilot pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot pricing — Free forever, fair as you grow',
    description: 'All six AI channel agents on every plan. Cancel anytime.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
