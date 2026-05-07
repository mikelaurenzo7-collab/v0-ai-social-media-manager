'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/agents'
import { Button } from '@/components/ui/button'

// ── Agent-specific tool renderers ──────────────────────────────────────────────

function ViralityScore({ result }: { result: any }) {
  return (
    <div className="rounded-xl border bg-orange-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Virality Analysis</span>
        <span className="text-2xl font-black text-orange-600">{result.score}%</span>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{result.reasoning}</p>
        <div className="rounded-lg bg-orange-500/10 p-3">
          <p className="text-xs font-bold text-orange-700">💡 Pro Tip:</p>
          <p className="text-xs text-orange-800">{result.improvement}</p>
        </div>
      </div>
    </div>
  )
}

function AlignmentResult({ result }: { result: any }) {
  return (
    <div className="rounded-xl border bg-blue-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Strategic Alignment</span>
        <span className="text-2xl font-black text-blue-600">{result.alignmentScore}/10</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {result.pillarMatches.map((p: string) => (
          <span key={p} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
            {p}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground italic">&ldquo;{result.feedback}&rdquo;</p>
    </div>
  )
}

function ToolResult({ toolName, result }: { toolName: string, result: any }) {
  if (toolName === 'analyze_virality') return <ViralityScore result={result} />
  if (toolName === 'strategic_alignment') return <AlignmentResult result={result} />
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-xs">
      <p className="font-bold mb-1">Tool: {toolName}</p>
      <pre className="overflow-auto max-w-full">{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}

// ── Main Agent Chat Component ──────────────────────────────────────────────────

export function AgentChat({ agent }: { agent: Agent }) {
  const { messages, input, handleInputChange, append, handleSubmit, status, stop } = useChat({
    api: '/api/chat',
    body: {
      agentId: agent.id,
      creativity: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_creativity`) : null,
      tone: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_tone`) : null,
      memory: typeof window !== 'undefined' ? localStorage.getItem(`agent_${agent.id}_memory`) : null,
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-2xl animate-in zoom-in duration-500",
              agent.color === 'blue' ? 'bg-blue-500' :
              agent.color === 'orange' ? 'bg-orange-500' :
              agent.color === 'purple' ? 'bg-purple-500' :
              'bg-green-500'
            )}>
              {agent.avatar}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">I&apos;m {agent.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.systemPrompt.split('.')[0]}. How can I help you today?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {agent.capabilities.map((cap) => (
                <Button
                  key={cap}
                  variant="outline"
                  className="group justify-start text-xs font-semibold h-11 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => append({ role: 'user', content: `Help me with ${cap}` })}
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

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-2',
              message.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className={cn('flex gap-3 max-w-[85%]', message.role === 'user' && 'flex-row-reverse')}>
              {message.role === 'assistant' && (
                <div className={cn(
                  "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm",
                  agent.color === 'blue' ? 'bg-blue-500' :
                  agent.color === 'orange' ? 'bg-orange-500' :
                  agent.color === 'purple' ? 'bg-purple-500' :
                  'bg-green-500'
                )}>
                  {agent.avatar}
                </div>
              )}

              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ring-black/5',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border'
              )}>
                {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}

                {/* Tool Renderers */}
                {message.toolInvocations?.map((toolInvocation) => {
                  const { toolCallId, toolName, state } = toolInvocation
                  if (state === 'result') {
                    return (
                      <div key={toolCallId} className="mt-4">
                        <ToolResult toolName={toolName} result={toolInvocation.result} />
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
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
              disabled={!input || !input.trim()}
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
