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
      })
    )
    .min(3)
    .max(3),
})

export type ContentVariation = z.infer<typeof contentVariationSchema>['variations'][number]
