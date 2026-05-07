'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const REFERRAL_CODE = 'demi-launchweek'
const REFERRAL_URL = `https://postpilot.app/?via=${REFERRAL_CODE}`

interface Tier {
  id: 'starter' | 'momentum' | 'champion' | 'icon'
  label: string
  threshold: number
  reward: string
  emoji: string
}

const TIERS: Tier[] = [
  { id: 'starter',  label: 'Starter',  threshold: 1,  reward: '1 month of Pro free',          emoji: '🚀' },
  { id: 'momentum', label: 'Momentum', threshold: 5,  reward: '3 months of Pro + custom URL', emoji: '🔥' },
  { id: 'champion', label: 'Champion', threshold: 15, reward: '1 year of Pro + early access', emoji: '🏆' },
  { id: 'icon',     label: 'Icon',     threshold: 50, reward: 'Lifetime Pro + a coffee on us', emoji: '✨' },
]

interface Referral {
  id: string
  who: string
  status: 'invited' | 'signed-up' | 'upgraded'
  at: string
  earned: string
}

const REFERRALS: Referral[] = [
  { id: 'r1', who: 'maya@ratio.so',         status: 'upgraded',  at: '2 days ago',  earned: '$29 credit' },
  { id: 'r2', who: 'jordan@halewise.io',    status: 'upgraded',  at: '5 days ago',  earned: '$29 credit' },
  { id: 'r3', who: 'theo@studiotheo.co',    status: 'signed-up', at: '1 week ago',  earned: 'Pending' },
  { id: 'r4', who: 'priya@brightlabs.io',   status: 'invited',   at: '1 week ago',  earned: 'Awaiting signup' },
  { id: 'r5', who: 'olivia@partnerco.com',  status: 'invited',   at: '1 week ago',  earned: 'Awaiting signup' },
]

