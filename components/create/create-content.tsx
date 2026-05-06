'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { PlatformSelector } from '@/components/create/platform-selector'
import { VariationCards } from '@/components/create/variation-cards'
import { PlatformPreview } from '@/components/create/platform-preview'
import { TONES, CONTENT_TYPES, type PlatformId, type ToneId, type ContentTypeId } from '@/lib/constants/platforms'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useDrafts } from '@/hooks/use-drafts'
import Link from 'next/link'

interface ContentVariation {
  id: string
  content: string
  hashtags: string[]
}

export function CreateContent() {
  const { user, isLoading: authLoading, mutate: mutateAuth } = useAuth()
  const { createDraft } = useDrafts()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState<ToneId>('casual')
  const [contentType, setContentType] = useState<ContentTypeId>('promotional')
  const [platforms, setPlatforms] = useState<PlatformId[]>(['twitter', 'instagram'])

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState<ContentVariation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Clipboard state
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    // Check credits for logged-in users
    if (user && user.ai_credits <= 0) {
      toast.error('You\'ve run out of AI credits. Upgrade to continue generating content.')
      return
    }

    setIsGenerating(true)
    setVariations([])
    setSelectedVariation(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone, contentType, platforms }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await response.json()
      
      if (data.variations && data.variations.length > 0) {
        setVariations(data.variations)
        setSelectedVariation(data.variations[0].id)
        toast.success('Content generated successfully!')
        // Refresh user data to update credits
        if (user) {
          mutateAuth()
        }
      } else {
        throw new Error('No variations received')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, tone, contentType, platforms, user, mutateAuth])

  const handleRegenerate = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const selectedContent = variations.find((v) => v.id === selectedVariation)

  const handleCopy = useCallback(async () => {
    if (!selectedContent) return

    const fullContent = selectedContent.hashtags.length > 0
      ? `${selectedContent.content}\n\n${selectedContent.hashtags.map(t => `#${t}`).join(' ')}`
      : selectedContent.content

    await navigator.clipboard.writeText(fullContent)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [selectedContent])

  const handleSaveDraft = useCallback(async () => {
    if (!selectedContent) return

    // Check if user is logged in
    if (!user) {
      toast.error('Please sign in to save drafts')
      return
    }

    setIsSaving(true)
    try {
      await createDraft({
        content: selectedContent.content,
        platforms,
        tone,
        contentType,
        hashtags: selectedContent.hashtags,
        originalPrompt: prompt,
      })
      toast.success('Draft saved!')
    } catch (error) {
      console.error('Save draft error:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [selectedContent, platforms, tone, contentType, prompt, user, createDraft])

  return (
    <div className="flex flex-col">
      <Header 
        title="Create Content" 
        description="Let AI help you craft the perfect social media post"
      />
      
      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Target Platforms</CardTitle>
            <CardDescription>Select which platforms you want to create content for</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformSelector selected={platforms} onChange={setPlatforms} />
          </CardContent>
        </Card>

        {/* Prompt Input */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">What would you like to post about?</CardTitle>
            <CardDescription>Describe your idea, topic, or message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Announcing our new product launch, sharing tips about productivity, celebrating a milestone..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            {/* Options */}
            <div className="flex flex-wrap gap-4">
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
                <Select value={contentType} onValueChange={(v) => setContentType(v as ContentTypeId)}>
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
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        {variations.length > 0 && (
          <>
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Generated Content</CardTitle>
                    <CardDescription>Choose your favorite variation</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isGenerating}>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <VariationCards
                  variations={variations}
                  selectedId={selectedVariation}
                  onSelect={setSelectedVariation}
                  selectedPlatform={platforms[0]}
                />
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedContent && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Preview</CardTitle>
                  <CardDescription>See how your post will look on each platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <PlatformPreview
                    content={selectedContent.content}
                    hashtags={selectedContent.hashtags}
                    platforms={platforms}
                  />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button onClick={handleSaveDraft} variant="outline" disabled={isSaving}>
                  {isSaving ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  )}
                  Save as Draft
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/signup">Sign up to save drafts</Link>
                </Button>
              )}
              <Button onClick={handleCopy}>
                {copied ? (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Empty state */}
        {variations.length === 0 && !isGenerating && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Ready to create?</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Enter your idea above and click Generate to let AI craft the perfect social media content for you.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {isGenerating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold">Creating your content...</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Our AI is crafting 3 unique variations optimized for your selected platforms.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
