'use client'

import { useEffect } from 'react'
import { readPrefs, subscribePrefs, type Theme } from '@/lib/preferences'

/**
 * Applies the user's theme + reduce-motion preferences to the document
 * root. Mounted once at the top of the dashboard layout (and the marketing
 * shell when we want theming there too). Renders nothing.
 *
 * The matching is split into two independent effects so the system theme
 * media listener doesn't have to be re-subscribed every time prefs change.
 */
export function ThemeManager() {
  useEffect(() => {
    const apply = (theme: Theme) => {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      const sysDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = theme === 'dark' || (theme === 'system' && sysDark)
      root.classList.toggle('dark', dark)
      root.style.colorScheme = dark ? 'dark' : 'light'
    }

    const applyMotion = (reduce: boolean) => {
      if (typeof document === 'undefined') return
      document.documentElement.classList.toggle('reduce-motion', reduce)
    }

    // Initial paint
    const initial = readPrefs()
    apply(initial.theme)
    applyMotion(initial.reduceMotion)

    // Pref changes (cross-tab + same-tab)
    const offPrefs = subscribePrefs((p) => {
      apply(p.theme)
      applyMotion(p.reduceMotion)
    })

    // OS theme changes (only meaningful when theme === 'system')
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onChange = () => {
      const cur = readPrefs()
      if (cur.theme === 'system') apply('system')
    }
    mq?.addEventListener?.('change', onChange)

    return () => {
      offPrefs()
      mq?.removeEventListener?.('change', onChange)
    }
  }, [])

  return null
}
