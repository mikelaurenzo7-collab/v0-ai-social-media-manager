'use client'

import { use, useState } from 'react'
import { AGENTS, getAgentById } from '@/lib/agents'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/dashboard/header'
import { Badge } from '@/components/ui/badge'
import { AgentChat } from '@/components/agents/agent-chat'
import { WorkflowComposer } from '@/components/agents/workflow-composer'
import { AgentSettings } from '@/components/agents/agent-settings'
import { PremiumGate } from '@/components/agents/premium-gate'
import { cn } from '@/lib/utils'

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentById(id)
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
            agent.color === 'blue' ? 'bg-blue-500' :
            agent.color === 'orange' ? 'bg-orange-500' :
            agent.color === 'purple' ? 'bg-purple-500' :
            'bg-green-500'
          )}>
            {agent.avatar}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold leading-none">{agent.name}</h1>
              {agent.premium && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{agent.role}</p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-muted/50 h-9 p-1">
                <TabsTrigger value="chat" className="text-xs h-7 px-4">Chat</TabsTrigger>
                <TabsTrigger value="workflows" className="text-xs h-7 px-4">Workflows</TabsTrigger>
                <TabsTrigger value="memory" className="text-xs h-7 px-4">Memory</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs h-7 px-4">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-hidden">
            <PremiumGate agentPremium={agent.premium}>
              <AgentChat agent={agent} />
            </PremiumGate>
          </div>
        )}
        {activeTab === 'workflows' && (
          <div className="flex-1 overflow-y-auto p-6">
            <PremiumGate agentPremium={agent.premium}>
              <WorkflowComposer agent={agent} />
            </PremiumGate>
          </div>
        )}
        {activeTab === 'memory' && (
          <div className="flex-1 overflow-y-auto p-6">
            <AgentSettings agent={agent} mode="memory" />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6">
            <AgentSettings agent={agent} mode="settings" />
          </div>
        )}
      </div>
    </div>
  )
}
