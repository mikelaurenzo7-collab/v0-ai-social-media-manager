'use client'

import Link from 'next/link'
import { AGENTS } from '@/lib/agents'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/dashboard/header'

export default function AgentsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="AI Agents"
        description="Your dedicated team of social media experts, ready to scale your presence."
      />

      <div className="p-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((agent) => (
          <Card
            key={agent.id}
            className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border-border/60"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                >
                  {agent.avatar}
                </div>
                {agent.premium && (
                  <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600">
                    Premium
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-0.5">
                <h3 className="font-semibold text-base">{agent.name}</h3>
                <p className="text-xs font-medium" style={{ color: '#EA580C' }}>{agent.role}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/20 p-4">
              <Button
                asChild
                className="w-full font-medium"
                variant={agent.premium ? 'default' : undefined}
                style={
                  agent.premium
                    ? undefined
                    : { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }
                }
              >
                <Link href={`/dashboard/agents/${agent.id}`}>
                  {agent.premium ? 'Unlock & Manage' : `Work with ${agent.name}`}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div
        className="mx-6 mb-10 rounded-2xl p-8 text-center"
        style={{ background: 'oklch(0.135 0.018 48)' }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl"
          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
        >
          ✨
        </div>
        <h3 className="text-lg font-semibold text-white">Need a custom agent?</h3>
        <p className="mt-1 text-sm text-white/60">
          Enterprise plans allow for building custom agents trained on your specific brand data.
        </p>
        <Button variant="link" className="mt-2 text-orange-400 hover:text-orange-300">
          Contact Sales →
        </Button>
      </div>
    </div>
  )
}
