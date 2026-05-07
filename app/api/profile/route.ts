import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/oauth/session'
import { getServerProfile, upsertServerProfile, scoreProfileCompleteness } from '@/lib/user-profile-server'
import type { UserProfile, PerAgentDefaults } from '@/lib/user-profile'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ profile: null, completeness: { percent: 0, missing: [], filled: [] } })

    const profile = await getServerProfile(userId)
    const completeness = scoreProfileCompleteness(profile ?? {})
    return NextResponse.json({ profile, completeness })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load profile' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const body = (await req.json()) as Partial<UserProfile> & {
      onboardingComplete?: boolean
      onboardingStep?: number
      voiceLearnedAt?: string | null
      voiceLearnedFrom?: string[]
    }

    // Read existing first so partial updates don't wipe other fields
    const existing = (await getServerProfile(userId)) ?? {}
    const existingPerAgent = (existing as { perAgent?: Record<string, PerAgentDefaults> }).perAgent ?? {}
    const merged: Partial<UserProfile> & { onboardingComplete?: boolean; onboardingStep?: number; voiceLearnedAt?: string | null; voiceLearnedFrom?: string[] } = {
      ...existing,
      ...body,
      perAgent: { ...existingPerAgent, ...(body.perAgent ?? {}) },
    }

    await upsertServerProfile(userId, merged)
    const fresh = await getServerProfile(userId)
    const completeness = scoreProfileCompleteness(fresh ?? {})
    return NextResponse.json({ profile: fresh, completeness })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save profile' },
      { status: 500 },
    )
  }
}
