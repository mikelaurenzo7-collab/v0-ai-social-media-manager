'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'

const PERKS = [
  '25 free generations · all 6 specialist agents',
  'Connect Gmail, Outlook, X, IG, LinkedIn, FB, TikTok',
  'No credit card · upgrade only when you ship daily',
]

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Register
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Registration failed. Please try again.')
      setLoading(false)
      return
    }

    // 2. Sign in immediately after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Account created — please sign in.')
      router.push('/login')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Create your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Six AI agents, eight channels — ready in under a minute.
        </p>
      </div>

      {/* Perks */}
      <ul className="mt-6 grid gap-2 rounded-2xl border border-border/70 bg-card/60 p-4 text-sm text-foreground/85 backdrop-blur">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
              <Check className="h-3 w-3" />
            </span>
            <span className="text-[13px]">{p}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jamie Rivera"
              autoComplete="name"
              className="h-11 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@studio.com"
              autoComplete="email"
              className="h-11 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              className="h-11 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Use 8+ characters with a mix of letters and numbers.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient h-11 w-full rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating workspace…
              </>
            ) : (
              <>
                Create workspace
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          By creating an account you agree to PostPilot&apos;s{' '}
          <Link href="#" className="font-medium text-foreground underline-offset-4 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="font-medium text-foreground underline-offset-4 hover:underline">Privacy</Link>.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{' '}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
