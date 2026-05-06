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
  title: 'PostPilot - Your AI Co-Pilot for Social Media',
  description: 'AI-powered social media management for influencers, businesses, and creators. Generate engaging content for X, Instagram, and Facebook in seconds.',
  keywords: ['social media', 'AI', 'content creation', 'Instagram', 'Twitter', 'Facebook', 'automation'],
  authors: [{ name: 'PostPilot' }],
  openGraph: {
    title: 'PostPilot - Your AI Co-Pilot for Social Media',
    description: 'Generate engaging social media content with AI. Perfect for influencers, businesses, and creators.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostPilot - Your AI Co-Pilot for Social Media',
    description: 'Generate engaging social media content with AI.',
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
