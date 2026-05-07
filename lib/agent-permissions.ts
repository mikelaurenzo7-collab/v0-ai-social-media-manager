/**
 * Per-agent permission preferences. Mirrors the client UI in
 * components/agents/agent-permissions.tsx.
 *
 * IMPORTANT: today these are user-side preferences only — they're stored in
 * localStorage on the client and forwarded with each chat request so the
 * server can degrade tools accordingly. They are NOT a security boundary.
 *
 * For real enforcement (workspace-scoped, audit-logged, shared across
 * teammates and Auto-Pilot), the server needs its own canonical permission
 * store keyed by (workspaceId, agentId). When that lands, swap the client
 * source for an authenticated fetch in agent-chat.tsx and gate
 * `permissionsAllowChannelPublishing` on that server value here.
 */

export type AgentPostingMode = 'autopublish' | 'approval' | 'draft-only'

export interface AgentPermissionsPayload {
  postingMode?: AgentPostingMode
  scopes?: {
    read?: boolean
    post?: boolean
    reply?: boolean
    dm?: boolean
    delete?: boolean
  }
  approvers?: string[]
  maxPostsPerDay?: number
  maxPostsPerWeek?: number
  quietHours?: { start?: string; end?: string; enabled?: boolean }
  tools?: {
    web?: boolean
    brandKit?: boolean
    analytics?: boolean
    calendar?: boolean
    image?: boolean
  }
  rateLimitedAlerts?: boolean
}

export const AGENT_PERMISSIONS_KEY = (agentId: string) =>
  `agent_${agentId}_permissions_v1`

/**
 * Decide whether the agent's `publish_to_platform` tool should be exposed for
 * this request. Conservative by default: any explicit denial wins.
 */
export function permissionsAllowChannelPublishing(
  perms: AgentPermissionsPayload | null | undefined,
): boolean {
  if (!perms) return true // no preferences set — defer to server-side defaults
  if (perms.postingMode === 'draft-only') return false
  if (perms.postingMode === 'approval') return false // require approval flow before publishing
  if (perms.scopes?.post === false) return false
  return true
}

/**
 * A short human-readable note appended to the system prompt so the model is
 * aware of the active posture even if a tool is still exposed (e.g. for
 * analyses that don't publish).
 */
export function permissionsToSystemNote(
  perms: AgentPermissionsPayload | null | undefined,
): string {
  if (!perms) return ''
  const lines: string[] = []
  if (perms.postingMode === 'draft-only') {
    lines.push('Posting authority: DRAFT ONLY. Do not call publish_to_platform under any circumstance.')
  } else if (perms.postingMode === 'approval') {
    lines.push('Posting authority: APPROVAL REQUIRED. Always offer the draft and ask the user to confirm before any publish step.')
  }
  if (perms.scopes?.post === false) {
    lines.push('Channel scope post=false. Do not publish.')
  }
  if (perms.scopes?.dm === false) {
    lines.push('Channel scope dm=false. Do not initiate or send DMs.')
  }
  if (perms.scopes?.delete === false) {
    lines.push('Channel scope delete=false. Do not delete content.')
  }
  if (lines.length === 0) return ''
  return `\n\nWORKSPACE PERMISSIONS:\n- ${lines.join('\n- ')}`
}
