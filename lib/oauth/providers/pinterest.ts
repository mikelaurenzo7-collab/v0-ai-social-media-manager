import type { OAuthProvider } from '../types'

const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID!
const PINTEREST_APP_SECRET = process.env.PINTEREST_APP_SECRET || ''
const PINTEREST_REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback/pinterest`

export const pinterestProvider: OAuthProvider = {
  id: 'pinterest',
  name: 'Pinterest',
  pkce: false,
  scopes: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],

  buildAuthUrl({ state, redirectUri }) {
    const params = new URLSearchParams({
      client_id: PINTEREST_APP_ID,
      redirect_uri: redirectUri || PINTEREST_REDIRECT_URI,
      response_type: 'code',
      scope: this.scopes.join(','),
      state,
    })
    return `https://www.pinterest.com/oauth/?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }) {
    const basicAuth = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64')
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || PINTEREST_REDIRECT_URI,
      }),
    })
    const json = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
      scope?: string
      error?: string
    }
    if (!res.ok || !json.access_token) {
      throw new Error(`Pinterest token exchange failed: ${json.error ?? 'unknown'}`)
    }
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in,
      scope: json.scope,
      raw: json as Record<string, unknown>,
    }
  },

  async refreshToken(refreshToken) {
    const basicAuth = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64')
    const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    const json = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
      error?: string
    }
    if (!res.ok || !json.access_token) {
      throw new Error(`Pinterest token refresh failed: ${json.error ?? 'unknown'}`)
    }
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? refreshToken,
      expiresIn: json.expires_in,
      raw: json as Record<string, unknown>,
    }
  },

  async getAccountInfo(accessToken) {
    const res = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const json = (await res.json()) as {
      username?: string
      profile_image?: string
      account_type?: string
    }
    
    // Also fetch boards to get a default board
    const boardsRes = await fetch('https://api.pinterest.com/v5/boards', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const boardsJson = (await boardsRes.json()) as {
      items?: Array<{ id: string; name: string }>
    }
    const defaultBoardId = boardsJson.items?.[0]?.id

    return {
      accountId: json.username ?? '',
      username: json.username,
      avatarUrl: json.profile_image,
      metadata: {
        accountType: json.account_type,
        defaultBoardId,
        boards: boardsJson.items,
      },
    }
  },
}
