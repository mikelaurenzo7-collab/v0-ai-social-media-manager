'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

// ── Tool result renderers ──────────────────────────────────────────────────────

function AnalyzePostResult({ result }: { result: Record<string, unknown> }) {
  const metrics = [
    { label: 'Hook', value: result.hookStrength as number },
    { label: 'CTA', value: result.ctaClarity as number },
    { label: 'Read', value: result.readability as number },
    { label: 'Engage', value: result.engagementPotential as number },
  ]
  const overall = result.overallScore as number
  const color = overall >= 8 ? 'text-green-500' : overall >= 6 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Post Analysis</span>
        <span className={cn('text-lg font-bold tabular-nums', color)}>{overall}/10</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-base font-semibold tabular-nums">{m.value}</div>
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
      {Boolean(result.hookType) && (
        <div className="text-xs">
          <span className="font-medium">Hook type:</span>{' '}
          <span className="text-muted-foreground">{result.hookType as string}</span>
        </div>
      )}
      {Array.isArray(result.strengths) && result.strengths.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">✓ Strengths</p>
          {(result.strengths as string[]).map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {s}</p>
          ))}
        </div>
      )}
      {Array.isArray(result.improvements) && result.improvements.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-600">↑ Improve</p>
          {(result.improvements as string[]).map((s, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {s}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function HashtagResult({ result }: { result: Record<string, unknown> }) {
  const hashtags = result.hashtags as Array<{ tag: string; category: string; estimatedReach: string; why: string }>
  const reachColor = (r: string) =>
    r === 'very high' ? 'text-green-500' : r === 'high' ? 'text-blue-500' : r === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hashtag Strategy</span>
      <div className="flex flex-wrap gap-1.5">
        {hashtags?.map((h) => (
          <span key={h.tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            #{h.tag}
          </span>
        ))}
      </div>
      {Boolean(result.strategy) && (
        <p className="text-xs text-muted-foreground">{result.strategy as string}</p>
      )}
    </div>
  )
}

function ThreadOutlineResult({ result }: { result: Record<string, unknown> }) {
  const tweets = result.tweets as Array<{ number: number; content: string; type: string }>
  const typeColor: Record<string, string> = {
    hook: 'bg-orange-500/10 text-orange-600',
    content: 'bg-blue-500/10 text-blue-600',
    bridge: 'bg-purple-500/10 text-purple-600',
    cta: 'bg-green-500/10 text-green-600',
  }

  const handleCopy = async () => {
    const text = tweets.map((t, i) => `${i + 1}/ ${t.content}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    toast.success('Thread copied to clipboard!')
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thread Outline</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        </Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tweets?.map((t) => (
          <div key={t.number} className="flex gap-2">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground w-5">{t.number}.</span>
            <div className="flex-1 min-w-0 space-y-1">
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', typeColor[t.type] ?? 'bg-muted text-muted-foreground')}>
                {t.type}
              </span>
              <p className="text-xs leading-relaxed">{t.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleResult({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optimal Schedule</span>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="font-medium text-muted-foreground">Best Days</p>
          <p>{(result.bestDays as string[])?.join(', ')}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">Best Times</p>
          <p>{(result.bestTimes as string[])?.join(', ')}</p>
        </div>
      </div>
      {Boolean(result.notes) && (
        <p className="text-xs text-muted-foreground italic">{result.notes as string}</p>
      )}
    </div>
  )
}

function RewriteForPlatformResult({ result }: { result: Record<string, unknown> }) {
  const platform = result.targetPlatform as string
  const charCount = result.characterCount as number
  const keyChanges = result.keyChanges as string[]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.rewrittenContent as string)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rewritten for {platform}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">{charCount} chars</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </Button>
        </div>
      </div>
      {Boolean(result.rewrittenContent) && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap rounded bg-background/60 px-2 py-1.5">{result.rewrittenContent as string}</p>
      )}
      {Array.isArray(keyChanges) && keyChanges.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Changes made:</p>
          {keyChanges.map((c, i) => (
            <p key={i} className="text-xs text-muted-foreground">→ {c}</p>
          ))}
        </div>
      )}
      {Boolean(result.platformTip) && (
        <div className="rounded bg-primary/10 px-2 py-1.5">
          <p className="text-xs font-medium text-primary">💡 {result.platformTip as string}</p>
        </div>
      )}
    </div>
  )
}

function ViralHooksResult({ result }: { result: Record<string, unknown> }) {
  const hooks = result.hooks as Array<{ hook: string; formula: string; whyItWorks: string; score: number }>
  const topPick = result.topPick as number
  const scoreColor = (s: number) => s >= 9 ? 'text-green-500' : s >= 7 ? 'text-yellow-500' : 'text-muted-foreground'

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('Hook copied to clipboard!')
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Viral Hooks</span>
      <div className="space-y-2">
        {hooks?.map((h, i) => (
          <div key={i} className={cn('rounded-lg border p-2.5 space-y-1', i === topPick ? 'border-primary bg-primary/5' : 'bg-background/60')}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug flex-1">&ldquo;{h.hook}&rdquo;</p>
              <div className="flex flex-col items-end gap-2">
                <span className={cn('shrink-0 text-xs font-bold tabular-nums', scoreColor(h.score))}>{h.score}/10</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(h.hook)}>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{h.formula}</span>
              {i === topPick && <span className="text-[10px] font-medium text-primary">⭐ Top Pick</span>}
            </div>
            <p className="text-xs text-muted-foreground">{h.whyItWorks}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentCalendarResult({ result }: { result: Record<string, unknown> }) {
  const days = result.days as Array<{ day: string; contentType: string; topic: string; hook: string; goal: string }>
  const typeColors: Record<string, string> = {
    Reel: 'bg-pink-500/10 text-pink-600',
    Carousel: 'bg-purple-500/10 text-purple-600',
    Thread: 'bg-blue-500/10 text-blue-600',
    Poll: 'bg-orange-500/10 text-orange-600',
    Story: 'bg-yellow-500/10 text-yellow-600',
    Video: 'bg-red-500/10 text-red-600',
  }
  const getTypeColor = (type: string) => {
    for (const key of Object.keys(typeColors)) {
      if (type.includes(key)) return typeColors[key]
    }
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">7-Day Content Calendar</span>
      </div>
      {Boolean(result.weekTheme) && (
        <p className="text-xs text-muted-foreground italic">Theme: {result.weekTheme as string}</p>
      )}
      <div className="space-y-2">
        {days?.map((d, i) => (
          <div key={i} className="flex gap-2.5 rounded-lg border bg-background/60 p-2">
            <div className="shrink-0 w-8 text-center">
              <p className="text-xs font-bold">{d.day.slice(0, 3)}</p>
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', getTypeColor(d.contentType))}>
                  {d.contentType}
                </span>
              </div>
              <p className="text-xs font-medium">{d.topic}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">&ldquo;{d.hook}&rdquo;</p>
            </div>
          </div>
        ))}
      </div>
      {Boolean(result.proTip) && (
        <div className="rounded bg-primary/10 px-2 py-1.5">
          <p className="text-xs font-medium text-primary">💡 {result.proTip as string}</p>
        </div>
      )}
    </div>
  )
}

function BioOptimizerResult({ result }: { result: Record<string, unknown> }) {
  const charCount = result.characterCount as number
  const limit = result.limit as number
  const keyElements = result.keyElements as string[]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.bio as string)
    toast.success('Bio copied to clipboard!')
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optimized Bio</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs tabular-nums', charCount > limit ? 'text-destructive font-medium' : 'text-muted-foreground')}>
            {charCount}/{limit}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </Button>
        </div>
      </div>
      {Boolean(result.bio) && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap rounded bg-background/60 px-3 py-2">{result.bio as string}</p>
      )}
      {Array.isArray(keyElements) && keyElements.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">✓ What makes it work</p>
          {keyElements.map((el, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {el}</p>
          ))}
        </div>
      )}
      {Boolean(result.alternativeHook) && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Alternative first line:</p>
          <p className="text-xs italic text-muted-foreground">&ldquo;{result.alternativeHook as string}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

// ── Tool result card dispatcher ────────────────────────────────────────────────

function ToolResultCard({ toolName, output }: { toolName: string; output: unknown }) {
  const result = output as Record<string, unknown>
  if (!result) return null

  if (toolName === 'analyze_post') return <AnalyzePostResult result={result} />
  if (toolName === 'suggest_hashtags') return <HashtagResult result={result} />
  if (toolName === 'create_thread_outline') return <ThreadOutlineResult result={result} />
  if (toolName === 'get_posting_schedule') return <ScheduleResult result={result} />
  if (toolName === 'rewrite_for_platform') return <RewriteForPlatformResult result={result} />
  if (toolName === 'generate_viral_hooks') return <ViralHooksResult result={result} />
  if (toolName === 'create_content_calendar') return <ContentCalendarResult result={result} />
  if (toolName === 'optimize_bio') return <BioOptimizerResult result={result} />
  return null
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Give me 5 viral hooks for my SaaS product',
  'Rewrite this post for LinkedIn',
  'Build me a 7-day content calendar for Instagram',
  'Optimize my Twitter bio',
  'Best time to post on TikTok?',
  'Analyze this post for me',
  'Give me 10 hashtags for personal finance content',
  'Thread idea: productivity habits that changed my life',
  'How do I grow faster on TikTok?',
  'What content format works best on LinkedIn right now?',
]

// ── Main component ────────────────────────────────────────────────────────────

export function AIAssistant() {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, setInput, append, handleSubmit, status, stop, handleInputChange } = useChat({
    api: '/api/chat',
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input || !input.trim() || isLoading) return
    handleSubmit(e as any)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return
    append({ role: 'user', content: suggestion })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-primary/5 p-4">
              <p className="text-sm font-medium">👋 Hey! I&apos;m your AI Content Strategist.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask me anything about social media strategy. I can analyze posts, generate viral hooks, rewrite content for any platform, build content calendars, optimize bios, suggest hashtags, and a lot more.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestion(s)}
                  className="block w-full rounded-lg border px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}

            <div className={cn('max-w-[85%] space-y-2', message.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'rounded-xl px-3 py-2 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Tool invocations in v6 AI SDK are different, but we can check toolInvocations */}
              {message.toolInvocations?.map((toolInvocation) => {
                const { toolCallId, toolName, state } = toolInvocation

                if (state === 'result') {
                  return <ToolResultCard key={toolCallId} toolName={toolName} output={toolInvocation.result} />
                }

                return (
                  <div key={toolCallId} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running {toolName.replace(/_/g, ' ')}…
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about strategy, hooks, hashtags…"
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          )}
        </form>
        <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}
