// ── Server-side user profile ────────────────────────────────────────────────
// Reads/writes the UserProfile table in Neon directly. Used by the chat route
// (so agents always see the latest profile, even on a fresh device) and the
// /api/profile route. Uses raw SQL because the Prisma client hasn't been
// regenerated against the new model yet.

import { prisma } from '@/lib/prisma'
import type { UserProfile, PerAgentDefaults } from '@/lib/user-profile'
import { DEFAULT_USER_PROFILE } from '@/lib/user-profile'

interface UserProfileRow {
  id: string
  userId: string
  mode: string | null
  brandName: string | null
  brandTagline: string | null
  brandWebsite: string | null
  niche: string | null
  primaryGoal: string | null
  goals: string[]
  audience: string | null
  audienceLocation: string | null
  contentPillars: string[]
  brandKeywords: string[]
  voiceDescription: string | null
  doWords: string[]
  dontWords: string[]
  tone: string | null
  emojiUsage: string | null
  postingFrequency: string | null
  timezone: string | null
  hashtagStyle: string | null
  preferredFormats: string[]
  perAgent: Record<string, PerAgentDefaults> | null
  onboardingComplete: boolean
  onboardingStep: number
  voiceLearnedAt: Date | null
  voiceLearnedFrom: string[]
  createdAt: Date
  updatedAt: Date
}

function rowToProfile(row: UserProfileRow): UserProfile & { onboardingComplete: boolean; onboardingStep: number; voiceLearnedAt: string | null; voiceLearnedFrom: string[] } {
  return {
    name: '',
    brandName: row.brandName ?? '',
    website: row.brandWebsite ?? '',
    mode: (row.mode as UserProfile['mode']) ?? DEFAULT_USER_PROFILE.mode,
    goals: (row.goals?.length ? row.goals : DEFAULT_USER_PROFILE.goals) as UserProfile['goals'],
    audience: row.audience ?? '',
    contentPillars: row.contentPillars ?? [],
    brandKeywords: row.brandKeywords ?? [],
    brandVoice: row.voiceDescription ?? '',
    doWords: row.doWords ?? [],
    dontWords: row.dontWords ?? [],
    defaultTone: row.tone ?? DEFAULT_USER_PROFILE.defaultTone,
    postingFrequency: (row.postingFrequency as UserProfile['postingFrequency']) ?? DEFAULT_USER_PROFILE.postingFrequency,
    timezone: row.timezone ?? DEFAULT_USER_PROFILE.timezone,
    hashtagStyle: (row.hashtagStyle as UserProfile['hashtagStyle']) ?? DEFAULT_USER_PROFILE.hashtagStyle,
    preferredContentTypes: row.preferredFormats ?? DEFAULT_USER_PROFILE.preferredContentTypes,
    perAgent: row.perAgent ?? {},
    onboardingComplete: row.onboardingComplete,
    onboardingStep: row.onboardingStep,
    voiceLearnedAt: row.voiceLearnedAt ? row.voiceLearnedAt.toISOString() : null,
    voiceLearnedFrom: row.voiceLearnedFrom ?? [],
  }
}

export async function getServerProfile(userId: string): Promise<(UserProfile & { onboardingComplete: boolean; onboardingStep: number; voiceLearnedAt: string | null; voiceLearnedFrom: string[] }) | null> {
  if (!userId) return null
  const rows = await prisma.$queryRaw<UserProfileRow[]>`
    SELECT * FROM "UserProfile" WHERE "userId" = ${userId} LIMIT 1
  `
  const row = rows[0]
  if (!row) return null
  return rowToProfile(row)
}

