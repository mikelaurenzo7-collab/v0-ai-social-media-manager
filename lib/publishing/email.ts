import { google } from 'googleapis'
import { Client as GraphClient } from '@microsoft/microsoft-graph-client'
import 'isomorphic-fetch'
import { getValidAccessToken } from '@/lib/oauth/connections'
import type { PublishResult } from '@/lib/oauth/types'

export interface EmailPayload {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  /** When true, body is treated as HTML; otherwise plain text. */
  html?: boolean
}

function buildRfc822(params: EmailPayload, fromEmail: string): string {
  const { to, cc, bcc, subject, body, html } = params
  const headers = [
    `From: ${fromEmail}`,
    `To: ${to.join(', ')}`,
    cc?.length ? `Cc: ${cc.join(', ')}` : null,
    bcc?.length ? `Bcc: ${bcc.join(', ')}` : null,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${html ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
    'Content-Transfer-Encoding: 7bit',
  ]
    .filter(Boolean)
    .join('\r\n')
  return `${headers}\r\n\r\n${body}`
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendEmailViaGmail(
  userId: string,
  email: EmailPayload,
): Promise<PublishResult> {
  try {
    const conn = await getValidAccessToken(userId, 'gmail')
    const fromEmail = conn.email ?? conn.username ?? 'me'

    const oauth2 = new google.auth.OAuth2()
    oauth2.setCredentials({ access_token: conn.accessToken })
    const gmail = google.gmail({ version: 'v1', auth: oauth2 })

    const raw = base64UrlEncode(buildRfc822(email, fromEmail))
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    })

    return {
      success: true,
      externalId: res.data.id ?? undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error sending Gmail',
    }
  }
}

export async function sendEmailViaOutlook(
  userId: string,
  email: EmailPayload,
): Promise<PublishResult> {
  try {
    const conn = await getValidAccessToken(userId, 'outlook')

    const client = GraphClient.init({
      authProvider: (done) => done(null, conn.accessToken),
      defaultVersion: 'v1.0',
    })

    const message = {
      subject: email.subject,
      body: {
        contentType: email.html ? 'HTML' : 'Text',
        content: email.body,
      },
      toRecipients: email.to.map((addr) => ({ emailAddress: { address: addr } })),
      ccRecipients: email.cc?.map((addr) => ({ emailAddress: { address: addr } })) ?? [],
      bccRecipients: email.bcc?.map((addr) => ({ emailAddress: { address: addr } })) ?? [],
    }

    // /me/sendMail returns 202 Accepted with no body and no message id.
    await client.api('/me/sendMail').post({ message, saveToSentItems: true })

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error sending Outlook email',
    }
  }
}
