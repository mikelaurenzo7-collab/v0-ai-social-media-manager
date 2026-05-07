'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { ConnectionCard, type PlatformDef } from '@/components/accounts/connection-card'
import { useConnections } from '@/lib/hooks/use-connections'
import { Card, CardContent } from '@/components/ui/card'

const SOCIAL_PLATFORMS: PlatformDef[] = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Reach your followers with threads, hot takes, and real-time conversations.',
    bg: '#000000',
    features: ['Tweet publishing', 'Thread support', 'Image attachments'],
    category: 'social',
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Build professional authority with thought leadership and B2B content.',
    bg: '#0A66C2',
    features: ['Post publishing', 'Professional tone tools', 'B2B insights'],
    category: 'social',
    available: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Reach your community on Facebook Pages with stories, photos, and links.',
    bg: '#1877F2',
    features: ['Page publishing', 'Photo posts', 'Link previews'],
    category: 'social',
    available: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share posts and Reels to grow your visual brand on Instagram Business.',
    bg: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    features: ['Feed posts', 'Reels publishing', 'Caption optimization'],
    category: 'social',
    available: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Publish short-form video content optimized for the For You Page.',
    bg: '#000000',
    features: ['Video upload', 'Caption + hashtags', 'TikTok Content Posting API'],
    category: 'social',
    available: true,
  },
]

const EMAIL_PLATFORMS: PlatformDef[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send personalized outreach and follow-ups directly from your Gmail account.',
    bg: '#EA4335',
    features: ['Send via Gmail API', 'Drafts in your Sent folder', 'Gina, the Gmail agent'],
    category: 'email',
    available: true,
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Send executive-grade business emails through Microsoft 365 / Outlook.',
    bg: '#0078D4',
    features: ['Microsoft Graph API', 'Calendar-aware drafts', 'Oliver, the Outlook agent'],
    category: 'email',
    available: true,
  },
]

function CallbackBanner() {
  const params = useSearchParams()
  const router = useRouter()
  const success = params.get('connected')
  const error = params.get('error')

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => router.replace('/dashboard/accounts'), 6000)
      return () => clearTimeout(t)
    }
  }, [success, error, router])

  if (!success && !error) return null

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          <span className="font-semibold capitalize">{success}</span> connected successfully. Your AI agents can now publish on your behalf.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/20">
        <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
      <p className="text-sm text-destructive">
        Connection failed: <span className="font-semibold">{error}</span>. Please try again.
      </p>
    </div>
  )
}

function PlatformGrid({
  title,
  description,
  platforms,
  connectionsByPlatform,
  onChanged,
}: {
  title: string
  description: string
  platforms: PlatformDef[]
  connectionsByPlatform: Record<string, any>
  onChanged: () => void
}) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <ConnectionCard
            key={p.id}
            platform={p}
            connection={connectionsByPlatform[p.id] ?? null}
            onChanged={onChanged}
          />
        ))}
      </div>
    </div>
  )
}

export default function AccountsPage() {
  const { connections, isLoading, mutate } = useConnections()

  const connectionsByPlatform: Record<string, any> = {}
  for (const c of connections) connectionsByPlatform[c.platform] = c

  const totalConnected = connections.filter((c) => !c.needsReauth).length
  const totalAvailable = SOCIAL_PLATFORMS.length + EMAIL_PLATFORMS.length

  return (
    <div className="flex flex-col">
      <Header
        title="Connected Accounts"
        description="Connect your social and email accounts so your AI agents can publish and send on your behalf."
      />

      <div className="p-6 space-y-7">
        <Suspense fallback={null}>
          <CallbackBanner />
        </Suspense>

        {/* Hero status banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-6 py-5">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at top right, oklch(0.652 0.214 36 / 0.12), transparent 55%)',
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-base">Connect once, post everywhere</h3>
              <p className="mt-0.5 text-sm text-muted-foreground max-w-xl">
                Tokens are encrypted with AES-256-GCM at rest and refreshed automatically. We never store your password.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2 shrink-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Connected</p>
              <p className="text-lg font-black text-foreground">
                {isLoading ? '—' : `${totalConnected} / ${totalAvailable}`}
              </p>
            </div>
          </div>
        </div>

        <PlatformGrid
          title="Social Platforms"
          description="Publish posts directly from PostPilot to your social accounts."
          platforms={SOCIAL_PLATFORMS}
          connectionsByPlatform={connectionsByPlatform}
          onChanged={mutate}
        />

        <PlatformGrid
          title="Email Channels"
          description="Let Gina (Gmail) and Oliver (Outlook) draft and send emails on your behalf."
          platforms={EMAIL_PLATFORMS}
          connectionsByPlatform={connectionsByPlatform}
          onChanged={mutate}
        />

        {/* Setup instructions */}
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-foreground">How connecting works</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Click connect',
                  desc: 'You\u2019ll be redirected to the platform\u2019s official sign-in page.',
                },
                {
                  step: '2',
                  title: 'Approve scopes',
                  desc: 'Grant only the permissions PostPilot needs \u2014 publish, send, read profile.',
                },
                {
                  step: '3',
                  title: 'Start publishing',
                  desc: 'Your agents can now post and send on your behalf, with you in full control.',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    {item.step}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
