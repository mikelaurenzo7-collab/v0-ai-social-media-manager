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
    default: 'PostPilot — Your AI Co-Pilot for Social and Email',
    template: '%s · PostPilot',
  },
  description:
    'A team of specialist AI agents that draft, schedule, and publish content across X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook. Built for creators, founders, and busy teams.',
  keywords: [
    'AI social media',
    'social media manager',
    'AI agents',
    'content creation',
    'X', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook',
    'Gmail', 'Outlook', 'cold email',
    'PostPilot',
  ],
  authors: [{ name: 'PostPilot' }],
  openGraph: {
    title: 'PostPilot — Your AI Co-Pilot for Social and Email',
    description:
      'Specialist AI agents that write, schedule, and publish across social and email — with real OAuth, real platform smarts, and real results.',
    type: 'website',
    siteName: 'PostPilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot — Your AI Co-Pilot for Social and Email',
    description:
      'Specialist AI agents for X, Instagram, LinkedIn, TikTok, Facebook, Gmail and Outlook.',
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