const STATUS_META: Record<Referral['status'], { label: string; cls: string }> = {
  invited:    { label: 'Invited',     cls: 'bg-muted text-muted-foreground border-border/60' },
  'signed-up': { label: 'Signed up',  cls: 'bg-sky-500/10 text-sky-700 border-sky-200' },
  upgraded:   { label: 'Upgraded',    cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
}

export default function ReferralsPage() {
  const [emailDraft, setEmailDraft] = useState('')
  const [pending, setPending] = useState<Referral[]>([])

  const total = pending.length + REFERRALS.length
  const upgraded = REFERRALS.filter((r) => r.status === 'upgraded').length + pending.filter((r) => r.status === 'upgraded').length
  const credit = upgraded * 29

  const currentTier = useMemo(() => {
    let t = TIERS[0]
    for (const tier of TIERS) {
      if (upgraded >= tier.threshold) t = tier
    }
    return t
  }, [upgraded])

  const nextTier = useMemo(() => {
    return TIERS.find((tier) => tier.threshold > upgraded) ?? null
  }, [upgraded])

  function copy(value: string, label: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
        .then(() => toast.success(`${label} copied`))
        .catch(() => toast.error('Could not copy'))
    }
  }

  function sendInvite() {
    const email = emailDraft.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    setPending((prev) => [
      { id: `r-${Date.now()}`, who: email, status: 'invited', at: 'just now', earned: 'Awaiting signup' },
      ...prev,
    ])
    setEmailDraft('')
    toast.success(`Invite sent to ${email}`)
  }

  const allReferrals = [...pending, ...REFERRALS]

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Refer a friend"
        description="Both of you win. They get a month of Pro free. You get $29 credit per upgrade — and tier rewards as you climb."
        action={
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
            {currentTier.emoji} {currentTier.label} tier
          </Badge>
        }
      />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Friends invited" value={total} />
          <StatCard label="Signed up" value={REFERRALS.filter((r) => r.status !== 'invited').length + pending.filter((r) => r.status !== 'invited').length} />
          <StatCard label="Upgraded" value={upgraded} accent />
          <StatCard label="Credit earned" value={`$${credit}`} suffix="applied to next invoice" />
        </div>

        {/* Tier progress */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base">Your tier</CardTitle>
                <CardDescription>
                  Every upgrade counts toward your next reward. Credits stack on top of tier rewards.
                </CardDescription>
              </div>
              {nextTier && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {nextTier.threshold - upgraded} more to {nextTier.label} {nextTier.emoji}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-4">
              {TIERS.map((t) => {
                const reached = upgraded >= t.threshold
                const isCurrent = currentTier.id === t.id
                return (
                  <div
                    key={t.id}
                    className={cn(
                      'rounded-2xl border p-4 transition-all',
                      isCurrent
                        ? 'border-orange-500 bg-orange-500/5 shadow-brand'
                        : reached
                          ? 'border-emerald-300 bg-emerald-500/5'
                          : 'border-border/60 bg-card',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{t.emoji}</span>
                      {reached && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 border-emerald-200">
                          Reached
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t.threshold} upgrade{t.threshold === 1 ? '' : 's'}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed">{t.reward}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Share row */}
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your referral link</CardTitle>
              <CardDescription>Drop it anywhere. Friends who sign up via this link get 1 month of Pro free.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={REFERRAL_URL}
                  aria-label="Referral URL"
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  className="text-xs shrink-0"
                  style={{ background: 'var(--brand-gradient)' }}
                  onClick={() => copy(REFERRAL_URL, 'Link')}
                >
                  Copy link
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ShareButton
                  label="X"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    'Six AI agents — one per channel — that draft, design, and publish in your voice. The one I\'ve actually kept using.',
                  )}&url=${encodeURIComponent(REFERRAL_URL)}`}
                />
                <ShareButton
                  label="LinkedIn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(REFERRAL_URL)}`}
                />
                <ShareButton
                  label="Email"
                  href={`mailto:?subject=${encodeURIComponent('Worth a look')}&body=${encodeURIComponent(
                    `Hey — been using PostPilot. Six AI agents, one per channel. They actually sound like me.\n\nIf you want a month free, my link: ${REFERRAL_URL}`,
                  )}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => copy(REFERRAL_CODE, 'Code')}
                >
                  Copy code: <span className="font-mono ml-1">{REFERRAL_CODE}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send an invite</CardTitle>
              <CardDescription>One at a time, with your link pre-filled.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  placeholder="friend@theirbrand.com"
                  aria-label="Friend email"
                  onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                />
                <Button
                  className="w-full text-xs"
                  onClick={sendInvite}
                  disabled={!emailDraft.trim()}
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  Send invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your referrals</CardTitle>
            <CardDescription>Every invite, where they are in the funnel, and what you earned.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {allReferrals.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No referrals yet. Share your link and the first row lands here.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Friend</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">When</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">You earned</th>
                  </tr>
                </thead>
                <tbody>
                  {allReferrals.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? '' : 'bg-muted/15'}>
                      <td className="px-5 py-3 font-mono text-[12px]">{r.who}</td>
                      <td className="px-5 py-3">
                        <Badge className={cn('text-[10px] px-1.5 py-0 border', STATUS_META[r.status].cls)}>
                          {STATUS_META[r.status].label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-[12px]">{r.at}</td>
                      <td className="px-5 py-3 text-right text-[12px] font-semibold">{r.earned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { n: '1', title: 'Share your link', body: 'Tweet, post, email, DM. Anywhere people who\'d want this can see it.' },
                { n: '2', title: 'They get a month free', body: 'Anyone who signs up via your link starts on Pro for 30 days, no card on file required.' },
                { n: '3', title: 'You get $29 + tier rewards', body: 'When they upgrade to a paid plan, $29 lands as workspace credit and counts toward your next tier.' },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-4">
                  <div
                    className="bg-brand text-white h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black mb-3"
                  >
                    {s.n}
                  </div>
                  <p className="text-sm font-bold">{s.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Credits stack on top of tier rewards. No cap on how many friends you can refer.{' '}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Full terms →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix, accent }: { label: string; value: string | number; suffix?: string; accent?: boolean }) {
  return (
    <Card className={cn(accent && 'border-orange-300 bg-orange-500/5')}>
      <CardContent className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
        {suffix && <p className="mt-0.5 text-[10px] text-muted-foreground">{suffix}</p>}
      </CardContent>
    </Card>
  )
}

function ShareButton({ label, href }: { label: string; href: string }) {
  return (
    <Button asChild variant="outline" size="sm" className="text-xs">
      <a href={href} target="_blank" rel="noopener noreferrer">
        Share on {label}
      </a>
    </Button>
  )
}
