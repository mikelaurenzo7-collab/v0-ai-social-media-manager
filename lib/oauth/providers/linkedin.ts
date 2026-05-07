import type { OAuthProvider } from '../types'

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'

// LinkedIn "Sign In with LinkedIn v2" + posting via /rest/posts (UGC) requires w_member_social.
const SCOPES = ['openid', 'profile', 'email', 'w_member_social']

function clientId() {
  const id = process.env.LINKEDIN_CLIENT_ID
  if (!id) throw new Error('LINKEDIN_CLIENT_ID is not set')
  return id
}

function clientSecret() {
  const secret = process.env.LINKEDIN_CLIENT_SECRET
  if (!secret) throw new Error('LINKEDIN_CLIENT_SECRET is not set')
  return secret
}

export const linkedinProvider: OAuthProvider = {
  id: 'linkedin',
  name: 'LinkedIn',
  pkce: false,
  scopes: SCOPES,

  buildAuthUrl({ state, redirectUri }) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId(),
      redirect_uri: redirectUri,
      state,
      scope: SCOPES.join(' '),
    })
    return `${AUTH_URL}?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId(),
      client_secret: clientSecret(),
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${await res.text()}`)
    const data = (await res.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      refresh_token_expires_in?: number
      scope?: string
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      raw: data,
    }
  },

  async refreshToken(refreshToken) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`LinkedIn refresh failed: ${await res.text()}`)
    const data = (await res.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
      scope?: string
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      raw: data,
    }
  },

  async getAccountInfo(accessToken) {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`LinkedIn /userinfo failed: ${await res.text()}`)
    const data = (await res.json()) as {
      sub: string
      name?: string
      email?: string
      picture?: string
      given_name?: string
      family_name?: string
    }
    return {
      accountId: data.sub,
      displayName: data.name || `${data.given_name ?? ''} ${data.family_name ?? ''}`.trim(),
      email: data.email,
      avatarUrl: data.picture,
      username: data.email,
    }
  },
}
