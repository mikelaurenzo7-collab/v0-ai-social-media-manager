'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProfileResponse {
  profile: { onboardingComplete: boolean } | null
  completeness: { percent: number; missing: string[] }
}

/**
 * Compact profile-completeness card for the dashboard sidebar.
 * - Hidden when the profile is 100% complete and onboarding is done.
 * - Otherwise shows a small ring + "Tailor your AI" CTA pointing at /dashboard/onboarding.
 */
export function ProfileCompletenessCard() {
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (!res.ok) return
        const json = (await res.json()) as ProfileResponse
        if (!cancelled) setData(json)
      } catch {
        // soft-fail
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }

    load()

    // Refresh when the user comes back from the onboarding/settings flow
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (!loaded || !data) return null

  const percent = data.completeness?.percent ?? 0
  const missing = data.completeness?.missing ?? []

  // 100% + onboarding complete → no card needed
  if (percent === 100 && data.profile?.onboardingComplete) return null

  const radius = 14
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <Link
      href="/dashboard/onboarding"
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
      style={{ background: 'oklch(0.185 0.016 48)' }}
    >
      <div className="relative shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="oklch(0.28 0.014 48)"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#EA580C"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white"
          aria-hidden
        >
          {percent}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-semibold text-white">
          {percent === 0 ? 'Set up your AI' : 'Tailor your AI'}
        </p>
        <p
          className="truncate text-[10px]"
          style={{ color: 'oklch(0.42 0.012 52)' }}
        >
          {missing.length > 0
            ? `${missing.length} item${missing.length === 1 ? '' : 's'} left`
            : 'Almost there'}
        </p>
      </div>
      <svg
        className="h-3 w-3 shrink-0 -translate-x-0.5 group-hover:translate-x-0 transition-transform"
        style={{ color: 'oklch(0.42 0.012 52)' }}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}
