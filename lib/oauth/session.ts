import { auth } from '@/lib/next-auth'
import { prisma } from '@/lib/prisma'

const DEMO_USER_EMAIL = 'demo@postpilot.local'

/**
 * Get the current authenticated user ID.
 *
 * Reads the NextAuth JWT session. If no session exists, returns a stable demo
 * user (auto-created on first use) so OAuth flows work in development without
 * requiring sign-in.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth()

  if (session?.user?.id) {
    return session.user.id
  }

  // Fallback: stable demo user for unauthenticated dev flows
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: { email: DEMO_USER_EMAIL, name: 'Demo User' },
  })
  return user.id
}

/**
 * Returns the authenticated user's ID, or null when there is no real session.
 * Use this in API routes that require sign-in — unlike getCurrentUserId() it
 * never falls back to the shared demo user.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
