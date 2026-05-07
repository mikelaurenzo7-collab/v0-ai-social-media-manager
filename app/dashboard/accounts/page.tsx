'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@yourhandle',
    description: 'Reach your followers with threads, hot takes, and real-time conversations.',
    color: '#000000',
    bg: '#111827',
    features: ['Thread publishing', 'Tweet scheduling', 'Analytics sync'],
    status: 'coming_soon',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@yourhandle',
    description: 'Share posts, carousels, and Reels to grow your visual brand.',
    color: '#E4405F',
    bg: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    features: ['Caption scheduling', 'Hashtag injection', 'Story publishing'],
    status: 'coming_soon',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Your Name',
    description: 'Build professional authority with thought leadership and B2B content.',
    color: '#0A66C2',
    bg: '#0A66C2',
    features: ['Post scheduling', 'Article publishing', 'Newsletter sync'],
    status: 'coming_soon',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Your Page',
    description: 'Reach your community with stories, videos, and group content.',
    color: '#1877F2',
    bg: '#1877F2',
    features: ['Page publishing', 'Group posting', 'Event creation'],
    status: 'coming_soon',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@yourhandle',
    description: 'Dominate the For You Page with short-form video scripts and strategy.',
    color: '#000000',
    bg: '#111827',
    features: ['Video script export', 'Caption optimization', 'Trend analysis'],
    status: 'coming_soon',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
      </svg>
    ),
  },
]

const ROADMAP = [
  { q: 'Q2 2025', milestone: 'X (Twitter) direct publishing', done: false },
  { q: 'Q2 2025', milestone: 'LinkedIn post scheduling', done: false },
  { q: 'Q3 2025', milestone: 'Instagram feed + carousel publishing', done: false },
  { q: 'Q3 2025', milestone: 'Facebook page integration', done: false },
  { q: 'Q4 2025', milestone: 'TikTok script-to-video export', done: false },
  { q: 'Q4 2025', milestone: 'Cross-platform analytics dashboard', done: false },
]

export default function AccountsPage() {
  const [notifyPlatform, setNotifyPlatform] = useState<string | null>(null)

  return (
    <div className="flex flex-col">
      <Header
        title="Connected Accounts"
        description="Connect your social platforms for one-click publishing and analytics."
      />

      <div className="p-6 space-y-7">

        {/* Coming soon banner */}
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{ background: 'oklch(0.135 0.018 48)' }}
        >
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.2), transparent 55%)' }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-base">Direct publishing is coming</h3>
              <p className="mt-0.5 text-sm text-white/60 max-w-lg">
                We&apos;re integrating with social media APIs so you can post directly from PostPilot.
                Until then, use <span className="text-white/80 font-medium">Copy to clipboard</span> to paste into your apps in seconds.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs font-medium text-orange-400">In Development</span>
            </div>
          </div>
        </div>

        {/* Platform connection grid */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-foreground">Supported Platforms</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORMS.map((platform) => (
              <Card
                key={platform.id}
                className="group relative overflow-hidden border-border/60 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ background: platform.bg }}
                    >
                      {platform.icon}
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Coming Soon
                    </span>
                  </div>
                  <div className="mt-3">
                    <CardTitle className="text-sm font-bold">{platform.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{platform.description}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-1.5">
                    {platform.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-1 w-1 rounded-full shrink-0" style={{ background: '#EA580C' }} />
                        {feat}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs" disabled>
                      Connect Account
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'shrink-0 text-xs transition-colors',
                        notifyPlatform === platform.id
                          ? 'text-green-600 hover:text-green-600'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setNotifyPlatform(platform.id)}
                    >
                      {notifyPlatform === platform.id ? '✓ Notified' : 'Notify me'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* In the meantime workflow */}
        <Card className="border-border/60 overflow-hidden">
          <CardHeader style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <CardTitle className="text-sm">Your workflow right now</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Generate with AI',
                  desc: 'Use the Create page to generate 3 variations of your post in seconds.',
                  icon: '✦',
                },
                {
                  step: '2',
                  title: 'Copy to clipboard',
                  desc: 'Hit "Copy" on the variation you love — with hashtags included.',
                  icon: '📋',
                },
                {
                  step: '3',
                  title: 'Paste & post',
                  desc: 'Open your social app and paste. Done in under 60 seconds.',
                  icon: '🚀',
                },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                    >
                      {item.step}
                    </span>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration roadmap */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-foreground">Integration Roadmap</h2>
          <div className="space-y-2">
            {ROADMAP.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border/60 px-4 py-3 bg-card"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{item.q}</span>
                <span className="flex-1 text-sm text-foreground/80">{item.milestone}</span>
                <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  Planned
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
