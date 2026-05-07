import type { OAuthProvider } from '../types'

const TENANT = process.env.MICROSOFT_TENANT || 'common'
const AUTH_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`
const ME_URL = 'https://graph.microsoft.com/v1.0/me'

const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/Mail.ReadWrite',
  'https://graph.microsoft.com/User.Read',
]

function clientId() {
  const id = process.env.MICROSOFT_CLIENT_ID
  if (!id) throw new Error('MICROSOFT_CLIENT_ID is not set')
  return id
}

function clientSecret() {
  const secret = process.env.MICROSOFT_CLIENT_SECRET
  if (!secret) throw new Error('MICROSOFT_CLIENT_SECRET is not set')
  return secret
}

export const microsoftProvider: OAuthProvider = {
  id: 'outlook',
  name: 'Outlook',
  pkce: false,
  scopes: SCOPES,

  buildAuthUrl({ state, redirectUri }) {
    const params = new URLSearchParams({
      client_id: clientId(),
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: SCOPES.join(' '),
      state,
      prompt: 'select_account',
    })
    return `${AUTH_URL}?${params.toString()}`
  },

  async exchangeCode({ code, redirectUri }) {
    const body = new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: SCOPES.join(' '),
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`Microsoft token exchange failed: ${await res.text()}`)
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
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES.join(' '),
    })
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`Microsoft token refresh failed: ${await res.text()}`)
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
    if (!res.ok) throw new Error(`Microsoft Graph /me failed: ${await res.text()}`)
    const data = (await res.json()) as {
      id: string
      displayName?: string
      mail?: string
      userPrincipalName?: string
    }
    const email = data.mail || data.userPrincipalName
    return {
      accountId: data.id,
      email,
      displayName: data.displayName,
      username: email,
    }
  },
}
