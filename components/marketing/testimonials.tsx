"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Lifestyle Influencer",
    followers: "2.4M followers",
    initials: "SC",
    content: "PostPilot has completely transformed how I create content. I used to spend hours writing captions - now I generate a week's worth in minutes. The AI actually gets my voice.",
    rating: 5,
    platform: "Instagram"
  },
  {
    name: "Marcus Johnson",
    role: "Founder, TechStartup.io",
    followers: "156K followers",
    initials: "MJ",
    content: "As a founder, I don't have time for social media but I know it's important. PostPilot lets me maintain a strong presence across all platforms without the overhead. Game changer.",
    rating: 5,
    platform: "X/Twitter"
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    followers: "12K followers",
    initials: "ER",
    content: "I was skeptical about AI-generated content but PostPilot surprised me. The posts feel authentic and my engagement has actually increased 40% since I started using it.",
    rating: 5,
    platform: "Facebook"
  },
  {
    name: "David Kim",
    role: "Digital Marketing Agency",
    followers: "Managing 50+ accounts",
    initials: "DK",
    content: "We manage social for dozens of clients. PostPilot's team features and multi-account support have made our workflow 10x more efficient. The ROI is incredible.",
    rating: 5,
    platform: "All Platforms"
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const next = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-24 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 text-balance">
            Loved by creators and businesses
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-pretty">
            Join thousands of users who have transformed their social media presence with PostPilot
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="max-w-3xl mx-auto border-0 shadow-lg">
                    <CardContent className="p-8 md:p-12">
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-foreground">
                        &ldquo;{testimonial.content}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          <div className="text-xs text-primary mt-1">{testimonial.followers} • {testimonial.platform}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setActiveIndex(index)
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === activeIndex 
                      ? "bg-primary w-8" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
