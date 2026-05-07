import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap — What we’re building next',
  description:
    'A living public roadmap for PostPilot. Now, next, and later — with honest progress, customer-requested items, and what we deliberately said no to.',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'PostPilot roadmap — What we’re building next',
    description: 'Now, next, and later. Honest progress and what we said no to.',
    url: '/roadmap',
    images: [
      {
        url: '/api/og?eyebrow=Roadmap&title=What+we%27re+building+next.&subtitle=Now+%C2%B7+Next+%C2%B7+Later',
        width: 1200,
        height: 630,
        alt: 'PostPilot roadmap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot roadmap — What we’re building next',
    description: 'Now, next, and later. Honest progress and what we said no to.',
  },
}

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children
}