export async function upsertServerProfile(userId: string, profile: Partial<UserProfile> & { onboardingComplete?: boolean; onboardingStep?: number; voiceLearnedAt?: string | null; voiceLearnedFrom?: string[] }): Promise<void> {
  if (!userId) throw new Error('userId required')

  const mode = profile.mode ?? null
  const brandName = profile.brandName ?? null
  const brandWebsite = profile.website ?? null
  const goals = profile.goals ?? []
  const audience = profile.audience ?? null
  const contentPillars = profile.contentPillars ?? []
  const brandKeywords = profile.brandKeywords ?? []
  const voiceDescription = profile.brandVoice ?? null
  const doWords = profile.doWords ?? []
  const dontWords = profile.dontWords ?? []
  const tone = profile.defaultTone ?? null
  const postingFrequency = profile.postingFrequency ?? null
  const timezone = profile.timezone ?? null
  const hashtagStyle = profile.hashtagStyle ?? null
  const preferredFormats = profile.preferredContentTypes ?? []
  const perAgent = profile.perAgent ?? {}
  const onboardingComplete = profile.onboardingComplete ?? false
  const onboardingStep = profile.onboardingStep ?? 0
  const voiceLearnedAt = profile.voiceLearnedAt ? new Date(profile.voiceLearnedAt) : null
  const voiceLearnedFrom = profile.voiceLearnedFrom ?? []

  await prisma.$executeRaw`
    INSERT INTO "UserProfile" (
      "id", "userId", "mode", "brandName", "brandWebsite",
      "goals", "audience", "contentPillars", "brandKeywords",
      "voiceDescription", "doWords", "dontWords", "tone",
      "postingFrequency", "timezone", "hashtagStyle", "preferredFormats",
      "perAgent", "onboardingComplete", "onboardingStep",
      "voiceLearnedAt", "voiceLearnedFrom",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text, ${userId}, ${mode}, ${brandName}, ${brandWebsite},
      ${goals}::text[], ${audience}, ${contentPillars}::text[], ${brandKeywords}::text[],
      ${voiceDescription}, ${doWords}::text[], ${dontWords}::text[], ${tone},
      ${postingFrequency}, ${timezone}, ${hashtagStyle}, ${preferredFormats}::text[],
      ${JSON.stringify(perAgent)}::jsonb, ${onboardingComplete}, ${onboardingStep},
      ${voiceLearnedAt}, ${voiceLearnedFrom}::text[],
      NOW(), NOW()
    )
    ON CONFLICT ("userId") DO UPDATE SET
      "mode" = EXCLUDED."mode",
      "brandName" = EXCLUDED."brandName",
      "brandWebsite" = EXCLUDED."brandWebsite",
      "goals" = EXCLUDED."goals",
      "audience" = EXCLUDED."audience",
      "contentPillars" = EXCLUDED."contentPillars",
      "brandKeywords" = EXCLUDED."brandKeywords",
      "voiceDescription" = EXCLUDED."voiceDescription",
      "doWords" = EXCLUDED."doWords",
      "dontWords" = EXCLUDED."dontWords",
      "tone" = EXCLUDED."tone",
      "postingFrequency" = EXCLUDED."postingFrequency",
      "timezone" = EXCLUDED."timezone",
      "hashtagStyle" = EXCLUDED."hashtagStyle",
      "preferredFormats" = EXCLUDED."preferredFormats",
      "perAgent" = EXCLUDED."perAgent",
      "onboardingComplete" = EXCLUDED."onboardingComplete",
      "onboardingStep" = EXCLUDED."onboardingStep",
      "voiceLearnedAt" = EXCLUDED."voiceLearnedAt",
      "voiceLearnedFrom" = EXCLUDED."voiceLearnedFrom",
      "updatedAt" = NOW()
  `
}

// ── Completeness scoring ────────────────────────────────────────────────────
// 8 fields × ~12.5% each. Used in onboarding and the sidebar ring.

export interface ProfileCompleteness {
  percent: number
  missing: string[]
  filled: string[]
}

export function scoreProfileCompleteness(profile: Partial<UserProfile>): ProfileCompleteness {
  const checks: Array<{ key: string; label: string; ok: boolean }> = [
    { key: 'mode', label: 'Mode (business / creator / personal)', ok: !!profile.mode },
    { key: 'brandName', label: 'Brand or name', ok: !!profile.brandName?.trim() || !!profile.name?.trim() },
    { key: 'audience', label: 'Target audience', ok: !!profile.audience?.trim() },
    { key: 'goals', label: 'Goals', ok: (profile.goals?.length ?? 0) > 0 },
    { key: 'contentPillars', label: 'Content pillars', ok: (profile.contentPillars?.length ?? 0) >= 2 },
    { key: 'brandVoice', label: 'Brand voice', ok: !!profile.brandVoice?.trim() },
    { key: 'doWords', label: 'Do / Don\u2019t word lists', ok: (profile.doWords?.length ?? 0) + (profile.dontWords?.length ?? 0) > 0 },
    { key: 'timezone', label: 'Timezone', ok: !!profile.timezone?.trim() },
  ]
  const filled = checks.filter((c) => c.ok).map((c) => c.label)
  const missing = checks.filter((c) => !c.ok).map((c) => c.label)
  const percent = Math.round((filled.length / checks.length) * 100)
  return { percent, missing, filled }
}
