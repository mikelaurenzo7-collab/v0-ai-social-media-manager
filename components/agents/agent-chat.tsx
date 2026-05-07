'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
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

function ToolResult({ toolName, result }: { toolName: string; result: unknown }) {
  const r = result as Record<string, unknown>
  if (toolName === 'analyze_virality') return <ViralityScore result={r} />
  if (toolName === 'strategic_alignment') return <AlignmentResult result={r} />
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

  // Build the transport once — useChat freezes its initial transport, so
  // dynamic per-send values must be read inside prepareSendMessagesRequest
  // (re-evaluated on every send).
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages, body }) => {
          const ls = typeof window !== 'undefined' ? window.localStorage : null
          const readJson = (key: string): unknown => {
            try {
              const raw = ls?.getItem(key)
              return raw ? JSON.parse(raw) : null
            } catch {
              return null
            }
          }
          // Read agent permissions first so we can respect tool-access toggles
          // before deciding whether to ship optional payloads (Brand Kit etc.).
          const permissions = readJson(`agent_${agent.id}_permissions_v1`) as
            | { tools?: { brandKit?: boolean } }
            | null

          const brandKitEnabled = permissions?.tools?.brandKit !== false
          const brandKit = brandKitEnabled ? readJson('postpilot_brand_kit_v1') : null

          return {
            body: {
              ...body,
              messages,
              agentId: agent.id,
              creativity: ls?.getItem(`agent_${agent.id}_creativity`) ?? null,
              tone: ls?.getItem(`agent_${agent.id}_tone`) ?? null,
              memory: ls?.getItem(`agent_${agent.id}_memory`) ?? null,
              brandKit,
              customization: readJson(`postpilot_agent_${agent.id}_customization_v1`),
              permissions,
            },
          }
        },
      }),
    [agent.id],
  )

  const { messages, sendMessage, status, stop } = useChat({ transport })

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
