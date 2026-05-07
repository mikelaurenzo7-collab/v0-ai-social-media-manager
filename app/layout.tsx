import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: 'PostPilot — Your AI Co-Pilot for Social Media',
  description: 'Generate platform-perfect posts, threads, and captions for X, Instagram, LinkedIn, TikTok, and Facebook in seconds. Specialist AI agents, multi-variation drafts, and a calendar built for creators and teams.',
  keywords: ['social media', 'AI content', 'post generator', 'X', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'thread writer', 'content calendar', 'creator tools'],
  authors: [{ name: 'PostPilot' }],
  openGraph: {
    title: 'PostPilot — Your AI Co-Pilot for Social Media',
    description: 'Specialist AI agents, multi-platform generation, and a content calendar that gets you posting consistently across every channel.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot — Your AI Co-Pilot for Social Media',
    description: 'Specialist AI agents, multi-platform generation, and a calendar that gets you posting consistently across every channel.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EA580C' },
    { media: '(prefers-color-scheme: dark)', color: '#EA580C' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
