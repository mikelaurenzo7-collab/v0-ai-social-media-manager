import crypto from 'node:crypto'

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** Generate a cryptographically random PKCE code verifier (43-128 chars). */
export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(32))
}

/** Derive the S256 code challenge from a verifier. */
export function deriveCodeChallenge(verifier: string): string {
  return base64UrlEncode(crypto.createHash('sha256').update(verifier).digest())
}

/** Generate a CSRF-safe random state string. */
export function generateState(): string {
  return base64UrlEncode(crypto.randomBytes(24))
}
