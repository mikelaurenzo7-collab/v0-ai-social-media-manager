import { getValidAccessToken } from '@/lib/oauth/connections'
import type { ProviderId, PublishResult } from '@/lib/oauth/types'
import { prisma } from '@/lib/prisma'

export interface SocialPostPayload {
  text: string
  /** Optional image URLs (publicly accessible). Used by IG/FB/TikTok. */
  mediaUrls?: string[]
}

// ── X / Twitter ───────────────────────────────────────────────────────────────

async function publishToTwitter(
  userId: string,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const conn = await getValidAccessToken(userId, 'twitter')
  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: payload.text }),
  })
  const json = (await res.json()) as { data?: { id: string }; errors?: unknown }
  if (!res.ok || !json.data?.id) {
    return {
      success: false,
      error: `Twitter publish failed: ${JSON.stringify(json.errors ?? json)}`,
    }
  }
  return {
    success: true,
    externalId: json.data.id,
    url: `https://x.com/${conn.username ?? 'i'}/status/${json.data.id}`,
  }
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

async function publishToLinkedIn(
  userId: string,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const conn = await getValidAccessToken(userId, 'linkedin')
  const author = `urn:li:person:${conn.accountId}`

  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: payload.text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    return { success: false, error: `LinkedIn publish failed: ${await res.text()}` }
  }
  const id = res.headers.get('x-restli-id') ?? ''
  return {
    success: true,
    externalId: id,
    url: id ? `https://www.linkedin.com/feed/update/${id}` : undefined,
  }
}

// ── Facebook (Page) ───────────────────────────────────────────────────────────

async function publishToFacebook(
  userId: string,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const conn = await getValidAccessToken(userId, 'facebook')
  const meta = (conn.metadata ?? {}) as {
    primaryPageId?: string
    primaryPageAccessToken?: string
  }
  const pageId = meta.primaryPageId
  const pageToken = meta.primaryPageAccessToken
  if (!pageId || !pageToken) {
    return {
      success: false,
      error:
        'No Facebook Page is linked to this connection. Reconnect Facebook and ensure your account manages at least one Page.',
    }
  }

  const url = `https://graph.facebook.com/v21.0/${pageId}/feed`
  const params = new URLSearchParams({
    message: payload.text,
    access_token: pageToken,
  })
  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' })
  const json = (await res.json()) as { id?: string; error?: { message?: string } }
  if (!res.ok || !json.id) {
    return { success: false, error: `Facebook publish failed: ${json.error?.message ?? 'unknown'}` }
  }
  return {
    success: true,
    externalId: json.id,
    url: `https://www.facebook.com/${json.id}`,
  }
}

// ── Instagram (Business) ──────────────────────────────────────────────────────

async function publishToInstagram(
  userId: string,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const conn = await getValidAccessToken(userId, 'instagram')
  const meta = (conn.metadata ?? {}) as {
    instagramBusinessAccountId?: string
    pageAccessToken?: string
  }
  const igId = meta.instagramBusinessAccountId
  const pageToken = meta.pageAccessToken
  if (!igId || !pageToken) {
    return {
      success: false,
      error:
        'No Instagram Business account linked. Connect a Facebook Page that has an IG Business or Creator account attached.',
    }
  }
  const imageUrl = payload.mediaUrls?.[0]
  if (!imageUrl) {
    return {
      success: false,
      error:
        'Instagram publishing requires at least one image URL. Provide a publicly accessible mediaUrl.',
    }
  }

  // Step 1: create container
  const createParams = new URLSearchParams({
    image_url: imageUrl,
    caption: payload.text,
    access_token: pageToken,
  })
  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media?${createParams.toString()}`,
    { method: 'POST' },
  )
  const createJson = (await createRes.json()) as {
    id?: string
    error?: { message?: string }
  }
  if (!createRes.ok || !createJson.id) {
    return {
      success: false,
      error: `Instagram media create failed: ${createJson.error?.message ?? 'unknown'}`,
    }
  }

  // Step 2: publish container
  const publishParams = new URLSearchParams({
    creation_id: createJson.id,
    access_token: pageToken,
  })
  const pubRes = await fetch(
    `https://graph.facebook.com/v21.0/${igId}/media_publish?${publishParams.toString()}`,
    { method: 'POST' },
  )
  const pubJson = (await pubRes.json()) as {
    id?: string
    error?: { message?: string }
  }
  if (!pubRes.ok || !pubJson.id) {
    return {
      success: false,
      error: `Instagram publish failed: ${pubJson.error?.message ?? 'unknown'}`,
    }
  }
  return { success: true, externalId: pubJson.id }
}

// ── TikTok ────────────────────────────────────────────────────────────────────

async function publishToTikTok(
  userId: string,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const conn = await getValidAccessToken(userId, 'tiktok')
  const videoUrl = payload.mediaUrls?.[0]
  if (!videoUrl) {
    return {
      success: false,
      error:
        'TikTok publishing requires a publicly accessible video URL in mediaUrls[0].',
    }
  }
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: payload.text.slice(0, 150),
        privacy_level: 'SELF_ONLY', // safest default; users can change in Studio
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    }),
  })
  const json = (await res.json()) as {
    data?: { publish_id?: string }
    error?: { message?: string; code?: string }
  }
  if (!res.ok || !json.data?.publish_id) {
    return {
      success: false,
      error: `TikTok publish failed: ${json.error?.message ?? 'unknown'}`,
    }
  }
  return { success: true, externalId: json.data.publish_id }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const HANDLERS: Record<
  Exclude<ProviderId, 'gmail' | 'outlook'>,
  (userId: string, payload: SocialPostPayload) => Promise<PublishResult>
> = {
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  tiktok: publishToTikTok,
}

export async function publishSocialPost(
  userId: string,
  platform: Exclude<ProviderId, 'gmail' | 'outlook'>,
  payload: SocialPostPayload,
): Promise<PublishResult> {
  const handler = HANDLERS[platform]
  if (!handler) {
    return { success: false, error: `Unsupported platform: ${platform}` }
  }
  let result: PublishResult
  try {
    result = await handler(userId, payload)
  } catch (err) {
    result = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown publishing error',
    }
  }

  // Best-effort log to the published_posts table.
  try {
    const conn = await prisma.socialConnection.findUnique({
      where: { userId_platform: { userId, platform } },
    })
    if (conn) {
      await prisma.publishedPost.create({
        data: {
          userId,
          connectionId: conn.id,
          platform,
          externalId: result.externalId ?? null,
          content: payload.text,
          status: result.success ? 'published' : 'failed',
          error: result.success ? null : result.error ?? null,
          metadata: payload.mediaUrls?.length
            ? ({ mediaUrls: payload.mediaUrls } as never)
            : undefined,
        },
      })
    }
  } catch (err) {
    console.error('[publish] failed to record published_post:', err)
  }

  return result
}
