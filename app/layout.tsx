import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://postpilot.app'),
  title: {
    default: 'PostPilot — One AI agent per channel. Made yours.',
    template: '%s · PostPilot',
  },
  description:
    'Six specialist AI agents — one for X, Meta, LinkedIn, TikTok, Gmail, and Outlook. They draft, design, schedule, and publish through real OAuth. They learn your voice, your audience, and what actually works. You stay in control of every word.',
  keywords: [
    'AI social media',
    'social media manager',
    'AI agents',
    'content creation',
    'creative AI',
    'image generation',
    'video script',
    'brand voice AI',
    'X', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook',
    'Gmail', 'Outlook', 'cold email',
    'PostPilot',
  ],
  authors: [{ name: 'PostPilot' }],
  applicationName: 'PostPilot',
  category: 'productivity',
  openGraph: {
    title: 'PostPilot — One AI agent per channel. Made yours.',
    description:
      'Specialist AI agents that write, design, and publish across social and email. Real OAuth, real platform smarts, real brand voice.',
    type: 'website',
    siteName: 'PostPilot',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot — One AI agent per channel. Made yours.',
    description:
      'Specialist AI agents for X, Instagram, LinkedIn, TikTok, Facebook, Gmail, and Outlook. They learn your voice. You ship.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF8F2' },
    { media: '(prefers-color-scheme: dark)',  color: '#1A120E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" richColors closeButton theme="light" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
