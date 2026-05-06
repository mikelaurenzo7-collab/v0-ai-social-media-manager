'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro' | 'team'
  ai_credits: number
  created_at: string
  updated_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401) {
      return { user: null }
    }
    throw new Error('Failed to fetch')
  }
  return res.json()
}

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ user: User | null }>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }
    
    await mutate()
    router.push('/dashboard')
    return data
  }, [mutate, router])

  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed')
    }
    
    await mutate()
    router.push('/dashboard')
    return data
  }, [mutate, router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate({ user: null }, false)
    router.push('/')
  }, [mutate, router])

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    login,
    signup,
    logout,
    mutate,
  }
}
