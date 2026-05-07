# v0-ai-social-media-manager

**The ultimate AI-powered Social Media Management platform with autonomous per-platform agents.**

Each social platform gets its own dedicated **AI Agent Workspace** with:
- Real OAuth2/OAuth1.0a integration
- Custom instructions & personality
- Persistent memory (vector + graph)
- Workflow builder (no-code + code)
- Dedicated chat interface
- Analytics & insights
- Content calendar & scheduling
- Cross-platform orchestration

## ✨ Key Features

### 🧠 Per-Platform AI Agents
- **X Agent** - Witty, real-time, viral-focused
- **LinkedIn Agent** - Professional, thought-leadership
- **Instagram Agent** - Visual storytelling, Reels/TikTok style
- **TikTok Agent** - Trend-jacking, high-engagement
- And more...

### 🔐 Real OAuth Adapters
- Secure token management per user per platform
- Refresh token handling
- Granular permissions

### 🏠 Workspace Pages
`/workspace/[platform-slug]` with tabs:
1. **Dashboard** - KPIs, recent activity
2. **Chat** - Talk directly to the agent
3. **Workflows** - Automation pipelines
4. **Instructions** - System prompt engineering
5. **Memory** - View/edit long-term memory
6. **Calendar** - Schedule posts
7. **Content Studio**
8. **Analytics**

### 🚀 Advanced Capabilities
- Multi-agent orchestration (CrewAI / LangGraph)
- Brand voice consistency with platform adaptation
- RAG-powered content generation (past performance, brand docs)
- Auto-engagement (reply to comments/DMs)
- A/B testing suggestions
- Viral score prediction

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS + Radix
- **AI**: Vercel AI SDK + Anthropic + OpenAI + LangChain/LangGraph
- **Auth**: NextAuth.js / Auth.js
- **Database**: Prisma + PostgreSQL (Supabase/Neon)
- **Memory**: Supabase pgvector or Pinecone + Redis
- **OAuth**: Custom adapters + platform SDKs
- **Deployment**: Vercel

## Getting Started

1. Clone the repo
2. `pnpm install` (or npm/yarn)
3. Copy `.env.local.example` to `.env.local` and fill in keys
4. `pnpm dev`

## Next Steps (Immediate)

- Set up database schema (Prisma)
- Implement NextAuth + user management
- Build OAuth adapters for X, LinkedIn, Instagram
- Create dynamic workspace layout
- Implement LangGraph agents per platform

Built with ❤️ and extreme creativity using **v0**.

[Open in v0](https://v0.app/chat/projects/prj_pUnrszsjYSIDKiymVHdtaLICNKh5)