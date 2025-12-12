/**
 * SPINE - Semantic Personality INtegration Engine
 *
 * Generates context-rich seeds for continuing conversations
 * across different LLMs while preserving:
 * - Core concepts
 * - Communication style
 * - Decision history
 * - Project context
 * - Personality traits
 */

import { Memory } from '../../src/types'
import { Anchor } from './vespertine'

export interface SpineSeed {
  version: string
  generated: Date
  memory: {
    id: string
    title: string
    platform: string
    date: Date
  }
  context: {
    summary: string
    domain: string
    goals: string[]
    constraints: string[]
  }
  anchors: {
    concepts: string[]
    decisions: string[]
    breakthroughs: string[]
    questions: string[]
    codePatterns: string[]
  }
  personality: {
    communicationStyle: string
    expertise: string[]
    preferences: string[]
  }
  continuation: {
    lastExchange: string
    nextSteps: string[]
    openQuestions: string[]
  }
  metadata: {
    wordCount: number
    turnCount: number
    compressionRatio: number
    confidence: number
  }
  seed: string
}

/**
 * Generate a SPINE seed from a memory
 */
export function generateSpineSeed(
  memory: Memory,
  anchors?: Anchor[]
): SpineSeed {
  // Analyze the conversation
  const analysis = analyzeConversation(memory)

  // Extract personality traits
  const personality = extractPersonality(memory)

  // Build context
  const context = buildContext(memory, analysis)

  // Extract key elements
  const extractedAnchors = extractKeyAnchors(memory, anchors)

  // Determine continuation points
  const continuation = determineContinuation(memory, analysis)

  // Generate the actual seed text
  const seed = assembleSeed({
    memory,
    context,
    anchors: extractedAnchors,
    personality,
    continuation,
    analysis,
  })

  return {
    version: '1.0.0',
    generated: new Date(),
    memory: {
      id: memory.id,
      title: memory.title,
      platform: memory.platform,
      date: new Date(memory.timestamp),
    },
    context,
    anchors: extractedAnchors,
    personality,
    continuation,
    metadata: {
      wordCount: memory.metadata?.wordCount || 0,
      turnCount: memory.metadata?.turnCount || 0,
      compressionRatio: 1.0,
      confidence: calculateConfidence(memory, analysis),
    },
    seed,
  }
}

/**
 * Analyze conversation structure and content
 */
function analyzeConversation(memory: Memory) {
  const userMessages = memory.userMessages || []
  const assistantMessages = memory.assistantMessages || []

  return {
    primaryTopic: detectPrimaryTopic(memory.conversation),
    secondaryTopics: detectSecondaryTopics(memory.conversation),
    conversationType: classifyConversationType(memory.conversation),
    technicalDepth: assessTechnicalDepth(memory.conversation),
    progressionType: detectProgression(userMessages, assistantMessages),
    outcomeType: detectOutcome(memory.conversation),
    keyTerms: extractKeyTerms(memory.conversation),
  }
}

/**
 * Extract user personality and communication style
 */
function extractPersonality(memory: Memory) {
  const userMessages = memory.userMessages.join(' ')

  return {
    communicationStyle: detectCommunicationStyle(userMessages),
    expertise: detectExpertiseLevel(userMessages),
    preferences: detectPreferences(userMessages),
  }
}

/**
 * Build rich context object
 */
function buildContext(memory: Memory, analysis: any) {
  return {
    summary: generateSummary(memory, analysis),
    domain: analysis.primaryTopic,
    goals: extractGoals(memory.userMessages),
    constraints: extractConstraints(memory.conversation),
  }
}

/**
 * Extract key anchors from conversation
 */
function extractKeyAnchors(memory: Memory, providedAnchors?: Anchor[]) {
  const conversation = memory.conversation

  return {
    concepts: extractConcepts(conversation),
    decisions: extractDecisions(conversation),
    breakthroughs: extractBreakthroughs(conversation),
    questions: extractOpenQuestions(memory.userMessages),
    codePatterns: extractCodePatterns(conversation),
  }
}

/**
 * Determine how to continue the conversation
 */
function determineContinuation(memory: Memory, analysis: any) {
  const lastUserMessage = memory.userMessages[memory.userMessages.length - 1] || ''
  const lastAssistantMessage =
    memory.assistantMessages[memory.assistantMessages.length - 1] || ''

  return {
    lastExchange: `${lastUserMessage}\n\n${lastAssistantMessage}`,
    nextSteps: suggestNextSteps(memory, analysis),
    openQuestions: extractOpenQuestions(memory.userMessages),
  }
}

