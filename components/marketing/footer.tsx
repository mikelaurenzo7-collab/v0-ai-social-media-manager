import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const COLS = [
  {
    heading: 'Product',
    items: [
      { label: 'Features',  href: '/#features' },
      { label: 'Agents',    href: '/agents'   },
      { label: 'Pricing',   href: '/#pricing' },
      { label: 'Live demo', href: '/dashboard/create' },
    ],
  },
  {
    heading: 'Use cases',
    items: [
      { label: 'For founders',  href: '/for/founders' },
      { label: 'For agencies',  href: '/for/agencies' },
      { label: 'For creators',  href: '/for/creators' },
      { label: 'Browse agents', href: '/agents' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About',         href: '/about' },
      { label: 'Roadmap',       href: '/roadmap' },
      { label: 'Changelog',     href: '/changelog' },
      { label: 'System status', href: '/status' },
      { label: 'Contact',       href: 'mailto:hello@postpilot.app' },
    ],
  },
  {
    heading: 'Trust',
    items: [
      { label: 'Privacy',  href: '/privacy' },
      { label: 'Terms',    href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'Sub-processors', href: '/security#subprocessors' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="PostPilot home">
              <Logo size={28} wordmark wordmarkClassName="text-[1.4rem]" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your AI co-pilot for social and email. Six specialist agents that draft, schedule,
              and publish across every channel that matters.
            </p>
            <Link
              href="/status"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
            >
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot text-emerald-500" />
              View system status
            </Link>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => {
                  const isInternal = item.href.startsWith('/') && !item.href.startsWith('//')
                  return (
                    <li key={item.label}>
                      {isInternal ? (
                        <Link
                          href={item.href}
                          className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PostPilot · Made for shipping
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with restraint in San Francisco · Lisbon · Toronto
          </p>
        </div>
      </div>
    </footer>
  )
}
