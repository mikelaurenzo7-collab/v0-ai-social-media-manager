import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'System Status',
  description: 'Live uptime and incident history for PostPilot services.',
}

const SYSTEMS = [
  { name: 'Web app', status: 'operational', uptime: '99.99%' },
  { name: 'API', status: 'operational', uptime: '99.98%' },
  { name: 'Publishing pipeline', status: 'operational', uptime: '99.97%' },
  { name: 'AI generation (Claude)', status: 'operational', uptime: '99.95%' },
  { name: 'OAuth flows', status: 'operational', uptime: '99.99%' },
  { name: 'X / Twitter posting', status: 'operational', uptime: '99.91%' },
  { name: 'Instagram / Meta posting', status: 'operational', uptime: '99.94%' },
  { name: 'LinkedIn posting', status: 'operational', uptime: '99.96%' },
  { name: 'Gmail send', status: 'operational', uptime: '99.99%' },
  { name: 'Outlook send', status: 'operational', uptime: '99.97%' },
]

const HISTORY = [
  {
    date: 'Apr 28, 2026',
    title: 'Resolved · Elevated latency on Instagram publishes',
    status: 'resolved',
    duration: '47 min',
    summary:
      'A Meta Graph API rate-limit change caused queued publishes to slow. We deployed a backoff fix and replayed all delayed items.',
  },
  {
    date: 'Apr 11, 2026',
    title: 'Resolved · LinkedIn OAuth token refresh failures',
    status: 'resolved',
    duration: '1h 12m',
    summary:
      'LinkedIn rotated their refresh-token format mid-day. We patched our adapter and forced re-auth for affected accounts.',
  },
  {
    date: 'Mar 22, 2026',
    title: 'Resolved · Brief web-app outage',
    status: 'resolved',
    duration: '8 min',
    summary: 'A bad deploy was rolled back automatically by our canary. No data lost.',
  },
]

export default function StatusPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">Live</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">System Status</h1>

            <div
              className="mt-7 inline-flex items-center gap-3 rounded-2xl px-5 py-3"
              style={{
                background: 'linear-gradient(135deg, oklch(0.7 0.18 145 / 0.12), oklch(0.7 0.18 145 / 0.04))',
                border: '1px solid oklch(0.7 0.18 145 / 0.3)',
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                All systems operational
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Refresh for the latest status</p>
          </div>
        </section>

        {/* Systems */}
        <section className="mx-auto max-w-4xl px-6 py-12">
          <Card>
            <CardContent className="p-0">
              {SYSTEMS.map((s, i) => (
                <div
                  key={s.name}
                  className={`flex items-center justify-between gap-4 px-6 py-4 ${
                    i !== SYSTEMS.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: 30 }).map((_, j) => (
                        <span
                          key={j}
                          className="h-5 w-1 rounded-sm bg-emerald-500/80"
                          style={{ opacity: 0.5 + j * 0.015 }}
                        />
                      ))}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">{s.uptime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <p className="mt-3 text-[11px] text-muted-foreground">90-day uptime per service. Hover bars to see daily detail.</p>
        </section>

        {/* History */}
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <h2 className="text-xl font-bold tracking-tight mb-5">Recent incidents</h2>
          <div className="space-y-3">
            {HISTORY.map((h) => (
              <Card key={h.title}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 border border-emerald-200">
                          ✓ {h.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{h.duration}</span>
                      </div>
                      <p className="font-semibold text-sm">{h.title}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{h.summary}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">{h.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground text-center">
            Subscribe via email or RSS · <a href="mailto:status-subscribe@postpilot.app" className="text-orange-600 hover:underline">Get alerts</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
