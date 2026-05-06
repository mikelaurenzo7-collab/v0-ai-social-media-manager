import { z } from 'zod'

export const threadTweetSchema = z.object({
  number: z.number().describe('Position in the thread (1-based)'),
  content: z
    .string()
    .max(280)
    .describe('Tweet content, must be 280 characters or fewer'),
  type: z
    .enum(['hook', 'content', 'bridge', 'cta'])
    .describe('Role of this tweet: hook (opening), content (body), bridge (transitions), cta (closing call-to-action)'),
  tip: z
    .string()
    .optional()
    .describe('A brief note explaining why this tweet is structured this way'),
})

export const threadSchema = z.object({
  title: z.string().describe('A short descriptor of the thread topic'),
  tweets: z.array(threadTweetSchema).min(3).max(15),
  engagementTip: z
    .string()
    .describe('One key tactic to maximize replies, retweets, or follows from this thread'),
})

export type ThreadTweet = z.infer<typeof threadTweetSchema>
export type Thread = z.infer<typeof threadSchema>
