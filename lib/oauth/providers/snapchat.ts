import type { OAuthProvider } from '../types'

const SNAPCHAT_CLIENT_ID = process.env.SNAPCHAT_CLIENT_ID!
const SNAPCHAT_CLIENT_SECRET = process.env.SNAPCHAT_CLIENT_SECRET!
const SNAPCHAT_REDIRECT_URI = process.env.SNAPCHAT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/callback/snapchat`

export const snapchatProvider: OAuthProvider = {
  id: 'snapchat',
  name: 'Snapchat',
  pkce: true,
  scopes: [
    'snapchat-marketing-api',
    'snapchat-profile-api',
  ],

  buildAuthUrl({ state, redirectUri, codeVerifier }) {
    // Snapchat uses PKCE
    const codeChallenge = codeVerifier
      ? require('crypto').createHash('sha256').update(codeVerifier).digest('base64url')
      : ''
    
    const params = new URLSearchParams({
      client_id: SNAPCHAT_CLIENT_ID,
      redirect_uri: redirectUri || SNAPCHAT_REDIRECT_URI,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    return `https://accounts.snapchat.com/login/oauth2/authorize?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }) {
    const basicAuth = Buffer.from(`${SNAPCHAT_CLIENT_ID}:${SNAPCHAT_CLIENT_SECRET}`).toString('base64')
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || SNAPCHAT_REDIRECT_URI,
    })
    if (codeVerifier) {
      body.set('code_verifier', codeVerifier)
    }

    const res = await fetch('https://accounts.snapchat.com/login/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body,
    })
    const json = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
      scope?: string
      error?: string
      error_description?: string
    }
    if (!res.ok || !json.access_token) {
      throw new Error(`Snapchat token exchange failed: ${json.error_description ?? json.error ?? 'unknown'}`)
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
    const basicAuth = Buffer.from(`${SNAPCHAT_CLIENT_ID}:${SNAPCHAT_CLIENT_SECRET}`).toString('base64')
    const res = await fetch('https://accounts.snapchat.com/login/oauth2/access_token', {
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
      throw new Error(`Snapchat token refresh failed: ${json.error ?? 'unknown'}`)
    }
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token ?? refreshToken,
      expiresIn: json.expires_in,
      raw: json as Record<string, unknown>,
    }
  },

  async getAccountInfo(accessToken) {
    const res = await fetch('https://adsapi.snapchat.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const json = (await res.json()) as {
      me?: {
        id?: string
        display_name?: string
        email?: string
        organization_id?: string
      }
    }
    return {
      accountId: json.me?.id ?? '',
      displayName: json.me?.display_name,
      email: json.me?.email,
      metadata: {
        organizationId: json.me?.organization_id,
      },
    }
  },
}
