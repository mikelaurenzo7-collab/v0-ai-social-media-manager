"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Mock scheduled posts
const scheduledPosts = [
  { day: 5, platform: "x", title: "Product launch thread" },
  { day: 8, platform: "instagram", title: "Behind the scenes" },
  { day: 12, platform: "facebook", title: "Customer spotlight" },
  { day: 15, platform: "x", title: "Industry insights" },
  { day: 19, platform: "instagram", title: "New feature reveal" },
  { day: 22, platform: "x", title: "Engagement post" },
  { day: 26, platform: "facebook", title: "Weekly roundup" },
]

const platformColors: Record<string, string> = {
  x: "bg-black",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
}

export default function SchedulePage() {
  const [currentMonth] = useState(new Date())
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay }
  }
  
  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Plan and schedule your posts across all platforms
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">Coming Soon</Badge>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {monthName}
            </CardTitle>
            <CardDescription>Schedule and manage your content</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 p-1 rounded-lg bg-muted/30" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const posts = scheduledPosts.filter(p => p.day === day)
              
              return (
                <div 
                  key={day} 
                  className="h-24 p-1 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {posts.map((post, idx) => (
                      <div 
                        key={idx}
                        className={`${platformColors[post.platform]} text-white text-xs px-1.5 py-0.5 rounded truncate`}
                        title={post.title}
                      >
                        {post.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="pt-6 relative">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Auto-Scheduling</h3>
            <p className="text-sm text-muted-foreground mt-1">
              AI picks the best times to post based on your audience activity
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="pt-6 relative">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Bulk Scheduling</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule weeks of content in one session
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden opacity-75">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="pt-6 relative">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Queue Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop to reorder your content queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <CardContent className="py-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Scheduling Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We are working on powerful scheduling features. Connect your social accounts now to be ready when it launches.
          </p>
          <Button asChild>
            <a href="/dashboard/accounts">Connect Accounts</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
