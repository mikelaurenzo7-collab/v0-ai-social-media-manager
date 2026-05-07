import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from './encryption'
import type { AccountInfo, ProviderId, TokenResponse } from './types'
import { getProvider } from './providers'

export interface DecryptedConnection {
  id: string
  userId: string
  platform: string
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  accountId: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  scopes: string[]
  metadata: Record<string, unknown> | null
}

export async function saveConnection(params: {
  userId: string
  platform: ProviderId
  token: TokenResponse
  account: AccountInfo
}): Promise<void> {
  const { userId, platform, token, account } = params
  const expiresAt = token.expiresIn
    ? new Date(Date.now() + token.expiresIn * 1000)
    : null
  const scopes = token.scope ? token.scope.split(/[\s,]+/).filter(Boolean) : []

  await prisma.socialConnection.upsert({
    where: { userId_platform: { userId, platform } },
    create: {
      userId,
      platform,
      encryptedAccessToken: encrypt(token.accessToken),
      encryptedRefreshToken: token.refreshToken ? encrypt(token.refreshToken) : null,
      expiresAt,
      accountId: account.accountId,
      username: account.username ?? null,
      displayName: account.displayName ?? null,
      email: account.email ?? null,
      avatarUrl: account.avatarUrl ?? null,
      scopes,
      metadata: (account.metadata as never) ?? undefined,
    },
    update: {
      encryptedAccessToken: encrypt(token.accessToken),
      // Some providers don't return a new refresh token on every refresh — keep the old one.
      ...(token.refreshToken
        ? { encryptedRefreshToken: encrypt(token.refreshToken) }
        : {}),
      expiresAt,
      accountId: account.accountId,
      username: account.username ?? null,
      displayName: account.displayName ?? null,
      email: account.email ?? null,
      avatarUrl: account.avatarUrl ?? null,
      scopes,
      metadata: (account.metadata as never) ?? undefined,
    },
  })
}

export async function getConnection(
  userId: string,
  platform: ProviderId,
): Promise<DecryptedConnection | null> {
  const row = await prisma.socialConnection.findUnique({
    where: { userId_platform: { userId, platform } },
  })
  if (!row) return null
  return {
    id: row.id,
    userId: row.userId,
    platform: row.platform,
    accessToken: decrypt(row.encryptedAccessToken),
    refreshToken: row.encryptedRefreshToken ? decrypt(row.encryptedRefreshToken) : null,
    expiresAt: row.expiresAt,
    accountId: row.accountId,
    username: row.username,
    displayName: row.displayName,
    email: row.email,
    avatarUrl: row.avatarUrl,
    scopes: row.scopes,
    metadata: row.metadata as Record<string, unknown> | null,
  }
}

export async function listConnections(userId: string) {
  const rows = await prisma.socialConnection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  // Strip encrypted tokens — never return them to clients.
  return rows.map((r) => {
    const isExpired = r.expiresAt ? r.expiresAt.getTime() < Date.now() : false
    return {
      id: r.id,
      platform: r.platform,
      accountId: r.accountId,
      username: r.username,
      displayName: r.displayName,
      email: r.email,
      avatarUrl: r.avatarUrl,
      scopes: r.scopes,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      isExpired,
      // We can auto-refresh if a refresh token exists; otherwise the user must reconnect.
      needsReauth: isExpired && !r.encryptedRefreshToken,
    }
  })
}

export async function deleteConnection(userId: string, platform: ProviderId) {
  const conn = await getConnection(userId, platform)
  if (!conn) return false

  // Best-effort revocation at the provider.
  try {
    const provider = getProvider(platform)
    if (provider.revokeToken) {
      await provider.revokeToken(conn.accessToken)
    }
  } catch (err) {
    console.error(`[oauth] Failed to revoke ${platform} token:`, err)
  }

  await prisma.socialConnection.delete({
    where: { userId_platform: { userId, platform } },
  })
  return true
}

const REFRESH_BUFFER_MS = 60_000 // refresh 60s before expiry

/**
 * Get a valid (refreshed-if-needed) access token for the given user + platform.
 * Throws if no connection exists or the token cannot be refreshed.
 */
export async function getValidAccessToken(
  userId: string,
  platform: ProviderId,
): Promise<DecryptedConnection> {
  const conn = await getConnection(userId, platform)
  if (!conn) {
    throw new Error(`No ${platform} connection found. Connect your account first.`)
  }

  const isExpiringSoon =
    conn.expiresAt !== null &&
    conn.expiresAt.getTime() - REFRESH_BUFFER_MS < Date.now()

  if (!isExpiringSoon) return conn
  if (!conn.refreshToken) {
    throw new Error(
      `${platform} access token has expired and no refresh token is available. Please reconnect.`,
    )
  }

  const provider = getProvider(platform)
  if (!provider.refreshToken) {
    throw new Error(
      `${platform} does not support token refresh. Please reconnect your account.`,
    )
  }

  const refreshed = await provider.refreshToken(conn.refreshToken)
  const newExpiresAt = refreshed.expiresIn
    ? new Date(Date.now() + refreshed.expiresIn * 1000)
    : null

  await prisma.socialConnection.update({
    where: { userId_platform: { userId, platform } },
    data: {
      encryptedAccessToken: encrypt(refreshed.accessToken),
      ...(refreshed.refreshToken
        ? { encryptedRefreshToken: encrypt(refreshed.refreshToken) }
        : {}),
      expiresAt: newExpiresAt,
    },
  })

  return {
    ...conn,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? conn.refreshToken,
    expiresAt: newExpiresAt,
  }
}
