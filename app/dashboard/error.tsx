'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border/70 bg-card/70 p-8 text-center backdrop-blur">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
          Section error
        </p>
        <h1 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
          This part of the dashboard didn&apos;t load.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Other workspaces and agents are unaffected. Retry the section, and if it persists, our
          status page tracks live incidents.
        </p>

        {error?.digest && (
          <p className="mt-4 inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="btn-gradient inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card px-5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            Back to dashboard
          </Link>
          <Link
            href="/status"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-card px-5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            System status
          </Link>
        </div>
      </div>
    </div>
  )
}
