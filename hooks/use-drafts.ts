'use client'

import useSWR from 'swr'

interface Draft {
  id: string
  user_id: string
  content: string
  platforms: string[]
  tone: string | null
  content_type: string | null
  hashtags: string[] | null
  cta: string | null
  original_prompt: string | null
  is_scheduled: boolean
  scheduled_at: string | null
  created_at: string
  updated_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  return res.json()
}

export function useDrafts() {
  const { data, error, isLoading, mutate } = useSWR<{ drafts: Draft[] }>('/api/drafts', fetcher)

  const createDraft = async (draft: {
    content: string
    platforms: string[]
    tone?: string
    contentType?: string
    hashtags?: string[]
    cta?: string
    originalPrompt?: string
  }) => {
    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to create draft')
    }
    
    const result = await res.json()
    await mutate()
    return result.draft
  }

  const deleteDraft = async (id: string) => {
    const res = await fetch(`/api/drafts/${id}`, {
      method: 'DELETE',
    })
    
    if (!res.ok) {
      throw new Error('Failed to delete draft')
    }
    
    await mutate()
  }

  const updateDraft = async (id: string, data: Partial<Draft>) => {
    const res = await fetch(`/api/drafts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!res.ok) {
      throw new Error('Failed to update draft')
    }
    
    const result = await res.json()
    await mutate()
    return result.draft
  }

  return {
    drafts: data?.drafts || [],
    isLoading,
    error,
    createDraft,
    deleteDraft,
    updateDraft,
    mutate,
  }
}
