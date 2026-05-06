import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createDraft, getDrafts } from '@/lib/drafts'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const drafts = await getDrafts(session.user.id)
    return NextResponse.json({ drafts })
  } catch (error) {
    console.error('Get drafts error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    if (!body.content || !body.platforms || body.platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and at least one platform are required' },
        { status: 400 }
      )
    }

    const draft = await createDraft({
      userId: session.user.id,
      content: body.content,
      platforms: body.platforms,
      tone: body.tone,
      contentType: body.contentType,
      hashtags: body.hashtags,
      cta: body.cta,
      originalPrompt: body.originalPrompt,
    })

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Create draft error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
