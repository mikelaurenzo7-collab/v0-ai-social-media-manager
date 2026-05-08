import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

/**
 * Middleware uses the Edge-safe authConfig (no Prisma/bcrypt).
 * The `authorized` callback in authConfig handles route protection.
 */
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
