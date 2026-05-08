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

const DEFAULTS = {
  name: null as string | null,
  brandVoice: null as string | null,
  brandKeywords: [] as string[],
  defaultTone: 'casual',
  hashtagStyle: 'minimal',
  preferredContentTypes: [] as string[],
  postingFrequency: '3x_week',
  emailNotifications: true,
  weeklyDigest: true,
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
      defaultTone:            row.defaultTone ?? DEFAULTS.defaultTone,
      hashtagStyle:           row.hashtagStyle ?? DEFAULTS.hashtagStyle,
      preferredContentTypes:  row.preferredContentTypes ?? [],
      postingFrequency:       row.postingFrequency ?? DEFAULTS.postingFrequency,
      emailNotifications:     row.emailNotifications ?? DEFAULTS.emailNotifications,
      weeklyDigest:           row.weeklyDigest ?? DEFAULTS.weeklyDigest,
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

    // Load existing row so partial PATCH preserves omitted fields
    const existingRows = await sql`
      SELECT * FROM "UserSettings" WHERE "userId" = ${userId} LIMIT 1
    `
    const existing = existingRows[0] ?? {}

    // pick(): use body field when explicitly present, otherwise existing, otherwise default
    const pick = <K extends keyof typeof DEFAULTS>(key: K): typeof DEFAULTS[K] => {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
        return body[key] as typeof DEFAULTS[K]
      }
      if (Object.prototype.hasOwnProperty.call(existing, key) && existing[key] !== null && existing[key] !== undefined) {
        return existing[key] as typeof DEFAULTS[K]
      }
      return DEFAULTS[key]
    }

    const merged = {
      name:                   pick('name'),
      brandVoice:             pick('brandVoice'),
      brandKeywords:          pick('brandKeywords'),
      defaultTone:            pick('defaultTone'),
      hashtagStyle:           pick('hashtagStyle'),
      preferredContentTypes:  pick('preferredContentTypes'),
      postingFrequency:       pick('postingFrequency'),
      emailNotifications:     pick('emailNotifications'),
      weeklyDigest:           pick('weeklyDigest'),
    }

    await sql`
      INSERT INTO "UserSettings" (
        "userId", "name", "brandVoice", "brandKeywords",
        "defaultTone", "hashtagStyle", "preferredContentTypes",
        "postingFrequency", "emailNotifications", "weeklyDigest",
        "updatedAt"
      ) VALUES (
        ${userId},
        ${merged.name},
        ${merged.brandVoice},
        ${JSON.stringify(merged.brandKeywords)}::jsonb,
        ${merged.defaultTone},
        ${merged.hashtagStyle},
        ${JSON.stringify(merged.preferredContentTypes)}::jsonb,
        ${merged.postingFrequency},
        ${merged.emailNotifications},
        ${merged.weeklyDigest},
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
