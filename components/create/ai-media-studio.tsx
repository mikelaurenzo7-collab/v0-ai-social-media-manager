'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type AspectRatio = 'square' | 'portrait' | 'landscape' | 'portrait_4_5'
type ModelType = 'fast' | 'quality' | 'realistic'
type MediaType = 'image' | 'video'

interface GeneratedImage {
  url: string
  width: number
  height: number
}

const ASPECT_RATIOS: { id: AspectRatio; label: string; icon: React.ReactNode; platforms: string }[] = [
  {
    id: 'square',
    label: '1:1',
    icon: <div className="h-4 w-4 border-2 border-current rounded-sm" />,
    platforms: 'Instagram, Facebook',
  },
  {
    id: 'portrait',
    label: '9:16',
    icon: <div className="h-5 w-3 border-2 border-current rounded-sm" />,
    platforms: 'Stories, Reels, TikTok',
  },
  {
    id: 'landscape',
    label: '16:9',
    icon: <div className="h-3 w-5 border-2 border-current rounded-sm" />,
    platforms: 'X, LinkedIn, YouTube',
  },
  {
    id: 'portrait_4_5',
    label: '4:5',
    icon: <div className="h-5 w-4 border-2 border-current rounded-sm" />,
    platforms: 'Instagram Portrait',
  },
]

const MODELS: { id: ModelType; label: string; desc: string; time: string }[] = [
  { id: 'fast', label: 'Fast', desc: 'Quick generation', time: '~5s' },
  { id: 'quality', label: 'Quality', desc: 'Higher detail', time: '~15s' },
  { id: 'realistic', label: 'Realistic', desc: 'Photorealistic', time: '~20s' },
]

const STYLE_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'neon', label: 'Neon' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: '3d-render', label: '3D Render' },
]

interface AIMediaStudioProps {
  onImageSelect?: (url: string) => void
  onVideoSelect?: (url: string) => void
  className?: string
}

