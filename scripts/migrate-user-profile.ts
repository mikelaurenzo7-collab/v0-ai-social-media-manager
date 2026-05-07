/**
 * One-shot migration: create the UserProfile table.
 * Idempotent — safe to run multiple times.
 *
 * Run via:
 *   node --env-file-if-exists=/vercel/share/.env.project \
 *        --import tsx scripts/migrate-user-profile.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[migrate] Creating UserProfile table if not exists...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserProfile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "mode" TEXT,
      "brandName" TEXT,
      "brandTagline" TEXT,
      "brandWebsite" TEXT,
      "niche" TEXT,
      "primaryGoal" TEXT,
      "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "audience" TEXT,
      "audienceLocation" TEXT,
      "contentPillars" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "brandKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "voiceDescription" TEXT,
      "doWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "dontWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "tone" TEXT,
      "emojiUsage" TEXT,
      "postingFrequency" TEXT,
      "timezone" TEXT,
      "hashtagStyle" TEXT,
      "preferredFormats" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "perAgent" JSONB,
      "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
      "onboardingStep" INTEGER NOT NULL DEFAULT 0,
      "voiceLearnedAt" TIMESTAMP(3),
      "voiceLearnedFrom" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UserProfile_userId_idx" ON "UserProfile"("userId")`)
  console.log('[migrate] UserProfile table ready.')
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('[migrate] failed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
