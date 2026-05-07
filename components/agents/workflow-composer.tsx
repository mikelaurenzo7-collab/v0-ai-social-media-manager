'use client'

import { useState } from 'react'
import { Agent } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

const COMMON_STEPS: WorkflowStep[] = [
  { id: 'research', name: 'Topic Research', description: 'Analyze trends and search intent', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg> },
  { id: 'hooks', name: 'Viral Hooks', description: 'Generate high-CTR opening lines', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg> },
  { id: 'draft', name: 'Post Drafting', description: 'Create platform-native content', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg> },
  { id: 'hashtags', name: 'Hashtag Set', description: 'Optimized reach tags', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" /></svg> },
  { id: 'schedule', name: 'Best Time', description: 'Calculate optimal posting slot', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> },
]

export function WorkflowComposer({ agent }: { agent: Agent }) {
  const [topic, setTopic] = useState('')
  const [selectedSteps, setSelectedSteps] = useState<string[]>(['research', 'hooks', 'draft'])
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const toggleStep = (id: string) => {
    setSelectedSteps(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleRun = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first")
      return
    }
    setIsRunning(true)
    setResults([])
    try {
      const res = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: selectedSteps, topic, agentId: agent.id })
      })
      const data = await res.json()
      setResults(data.results)
      toast.success("Workflow completed!")
    } catch (e) {
      toast.error("Workflow failed")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Workflow Composer</h2>
        <p className="text-muted-foreground">
          Chain tasks together for {agent.name} to execute in sequence.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Workflow Topic</CardTitle>
          <CardDescription>What should this workflow focus on?</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. Benefits of remote work for designers"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMMON_STEPS.map((step) => {
          const isSelected = selectedSteps.includes(step.id)
          const selectionIndex = selectedSteps.indexOf(step.id)

          return (
            <Card
              key={step.id}
              className={cn(
                "relative cursor-pointer transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "opacity-70 hover:opacity-100"
              )}
              onClick={() => toggleStep(step.id)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {step.icon}
                  </div>
                  {isSelected && (
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {selectionIndex + 1}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-2 text-sm">{step.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-[10px] text-muted-foreground leading-tight">{step.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {results.length > 0 ? (
        <div className="space-y-6">
          <h3 className="font-bold text-lg">Workflow Results</h3>
          {results.map((res) => (
            <Card key={res.id}>
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-sm">{res.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {res.output}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                  navigator.clipboard.writeText(res.output)
                  toast.success("Copied to clipboard")
                }}>
                  Copy Result
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Execution Plan</h3>
            <Badge variant="outline">{selectedSteps.length} Steps</Badge>
          </div>

          <div className="space-y-4">
            {selectedSteps.map((stepId, index) => {
              const step = COMMON_STEPS.find(s => s.id === stepId)
              return (
                <div key={stepId} className="flex items-center gap-4 relative">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-lg border bg-background p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{step?.name}</p>
                      <p className="text-[10px] text-muted-foreground">{step?.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ready to execute</p>
              <p className="text-xs text-muted-foreground">This will use approx. 1,000 tokens</p>
            </div>
            <Button disabled={selectedSteps.length === 0 || isRunning} onClick={handleRun}>
              {isRunning ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Executing...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
