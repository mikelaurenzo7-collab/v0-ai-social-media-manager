'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * First-run guard. Mounts inside the dashboard layout, checks the user's
 * profile on mount, and redirects to /dashboard/onboarding if they haven't
 * completed it yet. Skips the redirect when already on the onboarding page
 * or on routes the user must reach to set up integrations first (accounts).
 */
const SKIP_PATHS = ['/dashboard/onboarding', '/dashboard/accounts']

export function OnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return

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
        }
      } catch {
        // Soft-fail: don't block the dashboard if the API is down.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, router])

  return null
}
