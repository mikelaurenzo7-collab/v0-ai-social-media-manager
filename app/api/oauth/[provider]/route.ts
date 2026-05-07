import { NextResponse } from 'next/server'
import { getProvider, isValidProvider } from '@/lib/oauth/providers'
import { generateCodeVerifier, generateState } from '@/lib/oauth/pkce'
import { createOAuthState } from '@/lib/oauth/state'
import { getCurrentUserId } from '@/lib/oauth/session'
import { getCallbackUrl } from '@/lib/oauth/urls'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerParam } = await params
  if (!isValidProvider(providerParam)) {
    return NextResponse.json({ error: `Unknown provider: ${providerParam}` }, { status: 400 })
  }

  let provider
  try {
    provider = getProvider(providerParam)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Provider unavailable' },
      { status: 500 },
    )
  }

  let userId: string
  try {
    userId = await getCurrentUserId()
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to resolve user session', detail: String(err) },
      { status: 500 },
    )
  }

  const origin = new URL(req.url).origin
  const redirectUri = getCallbackUrl(provider.id, origin)
  const state = generateState()
  const codeVerifier = provider.pkce ? generateCodeVerifier() : undefined

  try {
    await createOAuthState({
      state,
      userId,
      platform: provider.id,
      codeVerifier,
      redirectUri,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create OAuth state', detail: String(err) },
      { status: 500 },
    )
  }

  let authUrl: string
  try {
    authUrl = provider.buildAuthUrl({ state, redirectUri, codeVerifier, userId })
  } catch (err) {
    return NextResponse.json(
      {
        error: `Failed to build ${provider.id} authorization URL`,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }

  return NextResponse.redirect(authUrl)
}
