import type { ProviderId } from './types'

/**
 * Build the absolute callback URL for a given provider.
 * Honors APP_URL or NEXTAUTH_URL or VERCEL_URL or the request origin as fallback.
 */
export function getCallbackUrl(provider: ProviderId, origin?: string): string {
  const base =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    origin ||
    'http://localhost:3000'

  return `${base.replace(/\/$/, '')}/api/oauth/${provider}/callback`
}

export function getDashboardUrl(path = '/dashboard/accounts', origin?: string): string {
  const base =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    origin ||
    'http://localhost:3000'

  return `${base.replace(/\/$/, '')}${path}`
}
