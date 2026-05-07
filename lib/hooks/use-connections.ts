'use client'

import useSWR from 'swr'

export interface Connection {
  id: string
  platform: string
  accountId: string
  username: string | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  scopes: string[]
  expiresAt: string | null
  createdAt: string
  isExpired: boolean
  needsReauth: boolean
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load connections')
  return res.json() as Promise<{ connections: Connection[] }>
}

export function useConnections() {
  const { data, error, isLoading, mutate } = useSWR('/api/connections', fetcher, {
    revalidateOnFocus: true,
  })

  return {
    connections: data?.connections ?? [],
    isLoading,
    error,
    mutate,
    refresh: mutate,
    getByPlatform: (platform: string) =>
      data?.connections.find((c) => c.platform === platform) ?? null,
  }
}

export async function disconnectPlatform(platform: string) {
  const res = await fetch(`/api/connections/${platform}`, { method: 'DELETE' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to disconnect ${platform}: ${text}`)
  }
  return res.json()
}
