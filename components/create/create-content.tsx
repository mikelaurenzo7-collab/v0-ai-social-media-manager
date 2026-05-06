'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { experimental_useObject } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/dashboard/header'
import { PlatformSelector } from '@/components/create/platform-selector'
import { VariationCards } from '@/components/create/variation-cards'
import { PlatformPreview } from '@/components/create/platform-preview'
import { AIAssistant } from '@/components/create/ai-assistant'
import { ImproveDialog } from '@/components/create/improve-dialog'
import { ThreadView } from '@/components/create/thread-view'
import { contentVariationSchema, type ContentVariation } from '@/lib/schemas/content'
import { threadSchema, type Thread, type ThreadTweet } from '@/lib/schemas/thread'
import { TONES, CONTENT_TYPES, THREAD_TWEET_COUNTS, type PlatformId, type ToneId, type ContentTypeId, type ThreadTweetCount } from '@/lib/constants/platforms'
import { toast } from 'sonner'

export function CreateContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  // Mode: 'post' or 'thread'
  const [mode, setMode] = useState<'post' | 'thread'>('post')

  // Thread state
  const [threadTweetCount, setThreadTweetCount] = useState<ThreadTweetCount>(7)
  const [threadTone, setThreadTone] = useState('educational and engaging')

  // Form state
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState<ToneId>('casual')
  const [contentType, setContentType] = useState<ContentTypeId>('promotional')
  const [platforms, setPlatforms] = useState<PlatformId[]>(['twitter', 'instagram'])

  // Pre-fill if editing
  useEffect(() => {
    if (editId) {
      const stored = localStorage.getItem('postpilot_drafts')
      if (stored) {
        const drafts = JSON.parse(stored)
        const draft = drafts.find((d: any) => d.id === editId)
        if (draft) {
          setPrompt(draft.content)
          setTone(draft.tone)
          setContentType(draft.contentType)
          setPlatforms(draft.platforms)
          setMode('post')
        }
      }
    }
  }, [editId])

  // Selection + clipboard state
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)

  // Streaming object generation via Claude
  const { object, submit, isLoading: isGenerating, stop } = experimental_useObject({
    api: '/api/generate',
    schema: contentVariationSchema,
    onFinish: (event) => {
      if (event.object?.variations?.length) {
        setSelectedVariationId(event.object.variations[0].id ?? null)
        toast.success('Content generated successfully!')
      }
    },
    onError: () => {
      toast.error('Failed to generate content. Please try again.')
    },
  })

  // Thread generation
  const { object: threadObject, submit: submitThread, isLoading: isGeneratingThread, stop: stopThread } = experimental_useObject({
    api: '/api/thread',
    schema: threadSchema,
    onFinish: () => {
      toast.success('Thread generated!')
    },
    onError: () => {
      toast.error('Failed to generate thread. Please try again.')
    },
  })

  const variations: ContentVariation[] = (object?.variations ?? []).filter(
    (v): v is ContentVariation => Boolean(v?.id && v?.content)
  )

  const selectedContent = variations.find((v) => v.id === selectedVariationId) ?? null

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return
    setSelectedVariationId(null)
    submit({ prompt, tone, contentType, platforms })
  }, [prompt, tone, contentType, platforms, submit])

  const handleGenerateThread = useCallback(() => {
    if (!prompt.trim()) return
    submitThread({ topic: prompt, tweetCount: threadTweetCount, tone: threadTone })
  }, [prompt, threadTweetCount, threadTone, submitThread])

  const handleCopy = useCallback(async () => {
    if (!selectedContent) return
    const full =
      selectedContent.hashtags.length > 0
        ? `${selectedContent.content}\n\n${selectedContent.hashtags.map((t) => `#${t}`).join(' ')}`
        : selectedContent.content
    await navigator.clipboard.writeText(full)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [selectedContent])

  const handleSaveDraft = useCallback(() => {
    if (!selectedContent) return
    const existingDrafts = JSON.parse(localStorage.getItem('postpilot_drafts') || '[]')
    const newDraft = {
      id: Date.now().toString(),
      content: selectedContent.content,
      hashtags: selectedContent.hashtags,
      platforms,
      tone,
      contentType,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('postpilot_drafts', JSON.stringify([newDraft, ...existingDrafts]))
    toast.success('Draft saved!')
  }, [selectedContent, platforms, tone, contentType])

  const handleCopyThread = useCallback(async (tweets: ThreadTweet[]) => {
    const text = tweets.map((t, i) => `${i + 1}/ ${t.content}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    toast.success('Thread copied to clipboard!')
  }, [])

  const handleSaveThread = useCallback((thread: Partial<Thread>) => {
    if (!thread.tweets?.length) return
    const existing = JSON.parse(localStorage.getItem('postpilot_threads') || '[]')
    localStorage.setItem('postpilot_threads', JSON.stringify([{ id: Date.now().toString(), ...thread, createdAt: new Date().toISOString() }, ...existing]))
    toast.success('Thread saved!')
  }, [])

  const handleImproved = useCallback(
    (newContent: string, newHashtags: string[]) => {
      if (!selectedContent) return
      // Update the selected variation in the object by triggering a new generation isn't ideal,
      // so we store the improved version in local state and switch to it
      setImprovedOverride({ content: newContent, hashtags: newHashtags })
    },
    [selectedContent]
  )

  // Improved override for the selected variation
  const [improvedOverride, setImprovedOverride] = useState<{
    content: string
    hashtags: string[]
  } | null>(null)

  // When selection changes, clear the override
  const handleSelectVariation = useCallback((id: string) => {
    setSelectedVariationId(id)
    setImprovedOverride(null)
  }, [])

  const displayContent = improvedOverride
    ? { ...selectedContent!, ...improvedOverride }
    : selectedContent

  const hasResults = variations.length > 0 || isGenerating
  const hasThread = (threadObject?.tweets?.length ?? 0) > 0 || isGeneratingThread

  return (
    <div className="flex flex-col">
      <Header
        title="Create Content"
        description="Let AI help you craft the perfect social media post"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssistant((prev) => !prev)}
            className="gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            AI Strategist
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'post' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('post')}
              className="gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Post
            </Button>
            <Button
              variant={mode === 'thread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('thread')}
              className="gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Thread
            </Button>
          </div>

          {/* Platform Selection (only for post mode) */}
          {mode === 'post' && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Target Platforms</CardTitle>
              <CardDescription>Select which platforms you want to create content for</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformSelector selected={platforms} onChange={setPlatforms} />
            </CardContent>
          </Card>
          )}

          {/* Prompt Input */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{mode === 'thread' ? 'Thread Topic' : 'What would you like to post about?'}</CardTitle>
              <CardDescription>{mode === 'thread' ? 'Describe the topic for your thread' : 'Describe your idea, topic, or message'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={mode === 'thread' ? 'e.g., 7 productivity habits I wish I knew earlier, How AI is changing marketing...' : 'e.g., Announcing our new product launch, sharing tips about productivity, celebrating a milestone...'}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />

              <div className="flex flex-wrap gap-4">
                {mode === 'post' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone</label>
                      <Select value={tone} onValueChange={(v) => setTone(v as ToneId)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content Type</label>
                      <Select
                        value={contentType}
                        onValueChange={(v) => setContentType(v as ContentTypeId)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map((ct) => (
                            <SelectItem key={ct.id} value={ct.id}>
                              {ct.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tweets</label>
                      <Select value={String(threadTweetCount)} onValueChange={(v) => setThreadTweetCount(Number(v) as ThreadTweetCount)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {THREAD_TWEET_COUNTS.map((n) => (
                            <SelectItem key={n} value={String(n)}>{n} tweets</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone</label>
                      <Select value={threadTone} onValueChange={setThreadTone}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map((t) => (
                            <SelectItem key={t.id} value={t.description}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={mode === 'thread' ? handleGenerateThread : handleGenerate}
                  disabled={!prompt.trim() || (mode === 'post' ? isGenerating : isGeneratingThread)}
                  size="lg"
                  className="sm:w-auto"
                >
                  {(mode === 'post' ? isGenerating : isGeneratingThread) ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                        />
                      </svg>
                      {mode === 'thread' ? 'Build Thread' : 'Generate with Claude'}
                    </>
                  )}
                </Button>

                {(mode === 'post' ? isGenerating : isGeneratingThread) && (
                  <Button variant="outline" size="lg" onClick={mode === 'post' ? stop : stopThread}>
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thread Results */}
          {mode === 'thread' && hasThread && (
            <Card>
              <CardContent className="pt-6">
                <ThreadView
                  thread={(threadObject ?? {}) as Partial<Thread>}
                  isGenerating={isGeneratingThread}
                  onCopy={handleCopyThread}
                  onSave={handleSaveThread}
                />
              </CardContent>
            </Card>
          )}

          {/* Post Streaming Results */}
          {mode === 'post' && hasResults && (
            <>
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Generated Variations</CardTitle>
                      <CardDescription>
                        {isGenerating
                          ? 'Claude is crafting your variations…'
                          : 'Choose your favorite and customize it'}
                      </CardDescription>
                    </div>
                    {!isGenerating && (
                      <Button variant="outline" size="sm" onClick={handleGenerate}>
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                          />
                        </svg>
                        Regenerate
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {variations.length > 0 ? (
                    <VariationCards
                      variations={variations}
                      selectedId={selectedVariationId}
                      onSelect={handleSelectVariation}
                      selectedPlatform={platforms[0]}
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-6">
                      <svg
                        className="h-5 w-5 animate-spin text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        Claude is writing your posts…
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              {displayContent && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Preview</CardTitle>
                        <CardDescription>
                          See how your post will look on each platform
                        </CardDescription>
                      </div>
                      {improvedOverride && (
                        <Badge variant="secondary" className="gap-1">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                            />
                          </svg>
                          AI Improved
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PlatformPreview
                      content={displayContent.content}
                      hashtags={displayContent.hashtags}
                      platforms={platforms}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {displayContent && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSaveDraft} variant="outline">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                    Save as Draft
                  </Button>

                  {selectedContent && (
                    <ImproveDialog
                      variation={displayContent}
                      tone={tone}
                      platforms={platforms}
                      onImproved={handleImproved}
                    >
                      <Button variant="outline">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                          />
                        </svg>
                        Improve with AI
                      </Button>
                    </ImproveDialog>
                  )}

                  <Button onClick={handleCopy}>
                    {copied ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {mode === 'post' && !hasResults && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Ready to create?</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Enter your idea above and click &ldquo;Generate with Claude&rdquo; to get
                  3 unique AI-crafted variations.
                </p>
              </CardContent>
            </Card>
          )}
          {mode === 'thread' && !hasThread && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Build a thread</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                  Enter your topic above and click &ldquo;Build Thread&rdquo; to generate a viral Twitter thread.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Assistant Sidebar */}
        {showAssistant && (
          <div className="hidden w-80 shrink-0 border-l lg:flex lg:flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-3.5 w-3.5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium">AI Strategist</span>
                <Badge variant="secondary" className="text-[10px]">Claude</Badge>
              </div>
              <button
                type="button"
                onClick={() => setShowAssistant(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIAssistant />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
