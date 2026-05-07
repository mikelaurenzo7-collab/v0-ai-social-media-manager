'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface ProfileResponse {
  profile:
    | {
        onboardingComplete: boolean
        mode?: string | null
        brandName?: string | null
      }
    | null
  completeness: { percent: number }
}

/**
 * Renders one of three states:
 *  - "Tailored to you" (green) when profile is 100% complete
 *  - "Partially tailored" (amber) when 1–99% complete
 *  - "Not tailored yet" (muted) when 0% — links to /dashboard/onboarding
 */
export function TailoredBadge() {
  const [data, setData] = useState<ProfileResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (!res.ok) return
        const json = (await res.json()) as ProfileResponse
        if (!cancelled) setData(json)
      } catch {
        // soft-fail
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const percent = data?.completeness?.percent ?? 0
  const mode = data?.profile?.mode
  const brand = data?.profile?.brandName

  let label = 'Not tailored yet'
  let chipClass = 'bg-muted text-muted-foreground'
  let dotClass = 'bg-muted-foreground/40'
  let tooltip = 'Run onboarding so this agent can sound like you.'

  if (percent === 100) {
    label = 'Tailored to you'
    chipClass = 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
    dotClass = 'bg-emerald-500'
    tooltip = `Speaking as ${brand || 'you'}${mode ? ` in ${mode} mode` : ''}.`
  } else if (percent > 0) {
    label = `Tailored ${percent}%`
    chipClass = 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
    dotClass = 'bg-amber-500'
    tooltip = 'Add a few more details to fully personalize this agent.'
  }

  const Chip = (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${chipClass}`}
    >
      {percent === 100 ? (
        <Sparkles className="size-3" />
      ) : (
        <span className={`size-1.5 rounded-full ${dotClass}`} aria-hidden />
      )}
      {label}
    </span>
  )

  if (percent < 100) {
    return (
      <Link href="/dashboard/onboarding" className="hover:opacity-90 transition-opacity">
        {Chip}
      </Link>
    )
  }
  return Chip
}
