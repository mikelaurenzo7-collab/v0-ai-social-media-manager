'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ = [
  {
    q: 'Do agents actually publish, or just draft?',
    a: 'Both. Agents draft inside the chat, you approve, and PostPilot publishes through real OAuth connections to X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook. Tokens are encrypted at rest with AES-256-GCM and auto-refreshed.',
  },
  {
    q: 'Can I use it just for Gmail or just for Outlook?',
    a: 'Yes. Gina (Gmail) and Oliver (Outlook) are first-class agents with their own outreach playbooks. Connect one channel and send through it — social is optional.',
  },
  {
    q: 'How is this different from a generic AI writer?',
    a: 'Each agent is tuned for one job — Sarah for strategy, Casey for hooks, Riley for voice, Marcus for replies, Gina for cold email, Oliver for executive comms. They know each platform\u2019s formats, character limits, and what actually converts.',
  },
  {
    q: 'Will my drafts and tone stay private?',
    a: 'Yes. We never train on your content, your tokens, or your connected accounts. Your data stays yours.',
  },
  {
    q: 'What platforms are supported today?',
    a: 'X (with PKCE), Instagram, LinkedIn, Facebook Pages, TikTok (Content Posting API), Gmail (OAuth 2.0), and Outlook via Microsoft Graph.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes — 25 generations a month, all six agents, and one connected account on each network. No credit card required.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            FAQ
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            Questions, <span className="gradient-text">answered</span>.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-border/70 rounded-3xl border border-border/70 bg-card/60 backdrop-blur">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="px-5 sm:px-7">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-foreground">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-foreground' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0">
                    <p className="pb-5 pr-6 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
