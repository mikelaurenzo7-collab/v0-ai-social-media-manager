'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart, isToolUIPart, type UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/agents'
import { Button } from '@/components/ui/button'

// ── Agent-specific tool renderers ──────────────────────────────────────────────

function ViralityScore({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="rounded-xl border bg-orange-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Virality Analysis</span>
        <span className="text-2xl font-black text-orange-600">{result.score as number}%</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{result.reasoning as string}</p>
        <div className="rounded-lg bg-orange-500/10 p-3">
          <p className="text-xs font-bold text-orange-700">💡 Pro Tip:</p>
          <p className="text-xs text-orange-800">{result.improvement as string}</p>
        </div>
      </div>
    </div>
  )
}

function AlignmentResult({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="rounded-xl border bg-blue-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Strategic Alignment</span>
        <span className="text-2xl font-black text-blue-600">{result.alignmentScore as number}/10</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(result.pillarMatches as string[]).map((p: string) => (
          <span key={p} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
            {p}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic">&ldquo;{result.feedback as string}&rdquo;</p>
    </div>
  )
}

function GeneratedImageResult({ result }: { result: Record<string, unknown> }) {
  const imageUrl = result.imageUrl as string
  const success = result.success as boolean
  
  if (!success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Image generation failed</p>
        <p className="text-xs text-red-600 mt-1">{result.error as string}</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-xl border bg-purple-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-600">AI Generated Image</span>
        <span className="text-[10px] font-medium text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">
          {result.aspectRatio as string}
        </span>
      </div>
      <div className="relative rounded-lg overflow-hidden border border-purple-200">
        <img src={imageUrl} alt="Generated" className="w-full max-h-64 object-contain bg-black/5" />
      </div>
      <div className="flex gap-2">
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(imageUrl)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
          </svg>
          Copy URL
        </button>
      </div>
    </div>
  )
}

function ResearchResult({ result }: { result: Record<string, unknown> }) {
  const success = result.success as boolean
  const sources = (result.sources as Array<{ title: string; url: string; snippet: string }>) || []
  const answer = result.answer as string | null
  
  if (!success) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-700">Research unavailable</p>
        <p className="text-xs text-amber-600 mt-1">{result.error as string}</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-xl border bg-blue-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Research Results</span>
      </div>
      
      {answer && (
        <div className="rounded-lg bg-blue-100/50 p-3 border border-blue-200">
          <p className="text-sm text-blue-900">{answer}</p>
        </div>
      )}
      
      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Sources:</p>
          {sources.slice(0, 3).map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-blue-100 bg-white p-2 hover:border-blue-300 transition-colors"
            >
              <p className="text-xs font-semibold text-blue-700 truncate">{source.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{source.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ToolResult({ toolName, result }: { toolName: string; result: unknown }) {
  const r = result as Record<string, unknown>
  if (toolName === 'analyze_virality') return <ViralityScore result={r} />
  if (toolName === 'strategic_alignment') return <AlignmentResult result={r} />
  if (toolName === 'generate_image') return <GeneratedImageResult result={r} />
  if (toolName === 'research_trends') return <ResearchResult result={r} />
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-xs">
      <p className="font-bold mb-1">Tool: {toolName}</p>
      <pre className="overflow-auto max-w-full">{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}

function getTextContent(message: UIMessage): string {
  return message.parts.filter(isTextUIPart).map(p => p.text).join('')
}

// ── Main Agent Chat Component ──────────────────────────────────────────────────

export function AgentChat({ agent }: { agent: Agent }) {
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        agentId: agent.id,
        creativity: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_creativity`) : null,
        tone: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_tone`) : null,
        memory: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_memory`) : null,
        persona: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_persona`) : null,
      },
    }),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      sendMessage({ text: input })
      setInput('')
    }
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-2xl animate-in zoom-in duration-500"
              style={{ background: agent.gradient }}
            >
              {agent.avatar}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{agent.name} Agent</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I&apos;m the default agent for your {agent.name} integration. Tell me your role, voice, and rules — or jump straight into a task below.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {agent.capabilities.map((cap) => (
                <Button
                  key={cap}
                  variant="outline"
                  className="group justify-start text-xs font-semibold h-11 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => { sendMessage({ text: `Help me with ${cap}` }) }}
                >
                  <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  {cap}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const textContent = getTextContent(message)
          const toolParts = message.parts.filter(isToolUIPart)

          return (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-2',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div className={cn('flex gap-3 max-w-[85%]', message.role === 'user' && 'flex-row-reverse')}>
                {message.role === 'assistant' && (
                  <div
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                    style={{ background: agent.gradient }}
                  >
                    {agent.avatar}
                  </div>
                )}

                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ring-black/5',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                )}>
                  {textContent && <p className="whitespace-pre-wrap">{textContent}</p>}

                  {toolParts.map((part) => {
                    const toolName = part.type === 'dynamic-tool'
                      ? part.toolName
                      : part.type.replace(/^tool-/, '')
                    const toolCallId = part.toolCallId

                    if (part.state === 'output-available') {
                      return (
                        <div key={toolCallId} className="mt-4">
                          <ToolResult toolName={toolName} result={part.output} />
                        </div>
                      )
                    }
                    return (
                      <div key={toolCallId} className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Running {toolName.replace(/_/g, ' ')}...
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message your ${agent.name} Agent...`}
              className="w-full resize-none rounded-2xl border bg-muted/50 px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[52px] max-h-[200px]"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
               <span className="text-[10px] text-muted-foreground">Enter to send</span>
            </div>
          </div>
          {isLoading ? (
            <Button type="button" size="icon" onClick={stop} variant="outline" className="h-[52px] w-[52px] rounded-2xl shrink-0 border-primary/20">
              <div className="h-4 w-4 bg-primary animate-pulse rounded-sm" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="h-[52px] w-[52px] rounded-2xl shrink-0 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
