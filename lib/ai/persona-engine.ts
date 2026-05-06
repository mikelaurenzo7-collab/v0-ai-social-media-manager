/**
 * PostPilot AI Persona Engine
 * 
 * Understands the goals, language, and content strategy
 * of different user types - from solo creators to Fortune 500 brands.
 */

export const USER_PERSONAS = {
  influencer: {
    id: 'influencer',
    name: 'Creator / Influencer',
    description: 'Content creators building a personal brand and engaged audience',
    icon: 'star',
    goals: [
      'Grow follower count and engagement rate',
      'Build authentic connection with audience',
      'Monetize through brand deals and partnerships',
      'Maintain consistent posting schedule',
      'Stand out in a crowded niche',
    ],
    contentStrategy: {
      pillars: ['Personal stories', 'Niche expertise', 'Audience interaction', 'Trend participation'],
      frequency: '1-3 posts per day across platforms',
      engagement: 'Reply to comments, create community, host Q&As',
    },
    promptEnhancement: `You are writing as a content creator/influencer building a personal brand.
- Write in first person with a strong personal voice
- Include relatable personal anecdotes and opinions  
- Use hooks that create curiosity or emotional connection
- Content should feel authentic, not corporate or polished
- Include engagement drivers: questions, polls, hot takes
- Reference trends when natural but don't force it
- Balance value-giving content with personality-driven content
- Use "I" and "me" naturally - this is personal brand content
- Create content that makes followers feel like insiders`,
  },
  business_small: {
    id: 'business_small',
    name: 'Small Business',
    description: 'Local shops, startups, and small teams building brand awareness',
    icon: 'store',
    goals: [
      'Drive foot traffic or website visits',
      'Build local community awareness',
      'Showcase products and services',
      'Generate leads and conversions',
      'Compete with bigger brands through authenticity',
    ],
    contentStrategy: {
      pillars: ['Behind-the-scenes', 'Customer stories', 'Product showcases', 'Local community'],
      frequency: '3-5 posts per week',
      engagement: 'Respond to reviews, share customer content, support local',
    },
    promptEnhancement: `You are writing for a small business building community trust.
- Balance promotional content with genuine value
- Showcase the human side - team stories, behind-the-scenes, process
- Include soft CTAs that don't feel salesy (visit us, check out, learn more)
- Use "we" language to create team/community feel
- Highlight what makes this business unique vs competitors
- Include local and community-oriented messaging when relevant
- Customer testimonials and success stories resonate strongly
- Make products/services feel approachable, not premium-intimidating
- Focus on solving real problems the audience has`,
  },
  business_enterprise: {
    id: 'business_enterprise',
    name: 'Enterprise / Agency',
    description: 'Established brands, agencies managing multiple accounts, large teams',
    icon: 'building',
    goals: [
      'Maintain brand consistency at scale',
      'Drive measurable ROI from social',
      'Thought leadership and industry authority',
      'Crisis communication readiness',
      'Multi-market / multi-audience targeting',
    ],
    contentStrategy: {
      pillars: ['Thought leadership', 'Industry insights', 'Company culture', 'Product launches'],
      frequency: '1-2 posts per day per platform',
      engagement: 'Professional community management, influencer partnerships',
    },
    promptEnhancement: `You are writing for an established brand or enterprise company.
- Maintain a polished, consistent brand voice
- Focus on thought leadership and industry expertise
- Use data, statistics, and research to back up claims
- Keep messaging inclusive and accessible to broad audiences
- Avoid slang or overly casual language unless the brand warrants it
- Include clear value propositions and strategic CTAs
- Content should position the brand as an industry leader
- Balance corporate professionalism with genuine human warmth
- Consider multiple audience segments in messaging`,
  },
  personal: {
    id: 'personal',
    name: 'Personal User',
    description: 'Individuals sharing their life, hobbies, or building a side presence',
    icon: 'user',
    goals: [
      'Share life updates with friends and network',
      'Build a professional online presence',
      'Explore content creation as a hobby',
      'Network and connect with like-minded people',
      'Document personal journey or passion project',
    ],
    contentStrategy: {
      pillars: ['Personal updates', 'Interests and hobbies', 'Professional insights', 'Life moments'],
      frequency: '2-4 posts per week',
      engagement: 'Natural conversations with friends and connections',
    },
    promptEnhancement: `You are writing for someone sharing their personal life and interests online.
- Keep it genuine and conversational - like texting a friend
- Don't over-optimize for engagement - authenticity matters most
- Share real opinions and experiences, not just polished moments
- Use natural language, avoid marketing-speak entirely
- Include personal reflections and genuine reactions
- It's okay to be vulnerable, funny, or imperfect
- Write like a real person, not a brand
- Reference real life context: weekends, seasons, daily experiences
- Keep it short and natural unless sharing a meaningful story`,
  },
  freelancer: {
    id: 'freelancer',
    name: 'Freelancer / Consultant',
    description: 'Independent professionals showcasing expertise and attracting clients',
    icon: 'briefcase',
    goals: [
      'Attract high-quality client leads',
      'Demonstrate expertise and build authority',
      'Network with industry peers',
      'Share portfolio and case studies',
      'Build a personal brand as a trusted expert',
    ],
    contentStrategy: {
      pillars: ['Expertise showcase', 'Client wins', 'Industry insights', 'Process transparency'],
      frequency: '3-5 posts per week',
      engagement: 'Thoughtful comments on industry posts, networking',
    },
    promptEnhancement: `You are writing as a freelancer/consultant building authority in their field.
- Position the author as a knowledgeable, approachable expert
- Share practical tips and frameworks from real experience
- Include "lessons learned" and "mistakes to avoid" content
- Use case studies and client results (anonymized when needed)
- Balance teaching with subtle credibility signals
- Write like a trusted advisor, not a salesperson
- Include actionable takeaways in every post
- "Here's what I'd tell a client..." framing works well
- Demonstrate thought process and expertise naturally`,
  },
} as const

export type PersonaId = keyof typeof USER_PERSONAS
