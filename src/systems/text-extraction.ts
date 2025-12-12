import { Memory, ExtractedText, Platform } from '@/types'

export function extractUserText(memory: Memory): ExtractedText {
  const messages = memory.userMessages || []

  return {
    phrases: extractPhrases(messages),
    questions: extractQuestions(messages),
    commands: extractCommands(messages),
    terms: extractTechnicalTerms(messages),
    breakthroughs: extractBreakthroughs([
      ...messages,
      ...(memory.assistantMessages || []),
    ]),
    date: new Date(memory.timestamp),
    platform: memory.platform,
    topic: memory.topic,
  }
}

function extractPhrases(messages: string[]): string[] {
  return messages
    .flatMap((msg) => {
      // Split into sentences
      const sentences = msg.match(/[^.!?]+[.!?]+/g) || [msg]

      return sentences
        .filter((s) => s.length > 10 && s.length < 200)
        .map((s) => s.trim())
    })
    .slice(0, 20)
}

function extractQuestions(messages: string[]): string[] {
  return messages
    .flatMap((msg) => msg.match(/[^.!?]*\?/g) || [])
    .filter((q) => q.length > 5 && q.length < 150)
    .map((q) => q.trim())
    .slice(0, 10)
}

function extractCommands(messages: string[]): string[] {
  const commandPatterns = [
    /^(create|build|make|show|find|search|help|explain|write|fix|update|add|remove|delete|change|modify|implement|debug|test|run)/i,
  ]

  return messages
    .filter((msg) => commandPatterns.some((pattern) => pattern.test(msg.trim())))
    .map((msg) => msg.slice(0, 100))
    .slice(0, 10)
}

function extractTechnicalTerms(messages: string[]): string[] {
  const allText = messages.join(' ')
  const terms = new Set<string>()

  // Technical vocabulary patterns
  const patterns = [
    /\b[A-Z][a-z]+[A-Z][a-zA-Z]+\b/g, // PascalCase
    /\b[a-z]+_[a-z_]+\b/g, // snake_case
    /\b[a-z]+[A-Z][a-zA-Z]+\b/g, // camelCase
    /\b[A-Z]{2,}\b/g, // ACRONYMS
    /`[^`]+`/g, // Code in backticks
  ]

  patterns.forEach((pattern) => {
    const matches = allText.match(pattern) || []
    matches.forEach((t) => {
      const cleaned = t.replace(/`/g, '')
      if (cleaned.length > 2 && cleaned.length < 30) {
        terms.add(cleaned)
      }
    })
  })

  return Array.from(terms).slice(0, 30)
}

function extractBreakthroughs(messages: string[]): string[] {
  const breakthroughPatterns = [
    /realized/i,
    /figured out/i,
    /understand now/i,
    /this is/i,
    /aha/i,
    /got it/i,
    /makes sense/i,
    /finally/i,
    /breakthrough/i,
    /solved/i,
    /works!/i,
    /perfect/i,
  ]

  return messages
    .filter((msg) => breakthroughPatterns.some((pattern) => pattern.test(msg)))
    .map((msg) => msg.slice(0, 150))
    .slice(0, 5)
}

export function classifyTopic(conversation: string): string {
  const topicKeywords: Record<string, string[]> = {
    coding: [
      'function',
      'code',
      'programming',
      'bug',
      'error',
      'api',
      'database',
      'javascript',
      'python',
      'react',
      'typescript',
    ],
    writing: [
      'write',
      'story',
      'article',
      'blog',
      'content',
      'essay',
      'creative',
      'narrative',
    ],
    research: [
      'research',
      'study',
      'analyze',
      'data',
      'findings',
      'evidence',
      'hypothesis',
    ],
    brainstorm: [
      'idea',
      'brainstorm',
      'think',
      'concept',
      'explore',
      'possibility',
      'what if',
    ],
    learning: [
      'learn',
      'understand',
      'explain',
      'how does',
      'what is',
      'teach',
      'tutorial',
    ],
    planning: [
      'plan',
      'schedule',
      'organize',
      'project',
      'task',
      'goal',
      'roadmap',
    ],
    conversation: [
      'chat',
      'talk',
      'discuss',
      'opinion',
      'think about',
      'feel',
    ],
  }

  const lowerConversation = conversation.toLowerCase()
  const scores: Record<string, number> = {}

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    scores[topic] = keywords.reduce((score, keyword) => {
      const regex = new RegExp(keyword, 'gi')
      const matches = lowerConversation.match(regex)
      return score + (matches?.length || 0)
    }, 0)
  })

  const topTopic = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]

  return topTopic && topTopic[1] > 0 ? topTopic[0] : 'general'
}

export function extractTags(conversation: string): string[] {
  const tags = new Set<string>()

  // Extract hashtag-like patterns
  const hashtags = conversation.match(/#\w+/g) || []
  hashtags.forEach((tag) => tags.add(tag.slice(1).toLowerCase()))

  // Extract common technical terms
  const techTerms = conversation.match(
    /\b(API|UI|UX|CSS|HTML|SQL|JSON|REST|GraphQL|React|Vue|Angular|Node|Python|JavaScript|TypeScript)\b/gi
  )
  techTerms?.forEach((term) => tags.add(term.toLowerCase()))

  // Extract programming concepts
  const concepts = conversation.match(
    /\b(authentication|authorization|database|frontend|backend|deployment|testing|debugging|refactoring|optimization)\b/gi
  )
  concepts?.forEach((concept) => tags.add(concept.toLowerCase()))

  return Array.from(tags).slice(0, 10)
}