/**
 * Assemble the final SPINE seed text
 */
function assembleSeed(data: {
  memory: Memory
  context: any
  anchors: any
  personality: any
  continuation: any
  analysis: any
}): string {
  const { memory, context, anchors, personality, continuation, analysis } = data

  const sections: string[] = []

  // Header
  sections.push('# SPINE SEED v1.0')
  sections.push(`Generated: ${new Date().toISOString()}`)
  sections.push(`Source: ${memory.platform} | ${memory.title}`)
  sections.push('')

  // Context Section
  sections.push('## CONTEXT')
  sections.push(`Domain: ${context.domain}`)
  sections.push(`Type: ${analysis.conversationType}`)
  sections.push('')
  sections.push('### Summary')
  sections.push(context.summary)
  sections.push('')

  if (context.goals.length > 0) {
    sections.push('### Goals')
    context.goals.forEach((goal: string) => sections.push(`- ${goal}`))
    sections.push('')
  }

  // Core Concepts
  if (anchors.concepts.length > 0) {
    sections.push('## CORE CONCEPTS')
    anchors.concepts.forEach((concept: string) =>
      sections.push(`- **${concept}**`)
    )
    sections.push('')
  }

  // Key Decisions
  if (anchors.decisions.length > 0) {
    sections.push('## DECISIONS MADE')
    anchors.decisions.forEach((decision: string) =>
      sections.push(`- ${decision}`)
    )
    sections.push('')
  }

  // Breakthroughs
  if (anchors.breakthroughs.length > 0) {
    sections.push('## BREAKTHROUGHS')
    anchors.breakthroughs.forEach((breakthrough: string) =>
      sections.push(`- ${breakthrough}`)
    )
    sections.push('')
  }

  // Code Patterns (if technical)
  if (anchors.codePatterns.length > 0) {
    sections.push('## CODE PATTERNS')
    anchors.codePatterns.forEach((pattern: string) => sections.push(pattern))
    sections.push('')
  }

  // Communication Style
  sections.push('## USER PROFILE')
  sections.push(`Style: ${personality.communicationStyle}`)
  sections.push(`Expertise: ${personality.expertise.join(', ')}`)
  if (personality.preferences.length > 0) {
    sections.push('Preferences:')
    personality.preferences.forEach((pref: string) =>
      sections.push(`- ${pref}`)
    )
  }
  sections.push('')

  // Last Exchange (critical for continuity)
  sections.push('## LAST EXCHANGE')
  sections.push('```')
  sections.push(continuation.lastExchange.slice(-1000))
  sections.push('```')
  sections.push('')

  // Open Questions
  if (continuation.openQuestions.length > 0) {
    sections.push('## OPEN QUESTIONS')
    continuation.openQuestions.forEach((q: string) => sections.push(`- ${q}`))
    sections.push('')
  }

  // Next Steps
  if (continuation.nextSteps.length > 0) {
    sections.push('## SUGGESTED NEXT STEPS')
    continuation.nextSteps.forEach((step: string) =>
      sections.push(`${step}`)
    )
    sections.push('')
  }

  // Continuation Prompt
  sections.push('---')
  sections.push('')
  sections.push('## CONTINUATION PROMPT')
  sections.push(
    'I previously worked on this with another AI assistant. Above is the context and progress so far.'
  )
  sections.push(
    `Please help me continue from where we left off. I'm specifically interested in ${continuation.nextSteps[0] || 'progressing further'}.`
  )

  return sections.join('\n')
}

// Helper functions

function detectPrimaryTopic(text: string): string {
  const topics: Record<string, string[]> = {
    'Software Development': [
      'code',
      'function',
      'api',
      'programming',
      'development',
      'application',
    ],
    'Web Development': ['react', 'html', 'css', 'frontend', 'website', 'ui'],
    'Data Science': ['data', 'analysis', 'model', 'training', 'dataset'],
    'AI/ML': ['neural', 'learning', 'model', 'ai', 'algorithm', 'training'],
    Writing: ['story', 'article', 'content', 'write', 'draft'],
    'Problem Solving': ['solve', 'issue', 'problem', 'debug', 'fix'],
    Learning: ['learn', 'understand', 'explain', 'how does', 'what is'],
    Planning: ['plan', 'strategy', 'organize', 'schedule', 'roadmap'],
  }

  let maxScore = 0
  let primaryTopic = 'General'

  for (const [topic, keywords] of Object.entries(topics)) {
    const score = keywords.reduce(
      (sum, kw) =>
        sum + (text.toLowerCase().match(new RegExp(kw, 'g')) || []).length,
      0
    )
    if (score > maxScore) {
      maxScore = score
      primaryTopic = topic
    }
  }

  return primaryTopic
}

