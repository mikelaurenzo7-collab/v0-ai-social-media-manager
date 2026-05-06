/**
 * PostPilot AI Prompt Builder
 * 
 * Constructs rich, context-aware system prompts by combining
 * platform intelligence, user persona, tone, and content type
 * into a deeply informed AI instruction set.
 */

import { PLATFORM_INTELLIGENCE, type PlatformIntelligenceId } from './platform-intelligence'
import { USER_PERSONAS, type PersonaId } from './persona-engine'

interface PromptConfig {
  platforms: PlatformIntelligenceId[]
  persona: PersonaId
  tone: string
  contentType: string
  prompt: string
  brandContext?: string
}

export function buildSystemPrompt(config: PromptConfig): string {
  const { platforms, persona, tone, contentType } = config
  const personaData = USER_PERSONAS[persona]

  // Build platform-specific instructions
  const platformSections = platforms.map((pid) => {
    const p = PLATFORM_INTELLIGENCE[pid]
    const voiceGuide = p.voiceGuidelines[tone as keyof typeof p.voiceGuidelines] || p.voiceGuidelines.casual

    return `
### ${p.name} (${p.charLimit} char limit)
Algorithm priorities: ${p.algorithm.priorities.slice(0, 3).join('; ')}
Best formats: ${p.algorithm.bestFormats.join(', ')}
Content rules:
${p.contentRules.map((r) => `- ${r}`).join('\n')}
Voice for "${tone}" tone on ${p.name}: ${voiceGuide}
`
  }).join('\n')

  // Build the content type context
  const contentTypeInstructions = getContentTypeInstructions(contentType)

  const systemPrompt = `You are PostPilot AI, an elite social media content strategist. You don't just write posts - you engineer content that performs.

## Your Role
${personaData.promptEnhancement}

## Content Strategy Context
User type: ${personaData.name}
Primary goals: ${personaData.goals.slice(0, 3).join(', ')}
Content pillars: ${personaData.contentStrategy.pillars.join(', ')}

## Platform-Specific Intelligence
${platformSections}

## Content Type: ${contentType}
${contentTypeInstructions}

## Tone: ${tone}
Maintain this tone consistently across all variations while adapting to each platform's culture.

## Quality Standards
1. NEVER use generic filler or placeholder content
2. Every sentence must earn its place - cut ruthlessly
3. Hooks must stop the scroll in the first 5-7 words
4. Hashtags must be researched-quality: mix of popular (100K-1M posts), niche (10K-100K), and specific
5. Each variation must take a genuinely different creative angle, not just rephrase
6. Content must feel native to each platform - not cross-posted
7. Include at least one engagement driver per post (question, CTA, controversy, curiosity gap)
8. Adapt content length to platform norms (short for X, medium-long for Instagram, conversational for Facebook)
${config.brandContext ? `\n## Brand Context\n${config.brandContext}` : ''}
`

  return systemPrompt
}

export function buildUserPrompt(config: PromptConfig): string {
  const platformNames = config.platforms.map(
    (p) => PLATFORM_INTELLIGENCE[p].name
  ).join(' and ')

  return `Create 3 unique social media post variations for the following idea:

"${config.prompt}"

Requirements:
- Each variation must take a genuinely DIFFERENT creative angle (not just rewording)
- Variation 1: The direct, punchy approach - lead with the strongest hook
- Variation 2: The storytelling approach - use narrative or personal angle
- Variation 3: The value-first approach - lead with the benefit to the audience
- Optimize content length for each target platform (${platformNames})
- Include platform-appropriate hashtags that a real social media manager would use
- Make every word count - no filler, no generic phrases
- Each post should be ready to publish as-is`
}

function getContentTypeInstructions(contentType: string): string {
  const instructions: Record<string, string> = {
    promotional: `This is promotional content. Key rules:
- Lead with the benefit, not the feature
- Create urgency or exclusivity without being pushy
- Include a clear but natural call-to-action
- Social proof (numbers, testimonials, results) strengthens credibility
- Don't sound like an ad - sound like a recommendation from a friend`,

    educational: `This is educational content. Key rules:
- Open with a surprising fact, common misconception, or "most people don't know" hook
- Break complex ideas into digestible pieces
- Use numbered lists, frameworks, or step-by-step formats
- End with a takeaway the reader can apply immediately
- Position the author as a helpful expert, not a lecturer`,

    entertaining: `This is entertaining content. Key rules:
- Hook must be immediately attention-grabbing
- Use unexpected angles, wordplay, or cultural references
- Relatable > random - connect humor to shared experiences
- Keep the energy high and pacing quick
- End with something shareable - people share what makes them look good`,

    personal: `This is personal/authentic content. Key rules:
- Start with a specific moment or detail, not a general statement
- Show vulnerability or real emotion - perfect is boring
- Include sensory details and specific context
- Connect the personal to something universal the audience relates to
- End with a reflection, lesson, or genuine question`,

    announcement: `This is announcement content. Key rules:
- Lead with the "what" and "why it matters to you"
- Create excitement without overpromising
- Include specific details: dates, links, next steps
- Build anticipation if it's a future event
- Make the audience feel like insiders getting early access`,
  }

  return instructions[contentType] || instructions.promotional
}
