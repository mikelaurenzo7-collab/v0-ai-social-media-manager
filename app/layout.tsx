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
  title: 'Lumina AI — The Most Successful, Professional & Flawless AI Social Media OS',
  description: 'Enterprise-grade AI social media orchestrator with hyper-personal specialist agents, real OAuth posting, A/B testing, team collaboration, and breathtaking Cosmic Orbit design. Built for creators, agencies, and teams who demand maximum results.',
  keywords: ['social media', 'AI agents', 'content creation', 'Instagram', 'X', 'LinkedIn', 'TikTok', 'YouTube', 'Facebook', 'automation', 'enterprise', 'A/B testing', 'team collaboration'],
  authors: [{ name: 'Lumina AI' }],
  openGraph: {
    title: 'Lumina AI — The Most Successful, Professional & Flawless AI Social Media OS',
    description: 'Hyper-personal AI agents, real OAuth posting, A/B testing, team features, and immersive Cosmic Orbit design. The category-defining social media OS for 2026.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina AI — The Most Successful, Professional & Flawless AI Social Media OS',
    description: 'Enterprise AI social media orchestrator with specialist agents, A/B testing, and breathtaking design.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#818cf8' },
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
