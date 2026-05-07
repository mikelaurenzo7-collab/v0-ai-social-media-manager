import type { OAuthProvider, ProviderId } from '../types'
import { googleProvider } from './google'
import { microsoftProvider } from './microsoft'
import { twitterProvider } from './twitter'
import { linkedinProvider } from './linkedin'
import { facebookProvider, instagramProvider } from './meta'
import { tiktokProvider } from './tiktok'

const PROVIDERS: Record<ProviderId, OAuthProvider> = {
  twitter: twitterProvider,
  linkedin: linkedinProvider,
  facebook: facebookProvider,
  instagram: instagramProvider,
  tiktok: tiktokProvider,
  gmail: googleProvider,
  outlook: microsoftProvider,
}

export const VALID_PROVIDERS = Object.keys(PROVIDERS) as ProviderId[]

export function getProvider(id: ProviderId): OAuthProvider {
  const provider = PROVIDERS[id]
  if (!provider) throw new Error(`Unknown OAuth provider: ${id}`)
  return provider
}

export function isValidProvider(id: string): id is ProviderId {
  return id in PROVIDERS
}
