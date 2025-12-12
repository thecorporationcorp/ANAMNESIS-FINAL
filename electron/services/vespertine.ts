/**
 * VESPERTINE - Multi-Fold Compression Engine
 *
 * A sophisticated conversation compression system that reduces
 * conversation size while preserving semantic meaning through:
 * 1. Symbolic abstraction
 * 2. Temporal chaining
 * 3. Semantic compression
 * 4. Pattern recognition
 * 5. Anchor extraction
 */

export interface CompressionResult {
  compressed: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  anchors: Anchor[]
  metadata: CompressionMetadata
}

export interface Anchor {
  type: 'concept' | 'decision' | 'breakthrough' | 'question' | 'code'
  text: string
  position: number
  weight: number
  context: string[]
}

export interface CompressionMetadata {
  symbolsUsed: string[]
  patternsDetected: string[]
  temporalChains: TemporalChain[]
  keyPhrases: string[]
  compressionLevel: number
}

interface TemporalChain {
  sequence: number
  events: string[]
  summary: string
}

// Symbol table for semantic compression
const SYMBOL_MAP: Record<string, string> = {
  // Common programming patterns
  'implement': '⚙',
  'function': 'ƒ',
  'create': '✦',
  'build': '⬡',
  'fix': '⚠',
  'error': '⚡',
  'question': '?',
  'answer': '→',
  'code': '⟨⟩',
  'data': '◆',

  // Cognitive patterns
  'understand': '◉',
  'learn': '◎',
  'realize': '💡',
  'think': '○',
  'decide': '▶',

  // Technical terms (common)
  'api': 'API',
  'database': 'DB',
  'frontend': 'FE',
  'backend': 'BE',
  'react': 'R',
  'typescript': 'TS',
  'javascript': 'JS',
}

// Toki Pona-inspired semantic primitives
const SEMANTIC_PRIMITIVES: Record<string, string> = {
  'create/make/build': 'pali',
  'understand/know/learn': 'sona',
  'want/need/should': 'wile',
  'good/correct/working': 'pona',
  'bad/wrong/broken': 'ike',
  'change/modify/update': 'ante',
  'see/look/show': 'lukin',
  'use/utilize/apply': 'kepeken',
  'give/send/provide': 'pana',
  'think/consider/process': 'pilin',
}

/**
 * VESPERTINE Core Compression Algorithm
 */
export function compressConversation(
  conversation: string,
  level: number = 3
): CompressionResult {
  const originalSize = conversation.length
  const anchors: Anchor[] = []
  const metadata: CompressionMetadata = {
    symbolsUsed: [],
    patternsDetected: [],
    temporalChains: [],
    keyPhrases: [],
    compressionLevel: level,
  }

  // Split into turns
  const turns = conversation.split(/\n\n+/)

  // LAYER 1: Anchor Extraction
  const anchorMap = extractAnchors(turns)
  anchors.push(...anchorMap)

  // LAYER 2: Symbolic Abstraction
  let compressed = symbolicallyAbstract(turns, metadata)

  // LAYER 3: Temporal Chaining
  compressed = temporalChain(compressed, metadata)

  // LAYER 4: Semantic Compression (Toki Pona layer)
  if (level >= 3) {
    compressed = semanticCompress(compressed, metadata)
  }

  // LAYER 5: Pattern Recognition & Deduplication
  compressed = patternRecognize(compressed, metadata)

  // LAYER 6: Final Density Optimization
  compressed = densityOptimize(compressed, anchors)

  const compressedSize = compressed.length
  const compressionRatio = originalSize / compressedSize

  return {
    compressed,
    originalSize,
    compressedSize,
    compressionRatio,
    anchors,
    metadata,
  }
}

/**
 * Extract key anchors from conversation
 */
