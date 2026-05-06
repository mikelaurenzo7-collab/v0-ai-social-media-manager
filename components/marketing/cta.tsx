"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container max-w-4xl mx-auto px-4 relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start creating today
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to transform your social media?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
            Join thousands of creators and businesses who use PostPilot to create engaging content in seconds. 
            Start free, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg h-14 px-8" asChild>
              <Link href="/signup">
                Get started free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8" asChild>
              <Link href="/dashboard/create">
                Try the demo
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Free plan includes 50 AI generations per month
          </p>
        </div>
      </div>
    </section>
  )
}
