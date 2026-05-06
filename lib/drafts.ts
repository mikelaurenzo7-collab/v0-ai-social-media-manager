import { sql, Draft } from './db'

// Create a new draft
export async function createDraft(data: {
  userId: string
  content: string
  platforms: string[]
  tone?: string
  contentType?: string
  hashtags?: string[]
  cta?: string
  originalPrompt?: string
}): Promise<Draft> {
  const result = await sql`
    INSERT INTO drafts (user_id, content, platforms, tone, content_type, hashtags, cta, original_prompt)
    VALUES (
      ${data.userId}, 
      ${data.content}, 
      ${data.platforms}, 
      ${data.tone || null}, 
      ${data.contentType || null},
      ${data.hashtags || null},
      ${data.cta || null},
      ${data.originalPrompt || null}
    )
    RETURNING *
  `
  return result[0] as Draft
}

// Get all drafts for a user
export async function getDrafts(userId: string): Promise<Draft[]> {
  const result = await sql`
    SELECT * FROM drafts 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
  return result as Draft[]
}

// Get a single draft
export async function getDraft(id: string, userId: string): Promise<Draft | null> {
  const result = await sql`
    SELECT * FROM drafts 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result[0] as Draft || null
}

// Update a draft
export async function updateDraft(
  id: string, 
  userId: string, 
  data: Partial<Pick<Draft, 'content' | 'platforms' | 'tone' | 'content_type' | 'hashtags' | 'cta' | 'is_scheduled' | 'scheduled_at'>>
): Promise<Draft | null> {
  const result = await sql`
    UPDATE drafts 
    SET 
      content = COALESCE(${data.content ?? null}, content),
      platforms = COALESCE(${data.platforms ?? null}, platforms),
      tone = COALESCE(${data.tone ?? null}, tone),
      content_type = COALESCE(${data.content_type ?? null}, content_type),
      hashtags = COALESCE(${data.hashtags ?? null}, hashtags),
      cta = COALESCE(${data.cta ?? null}, cta),
      is_scheduled = COALESCE(${data.is_scheduled ?? null}, is_scheduled),
      scheduled_at = COALESCE(${data.scheduled_at?.toISOString() ?? null}, scheduled_at),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return result[0] as Draft || null
}

// Delete a draft
export async function deleteDraft(id: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM drafts 
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `
  return result.length > 0
}

// Get draft count for a user
export async function getDraftCount(userId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM drafts WHERE user_id = ${userId}
  `
  return parseInt(result[0]?.count || '0', 10)
}

// Get scheduled drafts
export async function getScheduledDrafts(userId: string): Promise<Draft[]> {
  const result = await sql`
    SELECT * FROM drafts 
    WHERE user_id = ${userId} AND is_scheduled = true AND scheduled_at > NOW()
    ORDER BY scheduled_at ASC
  `
  return result as Draft[]
}
