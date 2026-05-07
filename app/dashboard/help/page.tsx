'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const CATEGORIES = [
  {
    icon: '🚀',
    title: 'Getting started',
    desc: 'Connect accounts, train your voice, ship your first post.',
    articles: 8,
    color: 'from-orange-500 to-pink-600',
  },
  {
    icon: '🤖',
    title: 'AI agents',
    desc: 'Meet the team — Sarah, Leo, Aria, Marcus, Gina, Oliver.',
    articles: 14,
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: '📅',
    title: 'Scheduling & Auto-Pilot',
    desc: 'Calendars, queues, time zones, retries.',
    articles: 11,
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: '🔌',
    title: 'Connections & OAuth',
    desc: 'Why we ask for which permissions, how to revoke.',
    articles: 9,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: '💳',
    title: 'Billing',
    desc: 'Plans, generations, invoices, refunds.',
    articles: 6,
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: '🔒',
    title: 'Security & Privacy',
    desc: 'Encryption, data residency, account deletion.',
    articles: 7,
    color: 'from-slate-500 to-slate-700',
  },
]

const POPULAR = [
  { q: 'Why do I need to connect my X account separately from my LinkedIn?', read: '2 min' },
  { q: 'Can the AI agents post on my behalf without my approval?', read: '3 min' },
  { q: 'How do I train an agent on my brand voice?', read: '4 min' },
  { q: 'What happens when a scheduled post fails?', read: '2 min' },
  { q: 'Is my OAuth token stored in plain text? (No.)', read: '5 min' },
  { q: 'How do I delete my account and all my data?', read: '1 min' },
]

const RESOURCES = [
  { label: 'API & Webhooks', desc: 'Build on top of PostPilot', href: '#', emoji: '🛠️' },
  { label: 'Changelog', desc: 'See what shipped this week', href: '/changelog', emoji: '📝' },
  { label: 'System status', desc: 'Live uptime + incident log', href: '/status', emoji: '🟢' },
  { label: 'Security', desc: 'How we keep your data safe', href: '/security', emoji: '🔒' },
]

export default function HelpPage() {
  const [q, setQ] = useState('')

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Help Center"
        description="Find an answer in seconds — or talk to a human."
      />

      <div className="p-6 space-y-8">
        {/* Hero search */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.135 0.018 48), oklch(0.21 0.05 30))',
          }}
        >
          <div
            className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #EA580C, transparent 70%)' }}
          />
          <h2 className="relative text-2xl sm:text-3xl font-black text-white tracking-tight">
            How can we help?
          </h2>
          <p className="relative mt-2 text-sm text-white/70 max-w-md mx-auto">
            Search 60+ articles or ask the AI assistant. Average answer time: 8 seconds.
          </p>
          <div className="relative mt-6 max-w-xl mx-auto">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for answers, or ask the assistant…"
                className="h-12 pl-11 pr-4 rounded-xl bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30"
              />
            </div>
            <p className="mt-2 text-[11px] text-white/50">
              Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">⌘K</kbd> from anywhere to open this.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Browse by topic
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Card key={c.title} className="hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl bg-gradient-to-br ${c.color} text-white shadow-sm`}
                    >
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.desc}</p>
                      <p className="text-[10px] font-semibold text-muted-foreground/80 mt-2 uppercase tracking-widest">
                        {c.articles} articles →
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Popular questions
            </h3>
            <Card>
              <CardContent className="p-2">
                {POPULAR.map((p) => (
                  <button
                    key={p.q}
                    className="w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <span className="text-sm truncate">{p.q}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{p.read}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Resources + Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Resources</h3>
            <div className="space-y-2">
              {RESOURCES.map((r) => (
                <Link key={r.label} href={r.href} className="block">
                  <div className="rounded-xl border border-border/60 bg-card p-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">{r.emoji}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{r.label}</p>
                        <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
            >
              <p className="text-sm font-bold">Still stuck?</p>
              <p className="text-xs text-white/85 mt-1">Real humans, not a bot. Average reply: 2h.</p>
              <Button size="sm" variant="secondary" className="mt-3 h-8 text-xs">
                Email support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
