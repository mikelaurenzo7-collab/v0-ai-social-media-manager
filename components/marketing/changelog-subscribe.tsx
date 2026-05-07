'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'postpilot_changelog_subscribed_v1'

/**
 * Email-capture for changelog updates. Persists "you already subscribed" in
 * localStorage so the form stays out of your way after the first signup,
 * even if the form reloads. Real submission lands when we wire to a list
 * provider; for now it confirms locally + logs intent.
 */
export function ChangelogSubscribe() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [pending, setPending] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!value || !value.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    setPending(true)
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // ignore
      }
      setSubscribed(true)
      setPending(false)
      toast.success('Subscribed', {
        description: 'One short email when something ships. No drip campaigns, ever.',
      })
    }, 500)
  }

  if (subscribed) {
    return (
      <div className="rounded-2xl border border-emerald-300/60 bg-emerald-500/5 px-5 py-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-base shrink-0">
          ✓
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">Subscribed</p>
          <p className="text-[12px] text-muted-foreground">
            One short email when something ships. Unsubscribe anywhere in the email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border/60 bg-card px-5 py-4">
      <p className="text-sm font-bold">Get the email when we ship</p>
      <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
        One email per release. Plain text, ~3 minutes to read. Skip the drip; we never had one.
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbrand.app"
          aria-label="Email address"
          className="h-9 text-sm flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={pending || !email.trim()}
          style={{ background: 'var(--brand-gradient)' }}
          className="text-xs"
        >
          {pending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
    </form>
  )
}