function detectSecondaryTopics(text: string): string[] {
  // Similar to primary but return top 3
  return []
}

function classifyConversationType(text: string): string {
  if (/\?.*\?.*\?/s.test(text)) return 'Q&A Session'
  if (/create|build|make.*step.*step/i.test(text)) return 'Tutorial'
  if (/bug|error|fix|issue/i.test(text)) return 'Troubleshooting'
  if (/idea|brainstorm|what if/i.test(text)) return 'Ideation'
  if (/explain|understand|how does/i.test(text)) return 'Learning'
  return 'Discussion'
}

function assessTechnicalDepth(text: string): string {
  const technicalTerms = (
    text.match(
      /\b(api|database|algorithm|architecture|implementation|interface|protocol)\b/gi
    ) || []
  ).length
  const codeBlocks = (text.match(/```/g) || []).length / 2

  if (technicalTerms > 10 || codeBlocks > 3) return 'Advanced'
  if (technicalTerms > 5 || codeBlocks > 1) return 'Intermediate'
  return 'Beginner-friendly'
}

function detectProgression(
  userMessages: string[],
  assistantMessages: string[]
): string {
  const firstUser = userMessages[0] || ''
  const lastUser = userMessages[userMessages.length - 1] || ''

  if (/thanks|perfect|got it|understood/i.test(lastUser)) return 'Resolved'
  if (/still|another|also|what about/i.test(lastUser))
    return 'Iterative exploration'
  if (userMessages.length === 1) return 'Single query'
  return 'Multi-turn dialogue'
}

function detectOutcome(text: string): string {
  if (/perfect|exactly|this works|solved/i.test(text)) return 'Success'
  if (/still not|doesn't work|error/i.test(text)) return 'Unresolved'
  return 'In progress'
}

function extractKeyTerms(text: string): string[] {
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
  const frequency: Record<string, number> = {}

  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .filter(([word, count]) => count > 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

function detectCommunicationStyle(text: string): string {
  const hasQuestions = (text.match(/\?/g) || []).length
  const avgWordLength =
    text.split(/\s+/).reduce((sum, w) => sum + w.length, 0) /
    text.split(/\s+/).length

  if (hasQuestions > 5) return 'Inquisitive and exploratory'
  if (avgWordLength > 6) return 'Formal and technical'
  if (/please|thank|appreciate/i.test(text)) return 'Polite and collaborative'
  return 'Direct and concise'
}

function detectExpertiseLevel(text: string): string[] {
  const expertise: string[] = []

  if (/typescript|generics|interface/i.test(text))
    expertise.push('TypeScript')
  if (/react|component|hook|jsx/i.test(text)) expertise.push('React')
  if (/node|express|backend/i.test(text)) expertise.push('Backend')
  if (/algorithm|complexity|optimize/i.test(text))
    expertise.push('Algorithms')
  if (/design|ui|ux|layout/i.test(text)) expertise.push('Design')

  return expertise.length > 0 ? expertise : ['General']
}

function detectPreferences(text: string): string[] {
  const prefs: string[] = []

  if (/step.*step|explain.*detail/i.test(text))
    prefs.push('Detailed explanations')
  if (/example|show me/i.test(text)) prefs.push('Code examples')
  if (/why|reason|because/i.test(text)) prefs.push('Understanding rationale')
  if (/best practice|recommended/i.test(text))
    prefs.push('Best practices')

  return prefs
}

function generateSummary(memory: Memory, analysis: any): string {
  const firstMessage = memory.userMessages[0] || ''
  const topic = analysis.primaryTopic
  const type = analysis.conversationType

  return `A ${type.toLowerCase()} about ${topic.toLowerCase()}, starting with: "${firstMessage.slice(0, 100)}${firstMessage.length > 100 ? '...' : ''}"`
}

function extractGoals(userMessages: string[]): string[] {
  const goals: string[] = []

  userMessages.forEach(msg => {
    if (/want to|need to|trying to|goal is/i.test(msg)) {
      const match = msg.match(/(want|need|trying) to ([^.!?]+)/i)
      if (match) goals.push(match[2])
    }
    if (/help me|can you/i.test(msg)) {
      const match = msg.match(/(help me|can you) ([^.!?]+)/i)
      if (match) goals.push(match[2])
    }
  })

  return goals.slice(0, 5)
}

function extractConstraints(text: string): string[] {
  const constraints: string[] = []

  if (/must|required|need to/i.test(text)) {
    const matches = text.match(/(must|required|need to) ([^.!?]+)/gi) || []
    matches.forEach(m => constraints.push(m))
  }

  return constraints.slice(0, 5)
}

function extractConcepts(text: string): string[] {
  const concepts = new Set<string>()

  // Technical terms
  const technical =
    text.match(
      /\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g // PascalCase
    ) || []
  technical.forEach(t => concepts.add(t))

  // Capitalized terms
  const capitalized = text.match(/\b[A-Z]{2,}\b/g) || []
  capitalized.forEach(t => {
    if (t.length > 2) concepts.add(t)
  })

  return Array.from(concepts).slice(0, 10)
}

function extractDecisions(text: string): string[] {
  const decisions: string[] = []

  const patterns = [
    /(decided to|going with|will use|chose to|opting for) ([^.!?]+)/gi,
  ]

  patterns.forEach(pattern => {
    const matches = text.match(pattern) || []
    matches.forEach(m => decisions.push(m.slice(0, 100)))
  })

  return decisions.slice(0, 5)
}

function extractBreakthroughs(text: string): string[] {
  const breakthroughs: string[] = []

  const patterns = [
    /(realized|figured out|understand now|aha|got it|this is it) ([^.!?]+)/gi,
  ]

  patterns.forEach(pattern => {
    const matches = text.match(pattern) || []
    matches.forEach(m => breakthroughs.push(m.slice(0, 100)))
  })

  return breakthroughs.slice(0, 5)
}

function extractOpenQuestions(userMessages: string[]): string[] {
  const questions: string[] = []

  userMessages.forEach(msg => {
    const qs = msg.match(/[^.!?]*\?/g) || []
    qs.forEach(q => {
      if (q.length > 20 && q.length < 150) {
        questions.push(q.trim())
      }
    })
  })

  return questions.slice(-3) // Last 3 questions
}

function extractCodePatterns(text: string): string[] {
  const codeBlocks = text.match(/```[\s\S]*?```/g) || []
  return codeBlocks.slice(0, 3)
}

function suggestNextSteps(memory: Memory, analysis: any): string[] {
  const steps: string[] = []
  const lastMessage = memory.userMessages[memory.userMessages.length - 1] || ''

  if (/how do|how can/i.test(lastMessage)) {
    steps.push('Continue with implementation details')
  }
  if (/error|bug|issue/i.test(lastMessage)) {
    steps.push('Debug and resolve the issue')
  }
  if (/next|then|after/i.test(lastMessage)) {
    steps.push('Proceed to the next phase')
  }

  if (steps.length === 0) {
    steps.push(`Continue exploring ${analysis.primaryTopic}`)
  }

  return steps
}

function calculateConfidence(memory: Memory, analysis: any): number {
  let confidence = 0.5

  // More turns = higher confidence
  if ((memory.metadata?.turnCount || 0) > 5) confidence += 0.2

  // Resolved outcomes = higher confidence
  if (analysis.outcomeType === 'Success') confidence += 0.2

  // Technical depth = higher confidence in context
  if (analysis.technicalDepth === 'Advanced') confidence += 0.1

  return Math.min(confidence, 1.0)
}

/**
 * Export SPINE seed as file
 */
export function exportSpineSeed(seed: SpineSeed): string {
  return seed.seed
}

/**
 * Validate SPINE seed
 */
export function validateSpineSeed(seedText: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!seedText.includes('# SPINE SEED')) {
    errors.push('Missing SPINE header')
  }

  if (!seedText.includes('## CONTEXT')) {
    errors.push('Missing context section')
  }

  if (!seedText.includes('## CONTINUATION PROMPT')) {
    errors.push('Missing continuation prompt')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
