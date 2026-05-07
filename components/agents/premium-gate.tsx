'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const status = localStorage.getItem('postpilot_is_premium') === 'true'
    setIsPremium(status)
  }, [])

  const setPremium = (status: boolean) => {
    localStorage.setItem('postpilot_is_premium', status.toString())
    setIsPremium(status)
    if (status) toast.success("Upgraded to Premium!")
    else toast.info("Premium status removed")
  }

  return { isPremium, setPremium }
}

export function PremiumGate({ children, agentPremium }: { children: React.ReactNode, agentPremium: boolean }) {
  const { isPremium, setPremium } = usePremiumStatus()

  if (agentPremium && !isPremium) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20">
        <Card className="max-w-md text-center border-amber-500/20 shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardTitle>Premium Agent</CardTitle>
            <CardDescription>
              This specialized expert is only available on Pro and Enterprise plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Unlock access to all premium agents, advanced workflows, and higher token limits.
            </p>
            <Button onClick={() => setPremium(true)} className="w-full bg-amber-600 hover:bg-amber-700">
              Upgrade to Premium
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Risk-free 14-day trial
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
