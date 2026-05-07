/**
 * Per-agent customization stored client-side as a non-authoritative preview.
 *
 * Server-backed, workspace-scoped persistence with RBAC is the next step;
 * until then, the customization travels in the API request body so the model
 * actually receives the user's overrides instead of silently using defaults.
 *
 * Production note: posting authority, scopes, and tool access in
 * agent-permissions.tsx must be ENFORCED on the server — the localStorage
 * values there are user preferences only and cannot be trusted as policy.
 */

export const AGENT_CUSTOMIZATION_VERSION = 1

export const AGENT_CUSTOMIZATION_KEY = (agentId: string) =>
  `postpilot_agent_${agentId}_customization_v${AGENT_CUSTOMIZATION_VERSION}`

export interface AgentCustomization {
  displayName?: string
  avatar?: string
  tagline?: string
  systemPrompt?: string
  voicePreset?: string
  responseStyle?: 'concise' | 'balanced' | 'detailed'
  signOff?: string
  emojiUse?: 'never' | 'rare' | 'often'
}

export function readAgentCustomization(agentId: string): AgentCustomization | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AGENT_CUSTOMIZATION_KEY(agentId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as AgentCustomization
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/**
 * Build a system-prompt suffix from a customization payload. Returns '' when
 * nothing meaningful is set — safe to concat unconditionally.
 */
export function customizationToPromptSuffix(c: AgentCustomization | null | undefined): string {
  if (!c) return ''
  const lines: string[] = []
  const responseStyle =
    c.responseStyle === 'concise'
      ? 'Be very concise. Default to short answers and tight bullet lists.'
      : c.responseStyle === 'detailed'
        ? 'Lean detailed. Show your reasoning and include examples.'
        : null
  if (responseStyle) lines.push(responseStyle)

  const emoji =
    c.emojiUse === 'never'
      ? 'Never use emojis.'
      : c.emojiUse === 'often'
        ? 'Liberal use of emojis when they add personality.'
        : c.emojiUse === 'rare'
          ? 'Use emojis only when they genuinely add personality. Rare, never decorative.'
          : null
  if (emoji) lines.push(emoji)

  if (c.voicePreset && c.voicePreset !== 'brand') {
    lines.push(`Voice preset: ${c.voicePreset}.`)
  }

  if (c.signOff?.trim()) {
    lines.push(`Default sign-off (use only when finishing a multi-paragraph response): ${c.signOff.trim()}`)
  }

  if (lines.length === 0) return ''
  return `\n\nWORKSPACE CUSTOMIZATION:\n- ${lines.join('\n- ')}`
}
