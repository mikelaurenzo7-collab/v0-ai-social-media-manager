import type { OAuthProvider, ProviderId } from '../types'

const FB_AUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth'
const FB_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token'
const FB_LONG_LIVED_URL = 'https://graph.facebook.com/v21.0/oauth/access_token'
const FB_ME_URL = 'https://graph.facebook.com/v21.0/me'
const FB_ACCOUNTS_URL = 'https://graph.facebook.com/v21.0/me/accounts'

function clientId() {
  const id = process.env.META_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID
  if (!id) throw new Error('META_CLIENT_ID is not set')
  return id
}

function clientSecret() {
  const secret = process.env.META_CLIENT_SECRET || process.env.FACEBOOK_CLIENT_SECRET
  if (!secret) throw new Error('META_CLIENT_SECRET is not set')
  return secret
}

const FB_SCOPES = [
  'email',
  'public_profile',
  'pages_show_list',
  'pages_manage_posts',
  'pages_read_engagement',
]

const IG_SCOPES = [
  'email',
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'instagram_content_publish',
  'business_management',
]

function buildProvider(platform: ProviderId, scopes: string[]): OAuthProvider {
  return {
    id: platform,
    name: platform === 'facebook' ? 'Facebook' : 'Instagram',
    pkce: false,
    scopes,

    buildAuthUrl({ state, redirectUri }) {
      const params = new URLSearchParams({
        client_id: clientId(),
        redirect_uri: redirectUri,
        state,
        response_type: 'code',
        scope: scopes.join(','),
      })
      return `${FB_AUTH_URL}?${params.toString()}`
    },

    async exchangeCode({ code, redirectUri }) {
      const params = new URLSearchParams({
        client_id: clientId(),
        client_secret: clientSecret(),
        redirect_uri: redirectUri,
        code,
      })
      const res = await fetch(`${FB_TOKEN_URL}?${params.toString()}`)
      if (!res.ok) throw new Error(`Meta token exchange failed: ${await res.text()}`)
      const data = (await res.json()) as {
        access_token: string
        token_type?: string
        expires_in?: number
      }

      // Exchange short-lived for long-lived (~60 days).
      const llParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: clientId(),
        client_secret: clientSecret(),
        fb_exchange_token: data.access_token,
      })
      const llRes = await fetch(`${FB_LONG_LIVED_URL}?${llParams.toString()}`)
      if (!llRes.ok) {
        // If long-lived fails, return the short-lived token rather than failing the whole flow.
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          tokenType: data.token_type,
          raw: data,
        }
      }
      const ll = (await llRes.json()) as {
        access_token: string
        token_type?: string
        expires_in?: number
      }
      return {
        accessToken: ll.access_token,
        expiresIn: ll.expires_in,
        tokenType: ll.token_type,
        scope: scopes.join(','),
        raw: ll,
      }
    },

    // Meta long-lived tokens cannot be refreshed via OAuth — users re-auth when they expire.
    refreshToken: undefined,

    async getAccountInfo(accessToken) {
      const meParams = new URLSearchParams({
        fields: 'id,name,email,picture',
        access_token: accessToken,
      })
      const meRes = await fetch(`${FB_ME_URL}?${meParams.toString()}`)
      if (!meRes.ok) throw new Error(`Meta /me failed: ${await meRes.text()}`)
      const me = (await meRes.json()) as {
        id: string
        name?: string
        email?: string
        picture?: { data?: { url?: string } }
      }

      // Pull the user's pages — needed for Facebook page publishing AND Instagram business linkage.
      const pagesParams = new URLSearchParams({
        access_token: accessToken,
        fields:
          'id,name,access_token,category,instagram_business_account{id,username,name,profile_picture_url}',
      })
      const pagesRes = await fetch(`${FB_ACCOUNTS_URL}?${pagesParams.toString()}`)
      const pagesJson = pagesRes.ok
        ? ((await pagesRes.json()) as {
            data?: Array<{
              id: string
              name?: string
              access_token?: string
              category?: string
              instagram_business_account?: {
                id: string
                username?: string
                name?: string
                profile_picture_url?: string
              }
            }>
          })
        : { data: [] }

      const pages = pagesJson.data ?? []

      if (platform === 'instagram') {
        // Find the first page that has an IG business account linked.
        const pageWithIG = pages.find((p) => p.instagram_business_account)
        const ig = pageWithIG?.instagram_business_account
        if (!ig || !pageWithIG) {
          throw new Error(
            'No Instagram Business or Creator account linked to your Facebook Pages. Connect one in Meta Business Suite first.',
          )
        }
        return {
          accountId: ig.id,
          username: ig.username ?? ig.name,
          displayName: ig.name ?? ig.username,
          avatarUrl: ig.profile_picture_url,
          email: me.email,
          metadata: {
            pageId: pageWithIG.id,
            pageName: pageWithIG.name,
            pageAccessToken: pageWithIG.access_token,
            instagramBusinessAccountId: ig.id,
          },
        }
      }

      // Facebook: use the first page (most users have one). Production apps should let users pick.
      const primary = pages[0]
      return {
        accountId: primary?.id ?? me.id,
        username: primary?.name ?? me.name,
        displayName: primary?.name ?? me.name,
        email: me.email,
        avatarUrl: me.picture?.data?.url,
        metadata: {
          pages: pages.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            // Page access tokens are required to publish to Pages.
            accessToken: p.access_token,
          })),
          primaryPageId: primary?.id,
          primaryPageAccessToken: primary?.access_token,
          userAccessToken: accessToken,
        },
      }
    },
  }
}

export const facebookProvider = buildProvider('facebook', FB_SCOPES)
export const instagramProvider = buildProvider('instagram', IG_SCOPES)
