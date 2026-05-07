'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * First-run guard. Mounts inside the dashboard layout, checks the user's
 * profile on mount, and redirects to /dashboard/onboarding if they haven't
 * completed it yet.
 *
 * Hardening:
 *  - Caches the "onboardingComplete=true" verdict in sessionStorage so the
 *    next dashboard navigation skips the fetch entirely (no flicker).
 *  - Renders a full-screen blocker only on the very first navigation, while
 *    the verdict is unknown — avoids flash-of-dashboard for new users.
 *  - Still soft-fails if the API is down (we don't trap users out of the app).
 */
const SKIP_PATHS = ['/dashboard/onboarding', '/dashboard/accounts']
const VERDICT_KEY = 'postpilot_onboarding_complete'

export function OnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    if (!pathname) return
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return

    // Fast path — verdict cached in this tab's sessionStorage
    try {
      if (sessionStorage.getItem(VERDICT_KEY) === '1') return
    } catch {
      /* sessionStorage unavailable */
    }

    setBlocking(true)
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as {
          profile: { onboardingComplete: boolean } | null
        }
        if (cancelled) return
        if (!data.profile || !data.profile.onboardingComplete) {
          router.replace('/dashboard/onboarding')
          return
        }
        try {
          sessionStorage.setItem(VERDICT_KEY, '1')
        } catch {
          /* ignore */
        }
      } catch {
        // Soft-fail: don't block the dashboard if the API is down.
      } finally {
        if (!cancelled) setBlocking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, router])

  if (!blocking) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span className="text-sm text-muted-foreground">Checking your profile&hellip;</span>
      </div>
    </div>
  )
}
