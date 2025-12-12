import { Memory, MonitorStyle, MonitorStyleType } from '@/types'

// Color palettes for each style
const PALETTES = {
  cartoon: ['#ffeb3b', '#ff9800', '#e91e63', '#9c27b0'],
  sitcom: ['#5d4e6d', '#8b7da7', '#bfacc8', '#e3d8eb'],
  tutorial: ['#ff6b9d', '#c44569', '#ff8ba7', '#ffc2d1'],
  cyberpunk: ['#00f0ff', '#ff00aa', '#0066ff', '#9900ff'],
  terminal: ['#00ff00', '#003300', '#00cc00', '#006600'],
  glitch: ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'],
  emergency: ['#ff0000', '#ffcc00', '#ff3300', '#ff6600'],
  news: ['#1e3a5f', '#00a8e8', '#ffd700', '#ffffff'],
  static: ['#808080', '#a0a0a0', '#606060', '#c0c0c0'],
}

export function deriveMonitorStyle(memory: Memory): MonitorStyle {
  const type = classifyMonitorType(memory)
  const palette = PALETTES[type]

  return {
    type,
    palette,
    animation: getAnimationType(type),
    flicker: shouldFlicker(type, memory),
    flickerSpeed: getFlickerSpeed(type),
    scanlines: shouldHaveScanlines(type),
    noiseLevel: getNoiseLevel(type),
  }
}

function classifyMonitorType(memory: Memory): MonitorStyleType {
  const text = memory.conversation.toLowerCase()
  const topic = memory.topic?.toLowerCase() || ''
  const tags = memory.tags || []

  // Check for code-related content
  if (
    text.includes('function') ||
    text.includes('const ') ||
    text.includes('import ') ||
    text.includes('```') ||
    tags.some((t) => ['code', 'programming', 'development'].includes(t))
  ) {
    return 'terminal'
  }

  // Check for questions/learning
  if (
    text.includes('how do') ||
    text.includes('how to') ||
    text.includes('explain') ||
    topic === 'learning'
  ) {
    return 'tutorial'
  }

  // Check for creative/brainstorming
  if (
    text.includes('idea') ||
    text.includes('creative') ||
    text.includes('story') ||
    topic === 'brainstorm'
  ) {
    return 'cartoon'
  }

  // Check for technical/cyberpunk themes
  if (
    text.includes('ai') ||
    text.includes('machine learning') ||
    text.includes('neural') ||
    text.includes('algorithm')
  ) {
    return 'cyberpunk'
  }

  // Check for urgent/important content
  if (
    text.includes('urgent') ||
    text.includes('important') ||
    text.includes('error') ||
    text.includes('critical')
  ) {
    return 'emergency'
  }

  // Check for news/information
  if (
    text.includes('news') ||
    text.includes('update') ||
    text.includes('announcement') ||
    topic === 'research'
  ) {
    return 'news'
  }

  // Check for discussion/conversation
  if (
    text.includes('think') ||
    text.includes('opinion') ||
    text.includes('feel') ||
    topic === 'conversation'
  ) {
    return 'sitcom'
  }

  // Check for glitchy/abstract content
  if (text.includes('abstract') || text.includes('experimental') || memory.metadata?.wordCount && memory.metadata.wordCount < 50) {
    return 'glitch'
  }

  // Default based on hash of content
  const hash = simpleHash(memory.id)
  const types: MonitorStyleType[] = [
    'cartoon',
    'sitcom',
    'tutorial',
    'cyberpunk',
    'terminal',
    'news',
  ]
  return types[hash % types.length]
}

function getAnimationType(type: MonitorStyleType) {
  const animations = {
    cartoon: 'pulse' as const,
    sitcom: 'none' as const,
    tutorial: 'scroll' as const,
    cyberpunk: 'glitch' as const,
    terminal: 'typewriter' as const,
    glitch: 'glitch' as const,
    emergency: 'pulse' as const,
    news: 'scroll' as const,
    static: 'static' as const,
  }
  return animations[type]
}

function shouldFlicker(type: MonitorStyleType, _memory: Memory): boolean {
  const flickerTypes: MonitorStyleType[] = [
    'cyberpunk',
    'terminal',
    'glitch',
    'emergency',
    'static',
  ]
  return flickerTypes.includes(type)
}

function getFlickerSpeed(type: MonitorStyleType): number {
  const speeds: Record<MonitorStyleType, number> = {
    cartoon: 0,
    sitcom: 0,
    tutorial: 0,
    cyberpunk: 3000,
    terminal: 5000,
    glitch: 1000,
    emergency: 500,
    news: 0,
    static: 200,
  }
  return speeds[type]
}

function shouldHaveScanlines(type: MonitorStyleType): boolean {
  const scanlineTypes: MonitorStyleType[] = [
    'sitcom',
    'cyberpunk',
    'terminal',
    'glitch',
    'emergency',
    'news',
    'static',
  ]
  return scanlineTypes.includes(type)
}

function getNoiseLevel(type: MonitorStyleType): number {
  const noise: Record<MonitorStyleType, number> = {
    cartoon: 0,
    sitcom: 0.02,
    tutorial: 0.01,
    cyberpunk: 0.03,
    terminal: 0.01,
    glitch: 0.08,
    emergency: 0.04,
    news: 0.01,
    static: 0.15,
  }
  return noise[type]
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}
