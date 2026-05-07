import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Changelog',
  description: 'What just shipped at PostPilot.',
}

interface Entry {
  date: string
  version: string
  type: 'feature' | 'improvement' | 'fix'
  title: string
  body: string
}

const ENTRIES: Entry[] = [
  {
    date: 'May 7, 2026',
    version: '0.42',
    type: 'feature',
    title: 'Unified Inbox',
    body:
      'Every reply, mention, comment, and DM across X, Instagram, LinkedIn, Facebook, TikTok, Gmail, and Outlook — in one place. With AI-suggested replies that match your brand voice.',
  },
  {
    date: 'May 7, 2026',
    version: '0.42',
    type: 'feature',
    title: 'Brand Kit',
    body:
      'Train your AI agents on your voice, palette, audience, and signature snippets. Includes a voice fingerprint that auto-detects formality, energy, confidence, humor, and technicality.',
  },
  {
    date: 'May 7, 2026',
    version: '0.42',
    type: 'feature',
    title: 'Trends & Discovery',
    body:
      'Real-time trend feed scored by velocity, audience match, and your specific angle. Click to draft a post on any trend in seconds.',
  },
  {
    date: 'May 7, 2026',
    version: '0.42',
    type: 'feature',
    title: 'Command Palette',
    body: 'Press ⌘K from anywhere to navigate, draft, search, or run any agent. Built for keyboard people.',
  },
  {
    date: 'Apr 30, 2026',
    version: '0.41',
    type: 'improvement',
    title: 'OAuth flows hardened',
    body:
      'PKCE everywhere. Encrypted token storage with per-user keys. Re-auth prompts when scopes change. The boring stuff that matters.',
  },
  {
    date: 'Apr 22, 2026',
    version: '0.40',
    type: 'feature',
    title: 'Auto-Pilot',
    body: 'Agents that draft, schedule, and post on a recurring rhythm — with your approval gates wherever you want them.',
  },
  {
    date: 'Apr 14, 2026',
    version: '0.39',
    type: 'feature',
    title: 'Six specialist AI agents',
    body: 'Sarah (strategy), Leo (viral), Aria (voice), Marcus (community), Gina (Gmail), Oliver (Outlook). Each with a job they actually do well.',
  },
  {
    date: 'Apr 4, 2026',
    version: '0.38',
    type: 'improvement',
    title: 'Calendar redesign',
    body: 'Drag to reschedule, multi-platform stacking, and a proper agenda view for week ahead.',
  },
]

const TYPE_STYLES: Record<Entry['type'], { label: string; cls: string }> = {
  feature: { label: 'New', cls: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  improvement: { label: 'Improved', cls: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  fix: { label: 'Fixed', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
}

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Changelog</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">What shipped</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl leading-relaxed">
              We ship every week. Sometimes we miss. We tell you when we do. Here&apos;s the full record.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="space-y-10">
            {ENTRIES.map((e, i) => (
              <article key={i} className="relative pl-8 border-l-2 border-border/60 pb-2">
                <span
                  className="absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-4 ring-background"
                  style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                />
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-[10px] px-2 py-0.5 ${TYPE_STYLES[e.type].cls}`}>
                    {TYPE_STYLES[e.type].label}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">v{e.version}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{e.date}</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight">{e.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{e.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
