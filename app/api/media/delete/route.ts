import { del, head } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = (await request.json()) as { pathname?: string }

    if (!pathname) {
      return NextResponse.json({ error: 'No pathname provided' }, { status: 400 })
    }

    // Verify the file exists and belongs to media folder
    if (!pathname.startsWith('media/')) {
      return NextResponse.json({ error: 'Invalid pathname' }, { status: 400 })
    }

    // Get the blob metadata to get the URL for deletion
    const blob = await head(pathname)
    if (!blob) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await del(blob.url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
