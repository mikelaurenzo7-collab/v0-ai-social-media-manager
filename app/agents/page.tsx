import Link from 'next/link'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { AGENTS } from '@/lib/agents'

export const metadata = {
  title: 'Meet the agents',
  description:
    'Six channel-specialist AI agents — X, Meta, LinkedIn, TikTok, Gmail, Outlook — that draft, design, and publish through real OAuth. Personas, voice, and permissions are fully customizable.',
}

interface AgentDetail {
  id: string
  hue: string
  oneLine: string
  knows: string[]
  produces: string[]
  excerpt: { hook: string; body: string }
}

const DETAIL: Record<string, AgentDetail> = {
  x: {
    id: 'x',
    hue: 'from-zinc-700 to-zinc-900',
    oneLine: 'Owns hooks, threads, and reply velocity on X.',
    knows: [
      '280-char limits, thread mechanics, quote-tweet etiquette',
      'The first 10 words decide everything',
      'Reply velocity in the first hour beats post-time optimization',
    ],
    produces: [
      'Single tweets with stop-the-scroll hooks',
      'Threads (3–20 tweets) — opens strong, closes with a CTA',
      'Quote tweets, polls, reply chains',
    ],
    excerpt: {
      hook: '5 lessons from launch week. A thread.',
      body: '1/ Ship before you’re ready. We weren’t. It still worked. 2/ The first hour matters more than the first day. 3/ Pin the demo, not the announcement.',
    },
  },
  meta: {
    id: 'meta',
    hue: 'from-pink-500 to-rose-500',
    oneLine: 'Owns Instagram and Facebook — captions, carousels, Reels.',
    knows: [
      'IG: first 125 chars are the post; carousels keep them swiping',
      'FB: emotional storytelling drives shares; native video > links',
      'Save rate predicts Explore-page reach',
    ],
    produces: [
      'Captions with hook → value → CTA',
      'Carousel storyboards (5–10 slides) with save bait',
      'Reels scripts: hook in 1.5s, on-screen text overlays',
    ],
    excerpt: {
      hook: 'Inside the studio at 7am.',
      body: 'Workbench, no stylists. The version we almost shipped, and the one we sent. Save this if you’ve ever wondered what crafted actually looks like.',
    },
  },
  linkedin: {
    id: 'linkedin',
    hue: 'from-sky-500 to-blue-700',
    oneLine: 'Owns LinkedIn — long-form, thought leadership, document carousels.',
    knows: [
      'First 3 lines decide whether anyone clicks "see more"',
      'Personal stories outperform feature posts 7×',
      'Links in the body kill reach — first comment instead',
    ],
    produces: [
      'Long-form posts with line breaks every 1–2 sentences',
      'Document carousels (7–10 slides)',
      'Polls and newsletter drafts',
    ],
    excerpt: {
      hook: 'We hit 10k customers.',
      body: 'I cry-laughed in the car after the call with #6,142. Building means caring about every single one. If you’re early, that’s the bar.',
    },
  },
  tiktok: {
    id: 'tiktok',
    hue: 'from-fuchsia-500 to-rose-600',
    oneLine: 'Owns TikTok — hooks, scripts, on-screen text, audio direction.',
    knows: [
      '1.5-second hook or you lose the viewer forever',
      'On-screen text drives watch-time more than VO',
      'Trending audio amplifies the FYP algorithm',
    ],
    produces: [
      'Shot-by-shot storyboards: hook → payoff → CTA',
      'On-screen text overlays + voiceover scripts',
      'Series planning (Part 1 → 2 → 3)',
    ],
    excerpt: {
      hook: 'I broke every productivity rule for 30 days.',
      body: 'Rule #4 made me 3× more focused. Don’t skip — wait for the green sticky note.',
    },
  },
  gmail: {
    id: 'gmail',
    hue: 'from-red-500 to-orange-500',
    oneLine: 'Owns Gmail — cold outreach, follow-ups, reply drafts that get answered.',
    knows: [
      'Subjects under 50 chars open at 2× the rate',
      'Personalization beyond {first_name} drives 2–3× reply rate',
      'Reply chains improve deliverability — keep threads going',
    ],
    produces: [
      'Cold intros that read human, not automated',
      'Smart follow-ups when threads go quiet',
      'Reply drafts that match prior thread tone',
    ],
    excerpt: {
      hook: 'subject: small idea, big fan',
      body: 'short version — love what you’re building. one specific way we could collab in 15 min, happy to send the deck if it’s a fit.',
    },
  },
  outlook: {
    id: 'outlook',
    hue: 'from-blue-600 to-indigo-700',
    oneLine: 'Owns Outlook — executive comms, board updates, internal memos.',
    knows: [
      'Subject prefixes ([Action], [Decision], [Update]) help triage',
      'M365 spam filters favor authenticated domains',
      'Calendar links inside emails dramatically lift meeting conversion',
    ],
    produces: [
      'Executive summaries with headline + drivers + ask',
      'Board updates and internal memos',
      'Meeting invites with agenda baked into the body',
    ],
    excerpt: {
      hook: 'Subject: [Update] Q3 revenue + commentary',
      body: 'Headline: $4.2M (+38% YoY). Three drivers below, two risks I’m watching, one ask.',
    },
  },
}

