import { type NextRequest, NextResponse } from 'next/server'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
  answer?: string
}

export async function POST(request: NextRequest) {
  if (!TAVILY_API_KEY) {
    return NextResponse.json(
      { error: 'TAVILY_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const { query, searchDepth = 'basic', maxResults = 5, includeAnswer = true } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: searchDepth, // 'basic' or 'advanced'
        max_results: maxResults,
        include_answer: includeAnswer,
        include_raw_content: false,
        include_images: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Tavily API error:', error)
      return NextResponse.json(
        { error: 'Research search failed' },
        { status: response.status }
      )
    }

    const data = (await response.json()) as TavilyResponse

    return NextResponse.json({
      answer: data.answer || null,
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 300) + (r.content.length > 300 ? '...' : ''),
        relevanceScore: r.score,
      })),
      query,
    })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json(
      { error: 'Failed to perform research' },
      { status: 500 }
    )
  }
}
