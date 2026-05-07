import type { OAuthProvider } from '../types'
import { deriveCodeChallenge } from '../pkce'

const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const REVOKE_URL = 'https://open.tiktokapis.com/v2/oauth/revoke/'
const USERINFO_URL =
  'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username'

const SCOPES = ['user.info.basic', 'user.info.profile', 'video.publish', 'video.upload']

function clientKey() {
  const id = process.env.TIKTOK_CLIENT_KEY
  if (!id) throw new Error('TIKTOK_CLIENT_KEY is not set')
  return id
}

function clientSecret() {
  const secret = process.env.TIKTOK_CLIENT_SECRET
  if (!secret) throw new Error('TIKTOK_CLIENT_SECRET is not set')
  return secret
}

export const tiktokProvider: OAuthProvider = {
  id: 'tiktok',
  name: 'TikTok',
  pkce: true,
  scopes: SCOPES,

  buildAuthUrl({ state, redirectUri, codeVerifier }) {
    if (!codeVerifier) throw new Error('TikTok requires PKCE code_verifier')
    const challenge = deriveCodeChallenge(codeVerifier)
    const params = new URLSearchParams({
      client_key: clientKey(),
      response_type: 'code',
      scope: SCOPES.join(','),
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    return `${AUTH_URL}?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }) {
    if (!codeVerifier) throw new Error('TikTok requires PKCE code_verifier')
    const body = new URLSearchParams({
      client_key: clientKey(),
      client_secret: clientSecret(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body,
    })
    if (!res.ok) throw new Error(`TikTok token exchange failed: ${await res.text()}`)
    const data = (await res.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      refresh_expires_in?: number
      scope?: string
      token_type?: string
      open_id?: string
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type,
      raw: data,
    }
  },

  async refreshToken(refreshToken) {
    const body = new URLSearchParams({
      client_key: clientKey(),
      client_secret: clientSecret(),
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`TikTok refresh failed: ${await res.text()}`)
    const data = (await res.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      scope?: string
      token_type?: string
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type,
      raw: data,
    }
  },

  async getAccountInfo(accessToken) {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`TikTok /user/info failed: ${await res.text()}`)
    const json = (await res.json()) as {
      data?: {
        user?: {
          open_id?: string
          union_id?: string
          avatar_url?: string
          display_name?: string
          username?: string
        }
      }
    }
    const user = json.data?.user
    if (!user?.open_id) throw new Error('TikTok user info missing open_id')
    return {
      accountId: user.open_id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      metadata: { unionId: user.union_id },
    }
  },

  async revokeToken(accessToken) {
    const body = new URLSearchParams({
      client_key: clientKey(),
      client_secret: clientSecret(),
      token: accessToken,
    })
    await fetch(REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).catch(() => {})
  },
}