function extractAnchors(turns: string[]): Anchor[] {
  const anchors: Anchor[] = []
  let position = 0

  for (const turn of turns) {
    // Extract questions
    const questions = turn.match(/[^.!?]*\?/g) || []
    questions.forEach(q => {
      if (q.length > 20 && q.length < 200) {
        anchors.push({
          type: 'question',
          text: q.trim(),
          position,
          weight: 0.8,
          context: extractContext(turn, q),
        })
      }
    })

    // Extract breakthroughs
    if (/realize|figured|understand|aha|got it|this is|finally/i.test(turn)) {
      anchors.push({
        type: 'breakthrough',
        text: turn.slice(0, 150),
        position,
        weight: 1.0,
        context: [],
      })
    }

    // Extract decisions
    if (/decided|going with|will use|chose|let's/i.test(turn)) {
      anchors.push({
        type: 'decision',
        text: turn.slice(0, 150),
        position,
        weight: 0.9,
        context: [],
      })
    }

    // Extract code blocks
    const codeMatches = turn.match(/```[\s\S]*?```/g) || []
    codeMatches.forEach(code => {
      anchors.push({
        type: 'code',
        text: code,
        position,
        weight: 0.7,
        context: [],
      })
    })

    position++
  }

  return anchors
}

/**
 * Layer 1: Symbolic Abstraction
 * Replace common patterns with symbols
 */
function symbolicallyAbstract(
  turns: string[],
  metadata: CompressionMetadata
): string {
  let result = turns.join('\n\n')

  // Apply symbol map
  for (const [word, symbol] of Object.entries(SYMBOL_MAP)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    if (regex.test(result)) {
      result = result.replace(regex, symbol)
      metadata.symbolsUsed.push(symbol)
    }
  }

  return result
}

/**
 * Layer 2: Temporal Chaining
 * Compress sequential related statements
 */
function temporalChain(
  text: string,
  metadata: CompressionMetadata
): string {
  const lines = text.split('\n')
  const chains: string[] = []
  let currentChain: string[] = []
  let chainIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect continuation patterns
    const isContinuation =
      line.startsWith('then') ||
      line.startsWith('next') ||
      line.startsWith('after') ||
      line.startsWith('so') ||
      /^(and|but|however|also)/i.test(line)

    if (isContinuation && currentChain.length > 0) {
      currentChain.push(line)
    } else {
      if (currentChain.length > 2) {
        // Compress chain
        const summary = summarizeChain(currentChain)
        chains.push(summary)
        metadata.temporalChains.push({
          sequence: chainIndex++,
          events: currentChain,
          summary,
        })
        currentChain = []
      } else {
        chains.push(...currentChain)
        currentChain = []
      }
      chains.push(line)
    }
  }

  // Handle remaining chain
  if (currentChain.length > 2) {
    const summary = summarizeChain(currentChain)
    chains.push(summary)
    metadata.temporalChains.push({
      sequence: chainIndex,
      events: currentChain,
      summary,
    })
  } else {
    chains.push(...currentChain)
  }

  return chains.join('\n')
}

/**
 * Summarize a temporal chain
 */
function summarizeChain(chain: string[]): string {
  const first = chain[0].slice(0, 50)
  const last = chain[chain.length - 1].slice(0, 50)
  return `⟨${chain.length}⟩ ${first} → ${last}`
}

/**
 * Layer 3: Semantic Compression
 * Apply Toki Pona-style primitives
 */
function semanticCompress(
  text: string,
  metadata: CompressionMetadata
): string {
  let result = text

  // Apply semantic primitives
  for (const [pattern, primitive] of Object.entries(SEMANTIC_PRIMITIVES)) {
    const words = pattern.split('/')
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(result)) {
        result = result.replace(regex, primitive)
      }
    }
  }

  return result
}

/**
 * Layer 4: Pattern Recognition
 * Detect and compress repeated patterns
 */
