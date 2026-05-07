export type ProviderId =
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'gmail'
  | 'outlook'

export interface AuthUrlParams {
  state: string
  redirectUri: string
  /** PKCE code verifier — only used by providers that require PKCE (X/Twitter, TikTok). */
  codeVerifier?: string
  /** Optional userId for providers that need extra context. */
  userId?: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scope?: string
  tokenType?: string
  /** Raw payload from the provider for debugging / metadata. */
  raw?: Record<string, unknown>
}

export interface AccountInfo {
  accountId: string
  username?: string
  displayName?: string
  email?: string
  avatarUrl?: string
  /** Provider-specific extra data (page IDs, IG business ID, etc.). */
  metadata?: Record<string, unknown>
}

export interface OAuthProvider {
  id: ProviderId
  name: string
  /** Whether this provider needs PKCE. */
  pkce: boolean
  /** OAuth scopes requested. */
  scopes: string[]
  /** Build the authorization URL the user is redirected to. */
  buildAuthUrl: (params: AuthUrlParams) => string
  /** Exchange the auth code for an access token. */
  exchangeCode: (params: {
    code: string
    redirectUri: string
    codeVerifier?: string
  }) => Promise<TokenResponse>
  /** Refresh an access token using a refresh token. */
  refreshToken?: (refreshToken: string) => Promise<TokenResponse>
  /** Fetch the user's account info using a fresh access token. */
  getAccountInfo: (accessToken: string) => Promise<AccountInfo>
  /** Optional: revoke a token at the provider when disconnecting. */
  revokeToken?: (accessToken: string) => Promise<void>
}

export interface PublishResult {
  success: boolean
  externalId?: string
  url?: string
  error?: string
}
