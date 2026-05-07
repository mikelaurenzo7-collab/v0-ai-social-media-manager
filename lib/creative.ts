/**
 * Shared schemas + helpers for the creative surface area: image briefs,
 * carousel storyboards, video scripts. Used by /api/chat tools and the
 * Studio page so the model output and the UI rendering stay in lockstep.
 */

import { z } from 'zod'

export const imageBriefSchema = z.object({
  format: z.enum(['square', 'portrait', 'landscape', 'story']).describe('Aspect ratio'),
  aspectRatio: z.string().describe('Human-readable aspect, e.g. "1:1", "9:16"'),
  subject: z.string().describe('What the image shows in one short sentence'),
  composition: z.string().describe('Composition + framing'),
  styleNotes: z.array(z.string()).max(5).describe('Visual style cues — lighting, palette, mood'),
  textOverlay: z.string().nullable().describe('Optional overlay text (3–7 words)'),
  paletteHexes: z.array(z.string()).max(5).describe('Suggested hex colors pulled from the brand kit'),
  altText: z.string().describe('Accessible alt text — describes the image factually'),
})

export type ImageBrief = z.infer<typeof imageBriefSchema>

export const carouselSlideSchema = z.object({
  index: z.number(),
  type: z.enum(['cover', 'value', 'example', 'transition', 'cta']),
  headline: z.string().describe('Short headline shown big on the slide'),
  body: z.string().describe('Supporting text — keep it scannable'),
  visualNote: z.string().describe('Visual direction for this slide (icon/photo/diagram/quote)'),
})

export const carouselStoryboardSchema = z.object({
  platform: z.enum(['instagram', 'linkedin']),
  title: z.string(),
  hook: z.string().describe('Opening line — must earn the swipe'),
  slides: z.array(carouselSlideSchema).min(3).max(10),
  caption: z.string().describe('Caption to publish alongside'),
  hashtags: z.array(z.string()).max(10),
  saveBait: z.string().describe('Why this carousel is worth saving — for the closing slide'),
})

export type CarouselStoryboard = z.infer<typeof carouselStoryboardSchema>

export const videoScriptShotSchema = z.object({
  index: z.number(),
  duration: z.string().describe('Approx duration in seconds, e.g. "2s", "0–3s"'),
  cameraDirection: z.string().describe('What\'s in frame'),
  voiceOver: z.string().nullable().describe('VO line, if any'),
  onScreenText: z.string().nullable().describe('Text overlay'),
  bRoll: z.string().nullable().describe('Suggested B-roll or cutaway'),
})

export const videoStoryboardSchema = z.object({
  platform: z.enum(['tiktok', 'instagram', 'youtube-shorts']),
  format: z.enum(['talking-head', 'voice-over', 'faceless', 'tutorial', 'POV']),
  hook: z.string().describe('First 1–3 seconds — must stop the scroll'),
  totalDuration: z.string().describe('Total runtime, e.g. "20–30s"'),
  shots: z.array(videoScriptShotSchema).min(3).max(8),
  caption: z.string(),
  audioSuggestion: z.string().describe('Trending audio category or original VO direction'),
  cta: z.string(),
})

export type VideoStoryboard = z.infer<typeof videoStoryboardSchema>

export const studioSpecSchema = z.object({
  primaryPost: z.object({
    platform: z.enum(['twitter', 'linkedin', 'instagram', 'facebook']),
    text: z.string(),
    hashtags: z.array(z.string()).max(5),
    hookType: z.string(),
  }),
  carousel: carouselStoryboardSchema.optional(),
  videoStoryboard: videoStoryboardSchema.optional(),
  imageBrief: imageBriefSchema.optional(),
  email: z.object({
    subject: z.string(),
    preview: z.string(),
    body: z.string(),
  }).optional(),
  reasoning: z.string().describe('Two sentences on why this set works together'),
})

export type StudioSpec = z.infer<typeof studioSpecSchema>

export const ASPECT_RATIOS: Record<ImageBrief['format'], string> = {
  square: '1:1',
  portrait: '4:5',
  landscape: '16:9',
  story: '9:16',
}
