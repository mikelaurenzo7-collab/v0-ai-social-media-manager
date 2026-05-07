// Idempotent migration to create the ScheduledPost table in Neon.
// Run with: npx tsx scripts/migrate-scheduled-post.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating ScheduledPost table if missing...')

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ScheduledPost" (
      "id"           TEXT PRIMARY KEY,
      "userId"       TEXT NOT NULL,
      "platform"     TEXT NOT NULL,
      "text"         TEXT NOT NULL,
      "mediaUrls"    TEXT[] NOT NULL DEFAULT '{}',
      "scheduledAt"  TIMESTAMP(3) NOT NULL,
      "timezone"     TEXT,
      "status"       TEXT NOT NULL DEFAULT 'scheduled',
      "agentId"      TEXT,
      "error"        TEXT,
      "publishedAt"  TIMESTAMP(3),
      "externalId"   TEXT,
      "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScheduledPost_userId_idx" ON "ScheduledPost"("userId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScheduledPost_scheduledAt_idx" ON "ScheduledPost"("scheduledAt");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ScheduledPost_userId_status_idx" ON "ScheduledPost"("userId", "status");`)

  console.log('ScheduledPost table ready.')
}

main()
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