function patternRecognize(
  text: string,
  metadata: CompressionMetadata
): string {
  const lines = text.split('\n')
  const patterns: Map<string, number> = new Map()

  // Find repeated phrases (3+ words)
  const phrases = text.match(/\b\w+\s+\w+\s+\w+\b/g) || []
  phrases.forEach(phrase => {
    patterns.set(phrase, (patterns.get(phrase) || 0) + 1)
  })

  // Replace patterns that occur 3+ times
  let result = text
  patterns.forEach((count, pattern) => {
    if (count >= 3) {
      const token = `[P${metadata.patternsDetected.length}]`
      metadata.patternsDetected.push(pattern)
      result = result.replace(new RegExp(pattern, 'g'), token)
    }
  })

  return result
}

/**
 * Layer 5: Density Optimization
 * Final pass to maximize information density
 */
function densityOptimize(
  text: string,
  anchors: Anchor[]
): string {
  let result = text

  // Remove filler words
  const fillers = [
    'basically',
    'actually',
    'literally',
    'just',
    'really',
    'very',
    'quite',
    'pretty',
    'somewhat',
  ]

  fillers.forEach(filler => {
    result = result.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '')
  })

  // Compress whitespace
  result = result.replace(/\n{3,}/g, '\n\n')
  result = result.replace(/  +/g, ' ')

  return result.trim()
}

/**
 * Decompress VESPERTINE-compressed text
 */
export function decompressConversation(
  compressed: string,
  metadata: CompressionMetadata
): string {
  let result = compressed

  // Reverse pattern replacement
  metadata.patternsDetected.forEach((pattern, i) => {
    result = result.replace(new RegExp(`\\[P${i}\\]`, 'g'), pattern)
  })

  // Reverse semantic compression
  for (const [pattern, primitive] of Object.entries(SEMANTIC_PRIMITIVES)) {
    const words = pattern.split('/')
    result = result.replace(new RegExp(primitive, 'g'), words[0])
  }

  // Reverse symbolic abstraction
  for (const [word, symbol] of Object.entries(SYMBOL_MAP)) {
    result = result.replace(new RegExp(symbol, 'g'), word)
  }

  // Expand temporal chains
  metadata.temporalChains.forEach(chain => {
    const token = `⟨${chain.events.length}⟩`
    result = result.replace(token, chain.events.join('\n'))
  })

  return result
}

/**
 * Extract context around a piece of text
 */
function extractContext(text: string, target: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  const targetIndex = sentences.findIndex(s => s.includes(target))

  if (targetIndex === -1) return []

  const context: string[] = []
  if (targetIndex > 0) context.push(sentences[targetIndex - 1])
  if (targetIndex < sentences.length - 1) context.push(sentences[targetIndex + 1])

  return context
}

/**
 * Estimate compression effectiveness
 */
export function analyzeCompressibility(text: string): {
  score: number
  factors: string[]
  recommendation: string
} {
  const factors: string[] = []
  let score = 0

  // Check for repetitive patterns
  const words = text.split(/\s+/)
  const uniqueWords = new Set(words)
  const repetition = 1 - (uniqueWords.size / words.length)

  if (repetition > 0.3) {
    factors.push('High repetition detected')
    score += 30
  }

  // Check for code blocks
  const codeBlocks = (text.match(/```/g) || []).length / 2
  if (codeBlocks > 2) {
    factors.push('Multiple code blocks')
    score += 20
  }

  // Check for temporal chains
  const chainWords = (text.match(/\b(then|next|after|so)\b/gi) || []).length
  if (chainWords > 5) {
    factors.push('Strong temporal structure')
    score += 25
  }

  // Check for questions
  const questions = (text.match(/\?/g) || []).length
  if (questions > 3) {
    factors.push('Question-answer format')
    score += 15
  }

  let recommendation = 'Standard compression'
  if (score > 60) recommendation = 'High compression recommended'
  else if (score > 40) recommendation = 'Moderate compression optimal'
  else recommendation = 'Light compression sufficient'

  return { score, factors, recommendation }
}
