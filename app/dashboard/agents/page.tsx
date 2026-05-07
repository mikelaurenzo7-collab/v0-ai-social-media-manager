'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/dashboard/header'
import { cn } from '@/lib/utils'

export default function AgentsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="AI Agents"
        description="Your dedicated team of social media experts, ready to scale your presence."
      />

      <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((agent) => (
          <Card key={agent.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white shadow-inner transition-transform group-hover:scale-110",
                  agent.color === 'blue' ? 'bg-blue-500 shadow-blue-200' :
                  agent.color === 'orange' ? 'bg-orange-500 shadow-orange-200' :
                  agent.color === 'purple' ? 'bg-purple-500 shadow-purple-200' :
                  'bg-green-500 shadow-green-200'
                )}>
                  {agent.avatar}
                </div>
                {agent.premium && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Premium
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{agent.name}</CardTitle>
              <CardDescription className="font-medium text-primary/80">{agent.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {agent.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                    {cap}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <Button asChild className="w-full" variant={agent.premium ? "default" : "outline"}>
                <Link href={`/dashboard/agents/${agent.id}`}>
                  {agent.premium ? "Unlock & Manage" : `Work with ${agent.name}`}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-6 mb-10 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-semibold">Need a custom agent?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enterprise plans allow for building custom agents trained on your specific brand data.
        </p>
        <Button variant="link" className="mt-2">Contact Sales →</Button>
      </div>
    </div>
  )
}
