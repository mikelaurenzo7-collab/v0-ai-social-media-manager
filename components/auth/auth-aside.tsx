import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Quote } from 'lucide-react'

export function AuthAside() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/8 p-10 text-white lg:flex"
      style={{
        background:
          'radial-gradient(ellipse 60% 60% at 20% 100%, rgba(234,88,12,0.55), transparent 60%),' +
          'radial-gradient(ellipse 60% 60% at 80% 0%, rgba(219,39,119,0.45), transparent 60%),' +
          'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(245,158,11,0.20), transparent 70%),' +
          'oklch(0.13 0.018 48)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-dark opacity-[0.30] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Top: brand */}
      <div className="relative">
        <Link href="/" className="inline-flex" aria-label="PostPilot home">
          <Logo size={32} wordmark wordmarkClassName="text-[1.45rem] text-white" />
        </Link>
      </div>

      {/* Middle: hero quote */}
      <div className="relative max-w-md">
        <Quote className="h-7 w-7 text-white/40" />
        <p className="mt-4 font-display text-3xl leading-tight tracking-tight text-white">
          The first tool I&apos;ve actually wanted to leave open all day. Six agents, one calm space — my replies are up 3.4×.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 font-bold">
            J
          </span>
          <div className="text-sm">
            <p className="font-semibold text-white">Jules Marin</p>
            <p className="text-white/60">Founder, Folksong &amp; Co.</p>
          </div>
        </div>
      </div>

      {/* Bottom: status */}
      <div className="relative flex items-center gap-2 text-xs text-white/50">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot text-emerald-400" />
        <span>All channels healthy</span>
        <span aria-hidden>·</span>
        <span>SOC 2-ready</span>
        <span aria-hidden>·</span>
        <span>v2026.05</span>
      </div>
    </aside>
  )
}
