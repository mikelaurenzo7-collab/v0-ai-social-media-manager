import { NextResponse } from 'next/server'
import { getProvider, isValidProvider } from '@/lib/oauth/providers'
import { consumeOAuthState } from '@/lib/oauth/state'
import { saveConnection } from '@/lib/oauth/connections'
import { getCallbackUrl, getDashboardUrl } from '@/lib/oauth/urls'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function redirectToAccounts(req: Request, params: Record<string, string>) {
  const origin = new URL(req.url).origin
  const url = new URL(getDashboardUrl('/dashboard/accounts', origin))
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return NextResponse.redirect(url)
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerParam } = await params
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')
  const oauthErrorDescription = url.searchParams.get('error_description')

  if (oauthError) {
    return redirectToAccounts(req, {
      connection_error: oauthError,
      provider: providerParam,
      detail: oauthErrorDescription ?? '',
    })
  }

  if (!isValidProvider(providerParam)) {
    return redirectToAccounts(req, {
      connection_error: 'invalid_provider',
      provider: providerParam,
    })
  }

  if (!code || !state) {
    return redirectToAccounts(req, {
      connection_error: 'missing_code_or_state',
      provider: providerParam,
    })
  }

  const stored = await consumeOAuthState(state)
  if (!stored || stored.platform !== providerParam) {
    return redirectToAccounts(req, {
      connection_error: 'invalid_state',
      provider: providerParam,
    })
  }

  try {
    const provider = getProvider(providerParam)
    const redirectUri = stored.redirectUri ?? getCallbackUrl(provider.id, url.origin)
    const token = await provider.exchangeCode({
      code,
      redirectUri,
      codeVerifier: stored.codeVerifier ?? undefined,
    })
    const account = await provider.getAccountInfo(token.accessToken)

    await saveConnection({
      userId: stored.userId,
      platform: provider.id,
      token,
      account,
    })

    return redirectToAccounts(req, {
      connected: provider.id,
    })
  } catch (err) {
    console.error(`[oauth] ${providerParam} callback error:`, err)
    return redirectToAccounts(req, {
      connection_error: 'token_exchange_failed',
      provider: providerParam,
      detail: err instanceof Error ? err.message : String(err),
    })
  }
}
