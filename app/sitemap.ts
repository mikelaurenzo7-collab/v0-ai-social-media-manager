import type { MetadataRoute } from 'next'
import { AUDIENCES } from '@/lib/audiences'
import { COMPETITORS } from '@/lib/competitors'
import { HELP_ARTICLES } from '@/lib/help-articles'

const BASE = 'https://postpilot.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Public marketing surfaces — high-value, follow + index
  const marketing = [
    '',
    '/agents',
    '/about',
    '/roadmap',
    '/changelog',
    '/status',
    '/privacy',
    '/terms',
    '/security',
    '/login',
    '/signup',
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }))

  const audiences = Object.keys(AUDIENCES).map((slug) => ({
    url: `${BASE}/for/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const compares = Object.keys(COMPETITORS).map((slug) => ({
    url: `${BASE}/compare/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const helpArticles = HELP_ARTICLES.map((a) => ({
    url: `${BASE}/dashboard/help/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...marketing, ...audiences, ...compares, ...helpArticles]
}
