'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            AI-Powered Content Creation
          </Badge>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your AI Co-Pilot for{' '}
            <span className="text-primary">Social Media</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Stop staring at blank screens. PostPilot generates engaging, platform-optimized 
            content for X, Instagram, and Facebook in seconds. Perfect for influencers, 
            businesses, and creators.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="min-w-[180px]">
              <Link href="/signup">Start Creating Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="min-w-[180px]">
              <Link href="/dashboard/create">Try the Demo</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            No credit card required. Free forever plan available.
          </p>
        </div>

        {/* Platform Logos */}
        <div className="mt-16 flex items-center justify-center gap-8 opacity-60">
          {/* X (Twitter) */}
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-medium">X</span>
          </div>
          {/* Instagram */}
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-sm font-medium">Instagram</span>
          </div>
          {/* Facebook */}
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-sm font-medium">Facebook</span>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="relative mt-16 sm:mt-20">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-muted-foreground">PostPilot - AI Content Generator</span>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              {/* Fake UI Preview */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">X</div>
                  <div className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">Instagram</div>
                  <div className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">Facebook</div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-48 rounded bg-muted" />
                  <div className="h-24 rounded-lg border-2 border-dashed border-muted bg-muted/30" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="h-10 w-32 rounded-lg bg-muted" />
                  <div className="h-10 w-32 rounded-lg bg-muted" />
                </div>
                <div className="h-12 w-40 rounded-lg bg-primary" />
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
