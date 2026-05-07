import { prisma } from '@/lib/prisma'
import type { ProviderId } from './types'

const STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function createOAuthState(params: {
  state: string
  userId: string
  platform: ProviderId
  codeVerifier?: string
  redirectUri?: string
}) {
  await prisma.oAuthState.create({
    data: {
      state: params.state,
      userId: params.userId,
      platform: params.platform,
      codeVerifier: params.codeVerifier ?? null,
      redirectUri: params.redirectUri ?? null,
      expiresAt: new Date(Date.now() + STATE_TTL_MS),
    },
  })
}

export async function consumeOAuthState(state: string) {
  const row = await prisma.oAuthState.findUnique({ where: { state } })
  if (!row) return null

  // One-time use: delete immediately.
  await prisma.oAuthState.delete({ where: { state } }).catch(() => {})

  if (row.expiresAt < new Date()) return null
  return row
}

/** Periodically called to garbage-collect expired states. */
export async function cleanupExpiredStates() {
  await prisma.oAuthState.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}
