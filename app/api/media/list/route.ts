import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export interface MediaFile {
  pathname: string
  contentType: string
  size: number
  uploadedAt: string
  filename: string
  type: 'image' | 'video'
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'media/' })

    const files: MediaFile[] = blobs.map((blob) => {
      const filename = blob.pathname.split('/').pop() || 'unknown'
      // Infer content type from extension since list() doesn't return contentType
      const ext = filename.split('.').pop()?.toLowerCase() || ''
      const videoExts = ['mp4', 'mov', 'webm', 'avi', 'mkv']
      const isVideo = videoExts.includes(ext)
      const contentType = isVideo
        ? `video/${ext === 'mov' ? 'quicktime' : ext}`
        : `image/${ext === 'jpg' ? 'jpeg' : ext}`
      return {
        pathname: blob.pathname,
        contentType,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
        filename,
        type: isVideo ? 'video' : 'image',
      }
    })

    // Sort by upload date, newest first
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
