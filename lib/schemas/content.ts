import { z } from 'zod'

export const contentVariationSchema = z.object({
  variations: z
    .array(
      z.object({
        id: z.string().describe('A unique short identifier like "v1", "v2", "v3"'),
        content: z
          .string()
          .describe('The main post content, optimized for social media engagement'),
        hashtags: z
          .array(z.string())
          .describe('Relevant hashtags without the # symbol'),
        angle: z
          .string()
          .describe(
            'A short label describing the creative angle, e.g. "Storytelling", "Data-Driven", "Question Hook"'
          ),
        score: z
          .number()
          .min(1)
          .max(10)
          .describe(
            'Predicted engagement score from 1–10 based on hook strength, clarity, and platform fit'
          ),
        hookType: z
          .string()
          .optional()
          .describe(
            'The hook mechanism used, e.g. "Curiosity Gap", "Bold Claim", "Relatable Pain", "Statistic"'
          ),
        platformTip: z
          .string()
          .optional()
          .describe(
            'One platform-specific tactic that will maximize reach for this post, e.g. "Post this as a carousel for 3× swipe-through rate" or "Drop the link in the first comment, not the caption"'
          ),
      })
    )
    .min(3)
    .max(3),
})

export type ContentVariation = z.infer<typeof contentVariationSchema>['variations'][number]
