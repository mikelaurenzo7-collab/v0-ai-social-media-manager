import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Type definitions for our database tables
export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'pro' | 'team'
  ai_credits: number
  created_at: Date
  updated_at: Date
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'
  platform_user_id: string | null
  username: string | null
  display_name: string | null
  avatar_url: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: Date | null
  follower_count: number
  is_connected: boolean
  created_at: Date
  updated_at: Date
}

export interface Draft {
  id: string
  user_id: string
  content: string
  platforms: string[]
  tone: string | null
  content_type: string | null
  hashtags: string[] | null
  cta: string | null
  original_prompt: string | null
  is_scheduled: boolean
  scheduled_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface Post {
  id: string
  user_id: string
  draft_id: string | null
  social_account_id: string | null
  platform: string
  content: string
  platform_post_id: string | null
  status: 'published' | 'failed' | 'pending'
  likes_count: number
  comments_count: number
  shares_count: number
  impressions: number
  published_at: Date
  created_at: Date
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  created_at: Date
}
