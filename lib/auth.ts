import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes hex

const algorithm = 'aes-256-gcm'

export async function encryptToken(token: string): Promise<string> {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export async function decryptToken(encryptedToken: string): Promise<string> {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function getSocialConnection(userId: string, platform: string) {
  return prisma.socialConnection.findUnique({
    where: { userId_platform: { userId, platform } }
  })
}

export async function saveSocialConnection(
  userId: string,
  platform: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date,
  accountId?: string,
  username?: string,
  scopes?: string[]
) {
  const encryptedAccess = await encryptToken(accessToken)
  const encryptedRefresh = refreshToken ? await encryptToken(refreshToken) : null

  return prisma.socialConnection.upsert({
    where: { userId_platform: { userId, platform } },
    update: {
      encryptedAccessToken: encryptedAccess,
      encryptedRefreshToken: encryptedRefresh,
      expiresAt,
      accountId,
      username,
      scopes
    },
    create: {
      userId,
      platform,
      encryptedAccessToken: encryptedAccess,
      encryptedRefreshToken: encryptedRefresh,
      expiresAt,
      accountId,
      username,
      scopes
    }
  })
}
