/**
 * User-side workspace preferences. Non-authoritative, stored client-side.
 * These are the toggles a user can flip without touching their plan or
 * billing — agent-only mode (no Co-Pilot), sound effects, etc.
 *
 * Server-side preferences (per-workspace, audit-logged) replace this when
 * the workspace persistence layer ships; until then, the contract here is
 * the source of truth for the UI.
 */

export const PREFS_KEY = 'postpilot_prefs_v1'

export type Theme = 'system' | 'light' | 'dark'

export interface UserPreferences {
  /**
   * When false, the global AI Co-Pilot drawer is hidden:
   *   - The bottom-right FAB doesn't render
   *   - The ⌘J global hotkey is a no-op
   *   - The ⌘K command palette stops surfacing the "Open AI Co-Pilot"
   *     entry and the per-page Co-Pilot quick actions
   * Lets clients run agent-only — only the agents they purchased,
   * nothing layered on top.
   */
  copilotEnabled: boolean

  /**
   * Sound effects on toast / send / approve. Off by default in case anyone
   * is on a call when their first action lands.
   */
  soundsEnabled: boolean

  /**
   * Reduce motion: disables non-essential transitions for users who prefer
   * less movement. Defaults to whatever prefers-reduced-motion says.
   */
  reduceMotion: boolean

  /**
   * Default agent for ⌘K + Co-Pilot quick draft. Empty string = no
   * preference (router picks based on context).
   */
  defaultAgentId: string

  /**
   * UI theme. 'system' tracks the OS preference; 'light' / 'dark' are
   * explicit overrides. Applied via the `dark` class on <html>.
   */
  theme: Theme
}

export const DEFAULT_PREFS: UserPreferences = {
  copilotEnabled: true,
  soundsEnabled: false,
  reduceMotion: false,
  defaultAgentId: '',
  theme: 'system',
}

export function readPrefs(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return { ...DEFAULT_PREFS, ...parsed }
  } catch {
    return DEFAULT_PREFS
  }
}

export function writePrefs(next: Partial<UserPreferences>) {
  if (typeof window === 'undefined') return
  try {
    const current = readPrefs()
    const merged = { ...current, ...next }
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(merged))
    // Broadcast so other components in the same tab can react (the storage
    // event only fires across tabs).
    window.dispatchEvent(new CustomEvent('prefs:changed'))
  } catch {
    // ignore
  }
}

/** Subscribe a callback to preference changes (cross-tab + same-tab). */
export function subscribePrefs(cb: (prefs: UserPreferences) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => cb(readPrefs())
  window.addEventListener('storage', (e) => {
    if (e.key === PREFS_KEY) handler()
  })
  window.addEventListener('prefs:changed', handler)
  return () => {
    window.removeEventListener('prefs:changed', handler)
  }
}
