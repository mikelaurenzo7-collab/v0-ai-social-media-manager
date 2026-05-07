import type { OAuthProvider } from '../types'
import { deriveCodeChallenge } from '../pkce'

const AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const REVOKE_URL = 'https://api.twitter.com/2/oauth2/revoke'
const ME_URL = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name'

const SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']

function clientId() {
  const id = process.env.TWITTER_CLIENT_ID
  if (!id) throw new Error('TWITTER_CLIENT_ID is not set')
  return id
}

function clientSecret() {
  // X requires Basic auth with client_id:client_secret for confidential clients.
  return process.env.TWITTER_CLIENT_SECRET || ''
}

function basicAuthHeader() {
  const id = clientId()
  const secret = clientSecret()
  if (!secret) return null
  return `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`
}

export const twitterProvider: OAuthProvider = {
  id: 'twitter',
  name: 'X (Twitter)',
  pkce: true,
  scopes: SCOPES,

  buildAuthUrl({ state, redirectUri, codeVerifier }) {
    if (!codeVerifier) throw new Error('Twitter requires PKCE code_verifier')
    const challenge = deriveCodeChallenge(codeVerifier)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId(),
      redirect_uri: redirectUri,
      scope: SCOPES.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })
    return `${AUTH_URL}?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri, codeVerifier }) {
    if (!codeVerifier) throw new Error('Twitter requires PKCE code_verifier')
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId(),
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    })
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const auth = basicAuthHeader()
    if (auth) headers.Authorization = auth

    const res = await fetch(TOKEN_URL, { method: 'POST', headers, body })
    if (!res.ok) throw new Error(`Twitter token exchange failed: ${await res.text()}`)
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

  async refreshToken(refreshToken) {
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: clientId(),
    })
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const auth = basicAuthHeader()
    if (auth) headers.Authorization = auth

    const res = await fetch(TOKEN_URL, { method: 'POST', headers, body })
    if (!res.ok) throw new Error(`Twitter token refresh failed: ${await res.text()}`)
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
    const res = await fetch(ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Twitter /users/me failed: ${await res.text()}`)
    const json = (await res.json()) as {
      data: { id: string; name: string; username: string; profile_image_url?: string }
    }
    return {
      accountId: json.data.id,
      username: json.data.username,
      displayName: json.data.name,
      avatarUrl: json.data.profile_image_url,
    }
  },

  async revokeToken(accessToken) {
    const body = new URLSearchParams({ token: accessToken, token_type_hint: 'access_token' })
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    const auth = basicAuthHeader()
    if (auth) headers.Authorization = auth
    await fetch(REVOKE_URL, { method: 'POST', headers, body }).catch(() => {})
  },
}
