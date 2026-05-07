'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/create/platform-selector'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'

interface ScheduledItem {
  id: string
  type: 'post' | 'thread'
  content?: string
  title?: string
  platforms?: string[]
  scheduledAt: string
  status: 'scheduled'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('postpilot_scheduled')
    if (stored) {
      setScheduledItems(JSON.parse(stored))
    }
  }, [])

  if (!mounted) return null

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Content Calendar"
        description="Visualize and manage your scheduled social media strategy"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="rounded-none border-r" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-none" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Posts
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Threads
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-muted rounded-xl overflow-hidden border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-background py-3 text-center text-sm font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}

          {/* Padding for start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-muted/30 min-h-[140px]" />
          ))}

          {days.map((day) => {
            const dayItems = scheduledItems.filter(item => isSameDay(new Date(item.scheduledAt), day))
            return (
              <div
                key={day.toString()}
                className={cn(
                  "bg-background min-h-[140px] p-2 transition-colors hover:bg-muted/10",
                  !isSameDay(day, monthStart) && "border-l border-t",
                  isToday(day) && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center text-sm rounded-full",
                    isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex flex-col gap-1 p-2 rounded-md text-[10px] leading-tight border shadow-sm cursor-pointer hover:shadow-md transition-all",
                        item.type === 'post' ? "bg-primary/5 border-primary/20" : "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {item.platforms?.map(p => (
                            <PlatformIcon key={p} platform={p as any} className="h-2.5 w-2.5 opacity-70" />
                          ))}
                        </div>
                        <span className="opacity-60 flex items-center gap-0.5">
                          <Clock className="h-2 w-2" />
                          {format(new Date(item.scheduledAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="font-medium line-clamp-2">
                        {item.type === 'post' ? item.content : item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Padding for end of month */}
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, i) => (
            <div key={`pad-end-${i}`} className="bg-muted/30 min-h-[140px]" />
          ))}
        </div>

        {/* List view for mobile or quick summary */}
        <Card className="lg:hidden">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Strategy</CardTitle>
            <CardDescription>Your next scheduled items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledItems.length > 0 ? (
              scheduledItems
                .filter(i => new Date(i.scheduledAt) >= new Date())
                .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      item.type === 'post' ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-600"
                    )}>
                      {item.type === 'post' ? <CalendarIcon className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.scheduledAt), 'MMM d, HH:mm')}</p>
                      </div>
                      <p className="text-sm line-clamp-1">{item.type === 'post' ? item.content : item.title}</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming items scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
