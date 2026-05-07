import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Examples — Real posts shipped by real teams',
  description:
    'A gallery of nine real PostPilot drafts that were approved and shipped — across X, LinkedIn, Instagram, TikTok, and Gmail. Every post shows hook, body, metric, and approver.',
  alternates: { canonical: '/examples' },
  openGraph: {
    title: 'PostPilot examples — Real posts shipped by real teams',
    description:
      'Nine drafts that shipped. Hook, body, performance, and the human who approved it.',
    url: '/examples',
    images: [
      {
        url: '/api/og?eyebrow=Examples&title=Real+posts.+Real+teams.+Real+results.&subtitle=Nine+drafts+that+actually+shipped',
        width: 1200,
        height: 630,
        alt: 'PostPilot examples',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot examples — Real posts shipped by real teams',
    description: 'Nine drafts that shipped. Hook, body, performance, and the human who approved it.',
  },
}

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
  return children
}
