import { auth } from '@/lib/next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl
  const isAuthed = !!req.auth

  // Protect all dashboard routes
  if (pathname.startsWith('/dashboard') && !isAuthed) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authed users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
