import { type NextRequest, NextResponse } from 'next/server'
import * as fal from '@fal-ai/serverless-client'

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

// Supported aspect ratios for social media
const ASPECT_RATIOS = {
  square: 'square_hd',        // 1:1 - Instagram feed, Facebook
  portrait: 'portrait_16_9',  // 9:16 - Stories, Reels, TikTok
  landscape: 'landscape_16_9', // 16:9 - Twitter, LinkedIn, YouTube
  portrait_4_5: 'portrait_4_3', // 4:5 - Instagram portrait
} as const

type AspectRatio = keyof typeof ASPECT_RATIOS

// Available models
const MODELS = {
  fast: 'fal-ai/flux/schnell',      // Fast, good quality
  quality: 'fal-ai/flux/dev',       // Higher quality, slower
  realistic: 'fal-ai/flux-realism', // Photorealistic
} as const

type ModelType = keyof typeof MODELS

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      prompt, 
      aspectRatio = 'square',
      model = 'fast',
      numImages = 1,
      style,
    } = body as {
      prompt: string
      aspectRatio?: AspectRatio
      model?: ModelType
      numImages?: number
      style?: string
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Enhance prompt with style if provided
    const enhancedPrompt = style 
      ? `${prompt}, ${style} style, high quality, professional`
      : `${prompt}, high quality, professional, suitable for social media`

    // Generate image using fal
    const result = await fal.subscribe(MODELS[model] || MODELS.fast, {
      input: {
        prompt: enhancedPrompt,
        image_size: ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS.square,
        num_inference_steps: model === 'quality' ? 28 : 4,
        num_images: Math.min(numImages, 4), // Cap at 4 images
      },
    }) as { images?: Array<{ url: string; width: number; height: number }> }

    // Extract image URLs from the result
    const images = result.images?.map(img => ({
      url: img.url,
      width: img.width,
      height: img.height,
    })) || []

    if (images.length === 0) {
      throw new Error('No images generated')
    }

    return NextResponse.json({ 
      images,
      prompt: enhancedPrompt,
      model: MODELS[model] || MODELS.fast,
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 },
    )
  }
}
