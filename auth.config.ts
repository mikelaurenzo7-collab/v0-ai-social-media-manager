import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe auth config — no Node.js-only imports (no Prisma, no bcrypt).
 * Used by middleware which runs in the Edge runtime.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isAuthPage =
        nextUrl.pathname === '/login' || nextUrl.pathname === '/signup'

      if (isDashboard && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return Response.redirect(loginUrl)
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
}