export default function AgentsMarketingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(35% 35% at 30% 30%, oklch(0.652 0.214 36 / 0.16), transparent 60%),' +
                'radial-gradient(35% 35% at 70% 25%, oklch(0.588 0.238 352 / 0.14), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">The roster</p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight max-w-3xl">
              Six specialists.
              <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                One per channel.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Each agent is tuned for the channel it owns: the format, the algorithm, the hooks that work,
              the rules that don&apos;t. Ship with confident defaults out of the box, then make every one
              of them yours.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {AGENTS.map((a) => {
                const platform = a.platforms[0]
                return (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 backdrop-blur px-3 py-1.5 text-xs font-semibold transition-colors hover:border-orange-500/40 hover:text-orange-600"
                  >
                    <PlatformIcon platform={platform} size="sm" />
                    {a.name}
                  </a>
                )
              })}
            </div>
          </div>
        </section>

        {/* Per-agent deep dives */}
        <section className="mx-auto max-w-5xl px-6 py-16 space-y-14">
          {AGENTS.map((agent, i) => {
            const detail = DETAIL[agent.id]
            const platform = agent.platforms[0]
            const isReverse = i % 2 === 1
            return (
              <article
                key={agent.id}
                id={agent.id}
                className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center scroll-mt-20"
              >
                {/* Copy */}
                <div className={isReverse ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-sm bg-gradient-to-br ${detail.hue}`}
                    >
                      {agent.avatar}
                    </div>
                    <div>
                      <p className="text-base font-bold leading-tight">{agent.name}</p>
                      <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{detail.oneLine}</h2>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{agent.description}</p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Knows</p>
                      <ul className="space-y-1.5">
                        {detail.knows.map((k) => (
                          <li key={k} className="flex gap-2 text-[12.5px] leading-relaxed">
                            <span className="text-orange-500 mt-0.5">·</span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Produces</p>
                      <ul className="space-y-1.5">
                        {detail.produces.map((p) => (
                          <li key={p} className="flex gap-2 text-[12.5px] leading-relaxed">
                            <span className="text-pink-500 mt-0.5">·</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {agent.capabilities.slice(0, 4).map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">
                        {c}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button asChild className="text-sm font-semibold" style={{ background: 'var(--brand-gradient)' }}>
                      <Link href={`/dashboard/agents/${agent.id}`}>Open {agent.name} →</Link>
                    </Button>
                    <Button asChild variant="outline" className="text-sm">
                      <Link href="/signup">Try free</Link>
                    </Button>
                  </div>
                </div>

                {/* Sample output */}
                <div className={isReverse ? 'lg:order-1' : ''}>
                  <Card className="overflow-hidden">
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={platform} size="sm" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Sample · {agent.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">draft</span>
                    </div>
                    <CardContent className="p-5">
                      <p className="text-sm font-bold leading-snug">{detail.excerpt.hook}</p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {detail.excerpt.body}
                      </p>
                      <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                        <span>♥ 1.2k</span>
                        <span>↻ 312</span>
                        <span>💬 84</span>
                        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700">
                          on brand · 92
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </article>
            )
          })}
        </section>

        {/* What every agent shares */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <Card>
            <CardContent className="p-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  emoji: '🧠',
                  title: 'Adaptive memory',
                  body: 'Every agent learns from your approvals, edits, and feedback. Memories are explainable and editable.',
                },
                {
                  emoji: '🎚',
                  title: 'Per-agent permissions',
                  body: 'Posting authority, channel scopes, rate limits, quiet hours, tool access. All flow to the model on every request.',
                },
                {
                  emoji: '🛡',
                  title: 'Brand Kit-aware',
                  body: 'Voice, palette, hashtags, do/don\'t rules. Every agent inherits them. Hard rules cannot be bypassed.',
                },
              ].map((f) => (
                <div key={f.title}>
                  <div className="text-3xl mb-2">{f.emoji}</div>
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
