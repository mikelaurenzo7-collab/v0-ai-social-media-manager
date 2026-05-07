import {
  Sparkles,
  Lock,
  Zap,
  CalendarClock,
  GitBranch,
  Inbox,
  Workflow,
  BarChart3,
} from 'lucide-react'

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-orange-500" />
            What&apos;s in the box
          </p>
          <h2 className="mt-4 text-balance font-display text-4xl tracking-tight sm:text-5xl">
            Everything you need <span className="gradient-text">to ship daily.</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Drafts, scheduling, real OAuth publishing, A/B variations, and analytics — all in one
            calm, deeply-considered workspace.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-14 grid gap-4 md:grid-cols-6 md:grid-rows-2">
          <FeatureCard
            className="md:col-span-3 md:row-span-2"
            icon={<Sparkles className="h-5 w-5" />}
            title="Six specialist agents"
            kicker="Built for results"
            description="Strategist, Viral, Voice, Community, Gmail, and Outlook — each tuned with deep platform smarts and shipping defaults you'd actually use."
            visual={<AgentsTile />}
            featured
          />
          <FeatureCard
            className="md:col-span-3"
            icon={<Lock className="h-5 w-5" />}
            title="Real OAuth, encrypted"
            kicker="Secure by default"
            description="One-click connect to X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook. Tokens are AES-256-GCM encrypted at rest with auto-refresh."
            visual={<LockTile />}
          />
          <FeatureCard
            className="md:col-span-3"
            icon={<Zap className="h-5 w-5" />}
            title="A/B variations on tap"
            kicker="Ship more, faster"
            description="Generate 3–5 takes per prompt. Pick a winner, save the rest as drafts, queue the best for your peak hour."
            visual={<VariationsTile />}
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<CalendarClock className="h-4 w-4" />}
            title="Smart scheduling"
            description="Suggested send-times based on your historical engagement and platform best practices."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<Workflow className="h-4 w-4" />}
            title="Auto-Pilot recipes"
            description="Repeating playbooks: weekly thread, daily Outlook digest, monthly Gmail check-in. Set once, forget responsibly."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={<BarChart3 className="h-4 w-4" />}
            title="Honest analytics"
            description="Engagement, replies, and open rates side-by-side. No vanity metrics."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  className = '',
  icon,
  kicker,
  title,
  description,
  visual,
  featured,
}: {
  className?: string
  icon: React.ReactNode
  kicker?: string
  title: string
  description: string
  visual?: React.ReactNode
  featured?: boolean
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        featured ? 'border-foreground/12' : 'border-border/70'
      } ${className}`}
    >
      {featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-60 [mask-image:linear-gradient(to_bottom,white,transparent_60%)]"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 0%, rgba(234,88,12,0.18), transparent 60%)',
          }}
        />
      )}

      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${
              featured
                ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-md'
                : 'bg-muted/60 text-foreground/80'
            }`}
          >
            {icon}
          </span>
          {kicker && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {kicker}
            </span>
          )}
        </div>
        <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {visual && <div className="mt-6 flex-1">{visual}</div>}
      </div>
    </div>
  )
}

/* ── Inline visuals (kept simple, no external deps) ───────────────────── */

function AgentsTile() {
  const agents = [
    { initial: 'S', hue: 'from-blue-500 to-indigo-500',  name: 'Sarah',   role: 'Strategy' },
    { initial: 'C', hue: 'from-orange-500 to-amber-500', name: 'Casey',   role: 'Viral'    },
    { initial: 'R', hue: 'from-purple-500 to-pink-500',  name: 'Riley',   role: 'Voice'    },
    { initial: 'M', hue: 'from-emerald-500 to-teal-500', name: 'Marcus',  role: 'Community'},
    { initial: 'G', hue: 'from-red-500 to-rose-500',     name: 'Gina',    role: 'Gmail'    },
    { initial: 'O', hue: 'from-sky-500 to-blue-600',     name: 'Oliver',  role: 'Outlook'  },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {agents.map((a, i) => (
        <div
          key={a.name}
          className="rounded-xl border border-border/70 bg-card/80 p-3 backdrop-blur transition-transform group-hover:scale-[1.01]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${a.hue} text-xs font-bold text-white shadow-sm`}>
              {a.initial}
            </span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot text-emerald-500" />
          </div>
          <p className="mt-2 text-xs font-semibold text-foreground">{a.name}</p>
          <p className="text-[10px] text-muted-foreground">{a.role}</p>
        </div>
      ))}
    </div>
  )
}

function LockTile() {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
      <div className="grid grid-cols-4 gap-2">
        {['X', 'IG', 'LI', 'TT', 'FB', 'GM', 'OL', '+'].map((p) => (
          <div
            key={p}
            className="flex h-10 items-center justify-center rounded-lg bg-card text-[11px] font-bold text-foreground/80 ring-1 ring-border/60"
          >
            {p}
          </div>
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <Inbox className="h-3 w-3" />
        Tokens encrypted at rest · auto-refresh
      </div>
    </div>
  )
}

function VariationsTile() {
  return (
    <div className="space-y-2">
      {['A · 1.2k likes', 'B · 894 likes', 'C · 312 likes'].map((label, i) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 p-2.5"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
              i === 0
                ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-md'
                : 'bg-muted/60 text-foreground/70'
            }`}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <div className="min-w-0 flex-1">
            <span className="block h-1.5 rounded-full bg-foreground/15" />
            <span className="mt-1 block h-1.5 w-3/4 rounded-full bg-foreground/10" />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
          {i === 0 && (
            <GitBranch className="ml-1 h-3.5 w-3.5 text-orange-500" />
          )}
        </div>
      ))}
    </div>
  )
}
