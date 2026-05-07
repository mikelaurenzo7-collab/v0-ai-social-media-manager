'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/dashboard/header'
import { TONES } from '@/lib/constants/platforms'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [defaultTone, setDefaultTone] = useState('casual')
  const [brandVoice, setBrandVoice] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('postpilot_brand_voice')
    if (stored) {
      const parsed = JSON.parse(stored)
      setBrandVoice(parsed.brandVoice || '')
      setTargetAudience(parsed.targetAudience || '')
      setDefaultTone(parsed.defaultTone || 'casual')
    }
  }, [])

  const handleSaveBrand = () => {
    localStorage.setItem('postpilot_brand_voice', JSON.stringify({
      brandVoice,
      targetAudience,
      defaultTone
    }))
    toast.success('Brand voice profile updated!')
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col">
      <Header 
        title="Settings" 
        description="Manage your account and preferences"
      />
      
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                D
              </div>
              <div>
                <p className="font-medium">Demo User</p>
                <p className="text-sm text-muted-foreground">demo@postpilot.ai</p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Demo User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="demo@postpilot.ai" disabled />
              </div>
            </div>
            
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Brand Voice */}
        <Card>
          <CardHeader>
            <CardTitle>AI Brand Voice</CardTitle>
            <CardDescription>Teach Claude how to write like you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-voice">Describe your Brand Voice</Label>
              <Textarea
                id="brand-voice"
                placeholder="e.g. Professional yet witty, uses specific industry jargon like 'ARR' and 'LTV', never uses exclamation marks, prefers short punchy sentences..."
                className="min-h-[100px]"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Claude will use this description to personalize every post it generates for you.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Input
                id="target-audience"
                placeholder="e.g. SaaS Founders, Marketing Directors, etc."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Who are you writing for?
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Tone</Label>
              <Select value={defaultTone} onValueChange={setDefaultTone}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      {tone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be pre-selected when creating new content
              </p>
            </div>

            <Button onClick={handleSaveBrand}>Save Brand Profile</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive tips and product updates via email
                </p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">Free Plan</p>
                <p className="text-sm text-muted-foreground">25 AI generations per month</p>
              </div>
              <Button>
                Upgrade to Pro
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pro plan includes unlimited generations, advanced tones, and priority support.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
