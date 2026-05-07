'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, oklch(0.652 0.214 36 / 0.08), transparent 55%), radial-gradient(circle at 70% 70%, oklch(0.588 0.238 352 / 0.06), transparent 50%)',
        }}
      />

      <div className="mb-7">
        <Logo size={36} wordmark wordmarkClassName="text-[1.5rem]" />
      </div>

      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600">
        <AlertTriangle className="h-5 w-5" />
      </span>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
        Something tripped
      </p>
      <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black tracking-tight sm:text-5xl">
        We hit a snag.
        <span
          className="block text-muted-foreground italic font-normal"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Not your fault — definitely ours.
        </span>
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
        Try the page again. If it keeps happening, our system status page tracks live incidents,
        and we read every email at hello@postpilot.app.
      </p>

      {error?.digest && (
        <p className="mt-4 inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-mono text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="btn-gradient inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Try again
        </button>
        <Link
          href="/status"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-card px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          See system status
        </Link>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          Back to dashboard
        </Link>
        <span>·</span>
        <Link href="/dashboard/help" className="hover:text-foreground transition-colors">
          Help center
        </Link>
        <span>·</span>
        <a href="mailto:hello@postpilot.app" className="hover:text-foreground transition-colors">
          Email support
        </a>
      </div>
    </div>
  )
}
