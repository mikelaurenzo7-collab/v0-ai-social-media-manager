'use client'

import useSWR from 'swr'

export interface ThreadTweet {
  id?: string
  type: string
  content: string
}

export interface Thread {
  id: string
  userId: string
  title: string
  topic: string | null
  tone: string | null
  tweets: ThreadTweet[]
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load threads')
  return res.json() as Promise<{ threads: Thread[] }>
}

export function useThreads() {
  const { data, error, isLoading, mutate } = useSWR('/api/threads', fetcher, {
    revalidateOnFocus: true,
  })

  async function createThread(input: {
    title: string
    tweets: ThreadTweet[]
    topic?: string | null
    tone?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    const res = await fetch('/api/threads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error ?? 'Failed to create thread')
    }
    const j = (await res.json()) as { thread: Thread }
    await mutate()
    return j.thread
  }

  async function deleteThread(id: string) {
    await mutate(
      async (current) => {
        const res = await fetch(`/api/threads/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error ?? 'Failed to delete thread')
        }
        return { threads: (current?.threads ?? []).filter((t) => t.id !== id) }
      },
      {
        optimisticData: (current) => ({
          threads: (current?.threads ?? []).filter((t) => t.id !== id),
        }),
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      },
    )
  }

  return {
    threads: data?.threads ?? [],
    isLoading,
    error,
    mutate,
    createThread,
    deleteThread,
  }
}
