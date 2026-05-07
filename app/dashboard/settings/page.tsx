'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/dashboard/header'
import { TONES } from '@/lib/constants/platforms'

export default function SettingsPage() {
  const [defaultTone, setDefaultTone] = useState('casual')
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
              >
                D
              </div>
              <div>
                <p className="font-semibold">Demo User</p>
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

            <Button style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>AI Preferences</CardTitle>
            <CardDescription>Default settings for content generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
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
        <Card className="border-border/60 overflow-hidden">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex items-center justify-between rounded-xl p-5"
              style={{ background: 'oklch(0.135 0.018 48)' }}
            >
              <div>
                <p className="font-semibold text-white">Free Plan</p>
                <p className="text-sm text-white/60">25 AI generations per month</p>
              </div>
              <Button
                className="shrink-0 font-semibold"
                style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
              >
                Upgrade to Pro
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pro plan includes unlimited generations, advanced tones, and priority support.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm" className="shrink-0">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
