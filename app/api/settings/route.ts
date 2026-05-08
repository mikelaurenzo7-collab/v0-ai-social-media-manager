import { neon } from '@neondatabase/serverless'
import { getCurrentUserId } from '@/lib/oauth/session'
import { NextResponse } from 'next/server'

async function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  // Create the settings table on first use
  await sql`
    CREATE TABLE IF NOT EXISTS "UserSettings" (
      "userId"                 TEXT PRIMARY KEY,
      "name"                   TEXT,
      "brandVoice"             TEXT,
      "brandKeywords"          JSONB    DEFAULT '[]',
      "defaultTone"            TEXT     DEFAULT 'casual',
      "hashtagStyle"           TEXT     DEFAULT 'minimal',
      "preferredContentTypes"  JSONB    DEFAULT '[]',
      "postingFrequency"       TEXT     DEFAULT '3x_week',
      "emailNotifications"     BOOLEAN  DEFAULT true,
      "weeklyDigest"           BOOLEAN  DEFAULT true,
      "updatedAt"              TIMESTAMP DEFAULT now()
    )
  `
  return sql
}

export async function GET() {
  try {
    const sql = await getDb()
    const userId = await getCurrentUserId()
    const rows = await sql`
      SELECT * FROM "UserSettings" WHERE "userId" = ${userId} LIMIT 1
    `
    if (!rows.length) return NextResponse.json({})
    const row = rows[0]
    return NextResponse.json({
      name:                   row.name,
      brandVoice:             row.brandVoice,
      brandKeywords:          row.brandKeywords ?? [],
      defaultTone:            row.defaultTone ?? 'casual',
      hashtagStyle:           row.hashtagStyle ?? 'minimal',
      preferredContentTypes:  row.preferredContentTypes ?? [],
      postingFrequency:       row.postingFrequency ?? '3x_week',
      emailNotifications:     row.emailNotifications ?? true,
      weeklyDigest:           row.weeklyDigest ?? true,
    })
  } catch (err) {
    console.error('GET /api/settings', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const sql = await getDb()
    const userId = await getCurrentUserId()
    const body = await req.json()

    const {
      name,
      brandVoice,
      brandKeywords,
      defaultTone,
      hashtagStyle,
      preferredContentTypes,
      postingFrequency,
      emailNotifications,
      weeklyDigest,
    } = body

    await sql`
      INSERT INTO "UserSettings" (
        "userId", "name", "brandVoice", "brandKeywords",
        "defaultTone", "hashtagStyle", "preferredContentTypes",
        "postingFrequency", "emailNotifications", "weeklyDigest",
        "updatedAt"
      ) VALUES (
        ${userId},
        ${name ?? null},
        ${brandVoice ?? null},
        ${JSON.stringify(brandKeywords ?? [])}::jsonb,
        ${defaultTone ?? 'casual'},
        ${hashtagStyle ?? 'minimal'},
        ${JSON.stringify(preferredContentTypes ?? [])}::jsonb,
        ${postingFrequency ?? '3x_week'},
        ${emailNotifications ?? true},
        ${weeklyDigest ?? true},
        now()
      )
      ON CONFLICT ("userId") DO UPDATE SET
        "name"                  = EXCLUDED."name",
        "brandVoice"            = EXCLUDED."brandVoice",
        "brandKeywords"         = EXCLUDED."brandKeywords",
        "defaultTone"           = EXCLUDED."defaultTone",
        "hashtagStyle"          = EXCLUDED."hashtagStyle",
        "preferredContentTypes" = EXCLUDED."preferredContentTypes",
        "postingFrequency"      = EXCLUDED."postingFrequency",
        "emailNotifications"    = EXCLUDED."emailNotifications",
        "weeklyDigest"          = EXCLUDED."weeklyDigest",
        "updatedAt"             = now()
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/settings', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
