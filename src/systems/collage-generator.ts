import { Memory, CollageLayout, HandwrittenNote, PhotoElement, TapePiece } from '@/types'
import { extractTags, classifyTopic } from './text-extraction'

export function generateCollageLayout(memory: Memory): CollageLayout {
  // Parse conversation
  const lines = memory.conversation.split('\n')
  const userMessages = lines.filter((l) => l.startsWith('USER:'))
  const assistantMessages = lines.filter((l) => l.startsWith('ASSISTANT:'))

  // Extract key elements
  const keyPhrases = extractKeyPhrases(userMessages)
  const breakthroughs = extractBreakthroughs(assistantMessages)
  const codeSnippets = extractCode(memory.conversation)
  const decisions = extractDecisions(memory.conversation)

  return {
    // Main conversation block (center-left)
    mainText: {
      content: memory.conversation,
      position: { x: 80, y: 140 },
      width: 550,
      rotation: randomInRange(-2, 1),
      font: 'CourierPrime',
      size: 14,
      lineHeight: 1.6,
    },

    // Handwritten notes scattered around
    notes: generateNotes(keyPhrases, breakthroughs, decisions),

    // Visual elements (code, diagrams)
    photos: generatePhotos(codeSnippets),

    // Tape pieces for visual interest
    tape: generateTapePieces(6),

    // Date stamp position
    dateStamp: {
      x: 1100,
      y: 750,
      rotation: randomInRange(-8, -3),
    },

    // Platform label position
    platformLabel: {
      x: 120,
      y: 780,
      rotation: randomInRange(-3, 3),
    },
  }
}

function extractKeyPhrases(messages: string[]): string[] {
  return messages
    .map((m) => m.replace('USER:', '').trim())
    .filter((m) => m.length > 20 && m.length < 150)
    .slice(0, 5)
}

function extractBreakthroughs(messages: string[]): string[] {
  const patterns = [
    /here's|here is|solution|answer|result/i,
    /you can|you could|try|consider/i,
    /important|key|crucial|essential/i,
  ]

  return messages
    .map((m) => m.replace('ASSISTANT:', '').trim())
    .filter((m) => patterns.some((p) => p.test(m)))
    .map((m) => {
      // Extract just the key insight (first sentence or clause)
      const firstSentence = m.match(/^[^.!?]+[.!?]/)
      return firstSentence ? firstSentence[0] : m.slice(0, 100)
    })
    .slice(0, 3)
}

function extractCode(conversation: string): string[] {
  const codeBlocks = conversation.match(/```[\s\S]*?```/g) || []
  return codeBlocks
    .map((block) => block.replace(/```\w*\n?/g, '').trim())
    .filter((code) => code.length > 20 && code.length < 500)
    .slice(0, 2)
}

function extractDecisions(conversation: string): string[] {
  const decisionPatterns = [
    /decided to/i,
    /going with/i,
    /choosing/i,
    /will use/i,
    /best approach/i,
    /let's/i,
  ]

  const sentences = conversation.match(/[^.!?]+[.!?]+/g) || []

  return sentences
    .filter((s) => decisionPatterns.some((p) => p.test(s)))
    .map((s) => s.trim())
    .slice(0, 3)
}

function generateNotes(
  keyPhrases: string[],
  breakthroughs: string[],
  decisions: string[]
): HandwrittenNote[] {
  const notes: HandwrittenNote[] = []

  // Key phrases as blue notes
  keyPhrases.slice(0, 2).forEach((phrase, i) => {
    notes.push({
      text: phrase.length > 80 ? phrase.slice(0, 80) + '...' : phrase,
      position: {
        x: 680 + i * 100,
        y: 100 + i * 150,
      },
      rotation: randomInRange(-5, 5),
      color: '#2563eb',
      font: 'DancingScript',
    })
  })

  // Breakthroughs as red notes
  breakthroughs.slice(0, 1).forEach((b, i) => {
    notes.push({
      text: b.length > 60 ? b.slice(0, 60) + '...' : b,
      position: {
        x: 750,
        y: 380 + i * 120,
      },
      rotation: randomInRange(-3, 4),
      color: '#dc2626',
      font: 'DancingScript',
    })
  })

  // Decisions as green notes
  decisions.slice(0, 1).forEach((d, i) => {
    notes.push({
      text: d.length > 70 ? d.slice(0, 70) + '...' : d,
      position: {
        x: 180,
        y: 550 + i * 100,
      },
      rotation: randomInRange(-2, 3),
      color: '#16a34a',
      font: 'DancingScript',
    })
  })

  return notes
}

function generatePhotos(codeSnippets: string[]): PhotoElement[] {
  const photos: PhotoElement[] = []

  // Add code snippets as "photos"
  codeSnippets.forEach((code, i) => {
    photos.push({
      type: 'code-snippet',
      src: code,
      position: {
        x: 820 + i * 50,
        y: 200 + i * 180,
      },
      size: {
        width: 350,
        height: 200,
      },
      rotation: randomInRange(-4, 4),
    })
  })

  // Add a placeholder if no code
  if (photos.length === 0) {
    photos.push({
      type: 'placeholder',
      src: '',
      position: { x: 900, y: 280 },
      size: { width: 280, height: 200 },
      rotation: randomInRange(-3, 3),
    })
  }

  return photos
}

function generateTapePieces(count: number): TapePiece[] {
  const positions = [
    { x: 200, y: 130 },
    { x: 600, y: 160 },
    { x: 850, y: 200 },
    { x: 400, y: 500 },
    { x: 950, y: 450 },
    { x: 300, y: 700 },
  ]

  return positions.slice(0, count).map((pos, i) => ({
    position: pos,
    rotation: randomInRange(0, 180),
    length: randomInRange(60, 100),
  }))
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
