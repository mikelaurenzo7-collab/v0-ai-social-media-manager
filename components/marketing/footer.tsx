import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const COLS = [
  {
    heading: 'Product',
    items: [
      { label: 'Features',  href: '#features' },
      { label: 'Agents',    href: '#agents'   },
      { label: 'Pricing',   href: '#pricing'  },
      { label: 'Live demo', href: '/dashboard/create' },
    ],
  },
  {
    heading: 'Channels',
    items: [
      { label: 'X / Twitter', href: '/dashboard/accounts' },
      { label: 'Instagram',   href: '/dashboard/accounts' },
      { label: 'LinkedIn',    href: '/dashboard/accounts' },
      { label: 'TikTok',      href: '/dashboard/accounts' },
      { label: 'Gmail',       href: '/dashboard/accounts' },
      { label: 'Outlook',     href: '/dashboard/accounts' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About',     href: '#'         },
      { label: 'Changelog', href: '#'         },
      { label: 'Blog',      href: '#'         },
      { label: 'Contact',   href: '#contact'  },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy',  href: '#' },
      { label: 'Terms',    href: '#' },
      { label: 'Security', href: '#' },
      { label: 'DPA',      href: '#' },
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
              Your AI co-pilot for social and email. One agent per integration — customize role,
              voice, and rules after you connect.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot text-emerald-500" />
              All systems normal
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
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
