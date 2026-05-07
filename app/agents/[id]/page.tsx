import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { CTABanner } from '@/components/marketing/cta-banner'
import { PlatformIcon } from '@/components/accounts/platform-icon'
import { AGENTS, getAgentById } from '@/lib/agents'
import { AGENT_DETAILS } from '@/lib/agent-details'

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const agent = AGENTS.find((a) => a.id === id)
  if (!agent) return { title: 'Agent not found' }

  const detail = AGENT_DETAILS[id]
  const title = `${agent.name} — ${agent.role}`
  const description =
    detail?.oneLine ?? agent.description

  return {
    title,
    description,
    alternates: { canonical: `/agents/${id}` },
    openGraph: {
      title: `${agent.name} · PostPilot`,
      description,
      url: `/agents/${id}`,
      images: [
        {
          url: `/api/og?eyebrow=${encodeURIComponent(agent.role)}&title=${encodeURIComponent(agent.name)}&subtitle=${encodeURIComponent(detail?.oneLine ?? agent.description)}`,
          width: 1200,
          height: 630,
          alt: `${agent.name} on PostPilot`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.name} · PostPilot`,
      description,
    },
  }
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = getAgentById(id)
  const detail = AGENT_DETAILS[id]

  if (!agent || agent.id !== id || !detail) {
    notFound()
  }

  const platform = agent.platforms[0]
  const others = AGENTS.filter((a) => a.id !== agent.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(45% 45% at 25% 30%, oklch(0.652 0.214 36 / 0.18), transparent 60%),' +
                'radial-gradient(45% 45% at 75% 25%, oklch(0.588 0.238 352 / 0.16), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All agents
            </Link>

            <div className="mt-6 flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md bg-gradient-to-br ${detail.hue}`}
              >
                {agent.avatar}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
                  {agent.role}
                </p>
                <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
                  {agent.name}
                </h1>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {detail.oneLine}
            </p>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80">
              {agent.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="btn-gradient inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
              >
                Try {agent.name} free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/dashboard/agents/${agent.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-card px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                Open in dashboard
              </Link>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <PlatformIcon platform={platform} size="sm" />
              Connects via real OAuth · tokens encrypted at rest
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Knows the channel
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-tight">
                Platform smarts, baked in.
              </h2>
              <ul className="mt-6 space-y-3">
                {detail.knows.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
                    <span
                      className="mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: 'var(--brand-gradient)' }}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                What it ships
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-tight">Real outputs.</h2>
              <ul className="mt-6 space-y-3">
                {detail.produces.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
                    <span className="mt-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-muted text-foreground/70">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Sample draft
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              One paragraph of the kind of thing this agent writes for real customers.
            </p>
            <div className="mt-6 rounded-2xl border border-border/50 bg-background p-6">
              <p className="font-display text-lg leading-snug tracking-tight">{detail.excerpt.hook}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {detail.excerpt.body}
              </p>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground/80">
              See more in the public{' '}
              <Link href="/examples" className="underline underline-offset-2 hover:text-foreground">
                examples gallery
              </Link>
              .
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border/70 bg-card/60 p-8 backdrop-blur">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Built-in capabilities
            </p>
            <h2 className="mt-3 font-display text-2xl tracking-tight">
              Five tools out of the box.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agent.capabilities.map((cap) => (
                <div
                  key={cap}
                  className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 text-sm font-medium text-foreground/85"
                >
                  {cap}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Every capability is gated by per-agent permissions you control: posting authority,
              channel scopes, and which tools the agent is allowed to invoke.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                The rest of the roster
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">Five more specialists.</h2>
            </div>
            <Link
              href="/agents"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See all →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((a) => {
              const d = AGENT_DETAILS[a.id]
              return (
                <Link
                  key={a.id}
                  href={`/agents/${a.id}`}
                  className="group rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black text-white bg-gradient-to-br ${d?.hue ?? 'from-zinc-700 to-zinc-900'}`}
                    >
                      {a.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">{a.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                    {d?.oneLine ?? a.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
