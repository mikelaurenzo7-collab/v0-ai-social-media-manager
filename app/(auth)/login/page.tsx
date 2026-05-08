'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="text-center">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your <span className="font-medium text-foreground">PostPilot</span> workspace.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-foreground/70 hover:text-foreground transition-colors">
                Forgot it?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="btn-gradient h-11 w-full rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Create your workspace
        </Link>
      </p>
    </div>
  )
}
