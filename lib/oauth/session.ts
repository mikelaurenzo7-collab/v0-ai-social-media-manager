import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'pp_session'
const DEMO_USER_EMAIL = 'demo@postpilot.local'

/**
 * Get the current authenticated user ID.
 *
 * Reads the `pp_session` cookie. If no session exists, returns a stable demo user
 * (auto-created the first time it's needed). Once a real auth provider is wired,
 * replace this with `getServerSession(...)` or your auth library of choice.
 */
export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })
    if (session && session.expires > new Date()) {
      return session.userId
    }
  }

  // Fallback: ensure a stable demo user exists so OAuth flows don't break in dev.
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      name: 'Demo User',
    },
  })
  return user.id
}

/** Optional helper: create a session cookie. Useful when you wire up real auth. */
export async function setSessionCookie(sessionToken: string, expiresAt: Date) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}
