'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const demoPrompts = [
  "Launching our new sustainable product line",
  "Sharing 5 productivity tips for remote workers",
  "Celebrating 10,000 followers milestone",
  "Announcing our summer sale event",
]

const demoOutputs = [
  {
    content: "Big news! We\u2019re launching our new sustainable product line. Crafted with care for both you and the planet.",
    hashtags: ["Sustainable", "EcoFriendly", "NewLaunch"],
  },
  {
    content: "5 productivity hacks that changed how I work remotely: 1. Time blocking 2. No-meeting mornings 3. The 2-minute rule...",
    hashtags: ["Productivity", "RemoteWork", "WorkFromHome"],
  },
  {
    content: "10,000 of you! This community means everything. Thank you for believing in what we do.",
    hashtags: ["Milestone", "ThankYou", "Community"],
  },
  {
    content: "Summer is here and so are the deals! Up to 50% off everything. Don\u2019t miss out!",
    hashtags: ["SummerSale", "Deals", "ShopNow"],
  },
]

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedPrompt, setDisplayedPrompt] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showOutput, setShowOutput] = useState(false)

  useEffect(() => {
    const prompt = demoPrompts[currentIndex]
    let charIndex = 0
    setIsTyping(true)
    setShowOutput(false)
    setDisplayedPrompt('')

    const typingInterval = setInterval(() => {
      if (charIndex < prompt.length) {
        setDisplayedPrompt(prompt.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        setTimeout(() => setShowOutput(true), 500)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % demoPrompts.length)
        }, 4000)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [currentIndex])

  const currentOutput = demoOutputs[currentIndex]

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
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
            content for X, Instagram, LinkedIn, TikTok, and Facebook in seconds. Built for
            creators, founders, and teams who post every day.
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
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70">
          {/* X (Twitter) */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-medium">X</span>
          </div>
          {/* Instagram */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span className="text-sm font-medium">Instagram</span>
          </div>
          {/* LinkedIn */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span className="text-sm font-medium">LinkedIn</span>
          </div>
          {/* TikTok */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.84a8.16 8.16 0 004.77 1.52V6.93a4.85 4.85 0 01-1.84-.24z" />
            </svg>
            <span className="text-sm font-medium">TikTok</span>
          </div>
          {/* Facebook */}
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-sm font-medium">Facebook</span>
          </div>
        </div>

        {/* Interactive Demo Preview */}
        <div className="relative mt-16 sm:mt-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card shadow-2xl">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-muted-foreground">PostPilot - AI Content Generator</span>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Side */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">X</div>
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">Instagram</div>
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">LinkedIn</div>
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">TikTok</div>
                    <div className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">Facebook</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Your idea</label>
                    <div className="min-h-[80px] rounded-lg border bg-background p-3 text-sm">
                      <span>{displayedPrompt}</span>
                      {isTyping && <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="rounded-md border bg-muted/50 px-3 py-1.5 text-xs">Casual</div>
                    <div className="rounded-md border bg-muted/50 px-3 py-1.5 text-xs">Promotional</div>
                  </div>

                  <div className={`h-9 w-32 rounded-lg bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground transition-opacity ${isTyping ? 'opacity-50' : 'opacity-100'}`}>
                    {isTyping ? 'Typing...' : showOutput ? 'Generated!' : 'Generate'}
                  </div>
                </div>

                {/* Output Side */}
                <div className={`space-y-3 transition-all duration-500 ${showOutput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <label className="text-xs font-medium text-muted-foreground">AI Generated Post</label>
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0" />
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Your Brand</span>
                          <span className="text-xs text-muted-foreground">@yourbrand</span>
                        </div>
                        <p className="text-sm leading-relaxed">{currentOutput.content}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentOutput.hashtags.map((tag) => (
                            <span key={tag} className="text-xs text-primary">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer">Copy</div>
                    <div className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer">Save Draft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
