import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authed-only or noisy surfaces shouldn't be crawled. The dashboard
        // requires a session anyway; the API routes don't render documents.
        disallow: ['/dashboard', '/dashboard/', '/api', '/api/'],
      },
    ],
    sitemap: 'https://postpilot.app/sitemap.xml',
    host: 'https://postpilot.app',
  }
}
