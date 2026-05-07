import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export const metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      {/* Soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, oklch(0.652 0.214 36 / 0.08), transparent 55%), radial-gradient(circle at 70% 70%, oklch(0.588 0.238 352 / 0.06), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-grid opacity-40 [mask-image:linear-gradient(180deg,black,transparent)]"
      />

      <div className="mb-7">
        <Logo size={36} wordmark wordmarkClassName="text-[1.5rem]" />
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">404</p>
      <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
        We took a wrong turn.
        <span className="block text-muted-foreground italic font-normal" style={{ fontFamily: 'var(--font-display)' }}>
          That page isn&apos;t here.
        </span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
        The link might be stale, the route might have moved, or one of our agents got a little
        too creative with the URL. Either way, here are the doors back.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        <DoorLink href="/dashboard" emoji="🏠" label="Dashboard" desc="The home base" />
        <DoorLink href="/dashboard/inbox" emoji="📬" label="Inbox" desc="Replies + DMs" />
        <DoorLink href="/changelog" emoji="📝" label="Changelog" desc="What just shipped" />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        <Link href="/dashboard/help" className="hover:text-foreground transition-colors">
          Help center
        </Link>
        <span>·</span>
        <Link href="/status" className="hover:text-foreground transition-colors">
          System status
        </Link>
        <span>·</span>
        <a href="mailto:hello@postpilot.app" className="hover:text-foreground transition-colors">
          Tell us what was supposed to be here
        </a>
      </div>
    </div>
  )
}

function DoorLink({ href, emoji, label, desc }: { href: string; emoji: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-border"
    >
      <div className="text-3xl">{emoji}</div>
      <p className="mt-2 text-sm font-bold">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc} →</p>
    </Link>
  )
}
