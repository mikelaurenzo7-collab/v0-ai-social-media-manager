/**
 * Workspace Brand Kit — a shared, schema-versioned shape used by:
 *   - app/dashboard/brand/page.tsx (the editor)
 *   - components/agents/agent-chat.tsx (read on client, sent to /api/chat)
 *   - components/create/create-content.tsx (read on client, sent to /api/generate)
 *   - app/api/chat/route.ts          (server-side, prepends to system prompt)
 *   - app/api/generate/route.ts      (server-side, prepends to system prompt)
 *
 * Persisted to localStorage today (key: BRAND_KIT_KEY). Production should swap
 * this for a server-backed read keyed by workspace, but the contract stays the
 * same so the surface above doesn't move.
 */

import { z } from 'zod'

export const BRAND_KIT_KEY = 'postpilot_brand_kit_v1'

export const voiceDimensionSchema = z.object({
  id: z.string(),
  left: z.string(),
  right: z.string(),
  value: z.number(),
})

export const brandKitSchema = z.object({
  voiceDimensions: z.array(voiceDimensionSchema).optional(),
  voiceSamples: z.string().optional(),
  audience: z.string().optional(),
})

export type VoiceDimension = z.infer<typeof voiceDimensionSchema>

export interface BrandKit {
  voiceDimensions: VoiceDimension[]
  voiceSamples: string
  audience: string
}

export const DEFAULT_VOICE_DIMENSIONS: VoiceDimension[] = [
  { id: 'formality', left: 'Casual', right: 'Formal', value: 35 },
  { id: 'energy', left: 'Calm', right: 'Energetic', value: 70 },
  { id: 'confidence', left: 'Humble', right: 'Bold', value: 65 },
  { id: 'humor', left: 'Serious', right: 'Witty', value: 50 },
  { id: 'tech', left: 'Plain', right: 'Technical', value: 45 },
]

/** Read the brand kit from client-side storage. Returns null if unset or corrupt. */
export function readBrandKit(): BrandKit | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BRAND_KIT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BrandKit>
    if (!parsed) return null
    return {
      voiceDimensions: Array.isArray(parsed.voiceDimensions)
        ? parsed.voiceDimensions.filter(
            (d): d is VoiceDimension =>
              !!d &&
              typeof d.id === 'string' &&
              typeof d.left === 'string' &&
              typeof d.right === 'string' &&
              typeof d.value === 'number',
          )
        : DEFAULT_VOICE_DIMENSIONS,
      voiceSamples: typeof parsed.voiceSamples === 'string' ? parsed.voiceSamples : '',
      audience: typeof parsed.audience === 'string' ? parsed.audience : '',
    }
  } catch {
    return null
  }
}

/**
 * Format a brand kit into a system-prompt prefix the model can actually act on.
 * Safe to call with a null/missing kit — returns an empty string in that case.
 */
export function brandKitToSystemPrefix(kit: BrandKit | null | undefined): string {
  if (!kit) return ''
  const lines: string[] = []
  const audience = kit.audience?.trim()
  if (audience) lines.push(`AUDIENCE: ${audience}`)
  const samples = kit.voiceSamples?.trim()
  if (samples) {
    lines.push(`VOICE SAMPLE (mirror this rhythm, vocabulary, and tone):\n"""\n${samples}\n"""`)
  }
  if (kit.voiceDimensions?.length) {
    const dims = kit.voiceDimensions
      .map((d) => `${d.left}↔${d.right}: ${d.value}/100`)
      .join(' · ')
    if (dims) lines.push(`VOICE FINGERPRINT: ${dims}`)
  }
  if (lines.length === 0) return ''
  return `\n\nWORKSPACE BRAND KIT:\n${lines.join('\n')}\n— Match this voice. Brand-Kit do/don't rules cannot be bypassed.`
}

/** Helper for pages that want to send the kit through an API body. */
export function brandKitForApi(): BrandKit | undefined {
  const kit = readBrandKit()
  return kit ?? undefined
}
