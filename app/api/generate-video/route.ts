import { type NextRequest, NextResponse } from 'next/server'
import * as fal from '@fal-ai/serverless-client'

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

// Video generation models
const VIDEO_MODELS = {
  fast: 'fal-ai/fast-svd-lcm',           // Fast video from image
  animated: 'fal-ai/animatediff-v2v',    // Animation style
  stable: 'fal-ai/stable-video',         // Stable video diffusion
} as const

type VideoModel = keyof typeof VIDEO_MODELS

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      prompt,
      imageUrl,
      model = 'fast',
      duration = 4, // seconds
    } = body as {
      prompt?: string
      imageUrl?: string
      model?: VideoModel
      duration?: number
    }

    if (!prompt && !imageUrl) {
      return NextResponse.json(
        { error: 'Either prompt or imageUrl is required' }, 
        { status: 400 }
      )
    }

    let result: { video?: { url: string } }

    if (imageUrl) {
      // Image-to-video generation
      result = await fal.subscribe(VIDEO_MODELS[model] || VIDEO_MODELS.fast, {
        input: {
          image_url: imageUrl,
          motion_bucket_id: 127,
          fps: 24,
          num_frames: Math.min(duration * 24, 96), // Cap at ~4 seconds
        },
      }) as { video?: { url: string } }
    } else {
      // Text-to-video (using image generation + animation)
      // First generate an image
      const imageResult = await fal.subscribe('fal-ai/flux/schnell', {
        input: {
          prompt: `${prompt}, cinematic, high quality, suitable for video`,
          image_size: 'landscape_16_9',
          num_inference_steps: 4,
          num_images: 1,
        },
      }) as { images?: Array<{ url: string }> }

      const generatedImageUrl = imageResult.images?.[0]?.url
      if (!generatedImageUrl) {
        throw new Error('Failed to generate base image for video')
      }

      // Then animate it
      result = await fal.subscribe(VIDEO_MODELS.fast, {
        input: {
          image_url: generatedImageUrl,
          motion_bucket_id: 127,
          fps: 24,
          num_frames: Math.min(duration * 24, 96),
        },
      }) as { video?: { url: string } }
    }

    const videoUrl = result.video?.url

    if (!videoUrl) {
      throw new Error('No video generated')
    }

    return NextResponse.json({ 
      videoUrl,
      duration,
      model: VIDEO_MODELS[model] || VIDEO_MODELS.fast,
    })
  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
      { status: 500 },
    )
  }
}