export function AIMediaStudio({ onImageSelect, onVideoSelect, className }: AIMediaStudioProps) {
  const [mediaType, setMediaType] = useState<MediaType>('image')
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square')
  const [model, setModel] = useState<ModelType>('fast')
  const [style, setStyle] = useState('none')
  const [numImages, setNumImages] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setGeneratedImages([])
    setSelectedImageIndex(null)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          model,
          numImages,
          style: style !== 'none' ? style : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImages(data.images)
      toast.success(`Generated ${data.images.length} image${data.images.length > 1 ? 's' : ''}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, aspectRatio, model, numImages, style])

  const handleGenerateVideo = useCallback(async () => {
    if (!prompt.trim() && generatedImages.length === 0) {
      toast.error('Please enter a prompt or generate an image first')
      return
    }

    setIsGenerating(true)
    setGeneratedVideo(null)

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || undefined,
          imageUrl: selectedImageIndex !== null ? generatedImages[selectedImageIndex]?.url : undefined,
          duration: 4,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate video')
      }

      const data = await response.json()
      setGeneratedVideo(data.videoUrl)
      toast.success('Video generated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate video')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, generatedImages, selectedImageIndex])

  const handleUseImage = useCallback((index: number) => {
    const image = generatedImages[index]
    if (image && onImageSelect) {
      onImageSelect(image.url)
      toast.success('Image added to your post')
    }
  }, [generatedImages, onImageSelect])

  const handleUseVideo = useCallback(() => {
    if (generatedVideo && onVideoSelect) {
      onVideoSelect(generatedVideo)
      toast.success('Video added to your post')
    }
  }, [generatedVideo, onVideoSelect])

  return (
    <Card className={cn('border-border/60', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
            >
              AI
            </div>
            AI Media Studio
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg p-1 bg-muted/50">
            {(['image', 'video'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  mediaType === type
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'image' ? 'Image' : 'Video'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Describe what you want to create</Label>
          <Textarea
            placeholder={mediaType === 'image' 
              ? "A professional photo of a modern workspace with plants and natural lighting..."
              : "A cinematic product reveal with smooth camera movement..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        {mediaType === 'image' && (
          <>
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Aspect Ratio</Label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                      aspectRatio === ar.id
                        ? 'border-orange-200 bg-orange-50 ring-1 ring-orange-200'
                        : 'border-border/60 hover:border-border hover:bg-muted/30'
                    )}
                  >
                    <div className={cn(
                      'text-muted-foreground',
                      aspectRatio === ar.id && 'text-orange-600'
                    )}>
                      {ar.icon}
                    </div>
                    <span className={cn(
                      'text-[10px] font-semibold',
                      aspectRatio === ar.id ? 'text-orange-600' : 'text-muted-foreground'
                    )}>
                      {ar.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Best for: {ASPECT_RATIOS.find(ar => ar.id === aspectRatio)?.platforms}
              </p>
            </div>

            {/* Model & Style */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Quality</Label>
                <div className="flex gap-1">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-2 text-center transition-all',
                        model === m.id
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-border/60 hover:border-border'
                      )}
                    >
                      <p className={cn(
                        'text-xs font-semibold',
                        model === m.id ? 'text-orange-600' : 'text-foreground'
                      )}>
                        {m.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{m.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Style</Label>
                <div className="flex flex-wrap gap-1">
                  {STYLE_PRESETS.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all',
                        style === s.id
                          ? 'border-orange-200 bg-orange-50 text-orange-600'
                          : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Number of images */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Number of variations</Label>
              <div className="flex gap-1">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={cn(
                      'h-8 w-10 rounded-lg border text-xs font-semibold transition-all',
                      numImages === n
                        ? 'border-orange-200 bg-orange-50 text-orange-600'
                        : 'border-border/60 text-muted-foreground hover:border-border hover:text-foreground'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mediaType === 'video' && generatedImages.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Or animate an existing image</Label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {generatedImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(selectedImageIndex === i ? null : i)}
                  className={cn(
                    'relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all',
                    selectedImageIndex === i
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {selectedImageIndex === i && (
                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                      <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={mediaType === 'image' ? handleGenerateImage : handleGenerateVideo}
          disabled={isGenerating || (!prompt.trim() && mediaType === 'video' && selectedImageIndex === null)}
          className="w-full font-semibold"
          style={{ 
            background: isGenerating ? undefined : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            border: 'none'
          }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {mediaType === 'image' ? 'Generating images...' : 'Creating video...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate {mediaType === 'image' ? `${numImages} Image${numImages > 1 ? 's' : ''}` : 'Video'}
            </span>
          )}
        </Button>

        {/* Generated Images */}
        {generatedImages.length > 0 && mediaType === 'image' && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <Label className="text-xs font-medium">Generated Images</Label>
            <div className={cn(
              'grid gap-2',
              generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              {generatedImages.map((img, i) => (
                <div key={i} className="group relative rounded-xl overflow-hidden border border-border/60">
                  <img
                    src={img.url}
                    alt={`Generated image ${i + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUseImage(i)}
                      className="text-xs"
                    >
                      Use in Post
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(img.url, '_blank')}
                      className="text-xs"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Video */}
        {generatedVideo && mediaType === 'video' && (
          <div className="space-y-3 pt-2 border-t border-border/60">
            <Label className="text-xs font-medium">Generated Video</Label>
            <div className="relative rounded-xl overflow-hidden border border-border/60">
              <video
                src={generatedVideo}
                controls
                autoPlay
                loop
                muted
                className="w-full"
              />
              <div className="flex gap-2 p-3 bg-muted/30">
                <Button
                  size="sm"
                  onClick={handleUseVideo}
                  className="flex-1 text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
                >
                  Use in Post
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(generatedVideo, '_blank')}
                  className="text-xs"
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
