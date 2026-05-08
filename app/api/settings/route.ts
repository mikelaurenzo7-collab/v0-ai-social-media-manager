import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { getCurrentUserId } from '@/lib/oauth/session'
import { NextResponse } from 'next/server'

const updateSettingsSchema = z.object({
  name:                  z.string().min(1).max(120).nullable().optional(),
  brandVoice:            z.string().max(2000).nullable().optional(),
  brandKeywords:         z.array(z.string().min(1).max(60)).max(50).optional(),
  defaultTone:           z.string().max(40).optional(),
  hashtagStyle:          z.enum(['minimal', 'moderate', 'heavy']).optional(),
  preferredContentTypes: z.array(z.string().min(1).max(40)).max(20).optional(),
  postingFrequency:      z.enum(['daily', '3x_week', '5x_week', 'custom']).optional(),
  emailNotifications:    z.boolean().optional(),
  weeklyDigest:          z.boolean().optional(),
}).strict()

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

const DEFAULT_TONE             = 'casual'
const DEFAULT_HASHTAG_STYLE    = 'minimal'
const DEFAULT_POSTING_FREQ     = '3x_week'
const DEFAULT_EMAIL_NOTIFS     = true
const DEFAULT_WEEKLY_DIGEST    = true

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sql = await getDb()
    const rows = await sql`
      SELECT * FROM "UserSettings" WHERE "userId" = ${userId} LIMIT 1
    `
    if (!rows.length) return NextResponse.json({})
    const row = rows[0]
    return NextResponse.json({
      name:                   row.name,
      brandVoice:             row.brandVoice,
      brandKeywords:          row.brandKeywords ?? [],
      defaultTone:            row.defaultTone ?? DEFAULT_TONE,
      hashtagStyle:           row.hashtagStyle ?? DEFAULT_HASHTAG_STYLE,
      preferredContentTypes:  row.preferredContentTypes ?? [],
      postingFrequency:       row.postingFrequency ?? DEFAULT_POSTING_FREQ,
      emailNotifications:     row.emailNotifications ?? DEFAULT_EMAIL_NOTIFS,
      weeklyDigest:           row.weeklyDigest ?? DEFAULT_WEEKLY_DIGEST,
    })
  } catch (err) {
    console.error('GET /api/settings', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = updateSettingsSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const body = parsed.data
    const sql = await getDb()

    // Two-step partial update so that:
    //   (a) on first save, the row is initialized with column DEFAULTs (only
    //       userId is set explicitly), and
    //   (b) only the fields the client actually sent get overwritten.
    // NULL parameters fall through COALESCE so the existing column value is
    // preserved when a field is omitted from the request body.

    await sql`
      INSERT INTO "UserSettings" ("userId") VALUES (${userId})
      ON CONFLICT ("userId") DO NOTHING
    `

    const has = (key: keyof typeof body) =>
      Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined

    const nameP                  = has('name')                  ? body.name                                       : null
    const brandVoiceP            = has('brandVoice')            ? body.brandVoice                                 : null
    const brandKeywordsP         = has('brandKeywords')         ? JSON.stringify(body.brandKeywords)              : null
    const defaultToneP           = has('defaultTone')           ? body.defaultTone                                : null
    const hashtagStyleP          = has('hashtagStyle')          ? body.hashtagStyle                               : null
    const preferredContentTypesP = has('preferredContentTypes') ? JSON.stringify(body.preferredContentTypes)      : null
    const postingFrequencyP      = has('postingFrequency')      ? body.postingFrequency                           : null
    const emailNotificationsP    = has('emailNotifications')    ? body.emailNotifications                         : null
    const weeklyDigestP          = has('weeklyDigest')          ? body.weeklyDigest                               : null

    await sql`
      UPDATE "UserSettings" SET
        "name"                  = COALESCE(${nameP},                              "name"),
        "brandVoice"            = COALESCE(${brandVoiceP},                        "brandVoice"),
        "brandKeywords"         = COALESCE(${brandKeywordsP}::jsonb,              "brandKeywords"),
        "defaultTone"           = COALESCE(${defaultToneP},                       "defaultTone"),
        "hashtagStyle"          = COALESCE(${hashtagStyleP},                      "hashtagStyle"),
        "preferredContentTypes" = COALESCE(${preferredContentTypesP}::jsonb,      "preferredContentTypes"),
        "postingFrequency"      = COALESCE(${postingFrequencyP},                  "postingFrequency"),
        "emailNotifications"    = COALESCE(${emailNotificationsP},                "emailNotifications"),
        "weeklyDigest"          = COALESCE(${weeklyDigestP},                      "weeklyDigest"),
        "updatedAt"             = now()
      WHERE "userId" = ${userId}
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PATCH /api/settings', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
