"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  BarChart3,
  Calendar
} from "lucide-react"

// Mock data for analytics
const stats = [
  { 
    label: "Total Impressions", 
    value: "124.5K", 
    change: "+12.5%", 
    trend: "up",
    icon: Eye 
  },
  { 
    label: "Engagements", 
    value: "8,432", 
    change: "+8.2%", 
    trend: "up",
    icon: Heart 
  },
  { 
    label: "Comments", 
    value: "1,247", 
    change: "+15.3%", 
    trend: "up",
    icon: MessageCircle 
  },
  { 
    label: "Shares", 
    value: "892", 
    change: "-2.1%", 
    trend: "down",
    icon: Share2 
  },
]

const recentPosts = [
  {
    platform: "X",
    content: "Just launched our new AI features! Check out how we're making content creation 10x faster...",
    impressions: "45.2K",
    engagements: "2,341",
    date: "2 hours ago"
  },
  {
    platform: "Instagram",
    content: "Behind the scenes at PostPilot HQ. Our team is working hard to bring you the best...",
    impressions: "32.1K",
    engagements: "4,521",
    date: "Yesterday"
  },
  {
    platform: "Facebook",
    content: "We've helped over 10,000 creators save time on their social media. Here's what they're saying...",
    impressions: "28.7K",
    engagements: "1,892",
    date: "2 days ago"
  },
]

const bestTimes = [
  { day: "Monday", time: "9:00 AM", engagement: "High" },
  { day: "Wednesday", time: "12:00 PM", engagement: "Very High" },
  { day: "Friday", time: "5:00 PM", engagement: "High" },
  { day: "Saturday", time: "10:00 AM", engagement: "Medium" },
]

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your social media performance across all platforms
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <Badge 
                  variant={stat.trend === "up" ? "default" : "secondary"}
                  className={stat.trend === "up" ? "bg-accent text-accent-foreground" : ""}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Engagement Over Time
                </CardTitle>
                <CardDescription>Last 30 days performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Connect your social accounts to see real analytics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
                <CardDescription>Engagement by platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-black" />
                      <span className="font-medium">X / Twitter</span>
                    </div>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <span className="font-medium">Instagram</span>
                    </div>
                    <span className="text-muted-foreground">35%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-600" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <span className="text-muted-foreground">20%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your best content from the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                      <p className="text-sm text-foreground truncate">{post.content}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.impressions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.engagements}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Best Times to Post
              </CardTitle>
              <CardDescription>Optimal posting times based on your audience engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bestTimes.map((slot, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{slot.day}</span>
                      <Badge 
                        variant={slot.engagement === "Very High" ? "default" : "secondary"}
                        className={slot.engagement === "Very High" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {slot.engagement}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary">{slot.time}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Connect your accounts to get personalized recommendations based on your audience
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
