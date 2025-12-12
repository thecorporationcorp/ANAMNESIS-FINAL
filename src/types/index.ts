// Core Memory Types
export interface Memory {
  id: string
  title: string
  conversation: string
  userMessages: string[]
  assistantMessages: string[]
  timestamp: Date
  platform: Platform
  topic: string
  tags: string[]
  metadata: MemoryMetadata
  matchesSearch?: boolean
}

export interface MemoryMetadata {
  wordCount: number
  turnCount: number
  duration?: number
  model?: string
  compressed?: boolean
  compressionRatio?: number
}

export type Platform = 'chatgpt' | 'claude' | 'gemini' | 'local' | 'other'

// Monitor Types
export type MonitorStyleType =
  | 'cartoon'
  | 'sitcom'
  | 'tutorial'
  | 'cyberpunk'
  | 'terminal'
  | 'glitch'
  | 'emergency'
  | 'news'
  | 'static'

export interface MonitorStyle {
  type: MonitorStyleType
  palette: string[]
  animation: AnimationType
  flicker: boolean
  flickerSpeed?: number
  scanlines: boolean
  noiseLevel: number
}

export interface MonitorLayout {
  aspectRatio: string
  gridColumn: string
  gridRow: string
  zIndex: number
}

export type AnimationType =
  | 'scroll'
  | 'pulse'
  | 'wave'
  | 'glitch'
  | 'static'
  | 'typewriter'
  | 'none'

// Extracted Text Types
export interface ExtractedText {
  phrases: string[]
  questions: string[]
  commands: string[]
  terms: string[]
  breakthroughs: string[]
  date: Date
  platform: Platform
  topic: string
}

// Collage Types
export interface CollageLayout {
  mainText: TextBlock
  notes: HandwrittenNote[]
  photos: PhotoElement[]
  tape: TapePiece[]
  dateStamp: Position & { rotation: number }
  platformLabel: Position & { rotation: number }
}

export interface Position {
  x: number
  y: number
}

export interface TextBlock {
  content: string
  position: Position
  width: number
  rotation: number
  font: string
  size: number
  lineHeight: number
}

export interface HandwrittenNote {
  text: string
  position: Position
  rotation: number
  color: string
  font: string
}

export interface PhotoElement {
  type: 'polaroid' | 'code-snippet' | 'diagram' | 'placeholder'
  src: string
  position: Position
  size: { width: number; height: number }
  rotation: number
}

export interface TapePiece {
  position: Position
  rotation: number
  length: number
}

// Grid Types
export interface GridConfig {
  columns: number | 'auto'
  aspectRatios: string[]
  density: 'low' | 'medium' | 'high' | 'ultra-high'
}

export interface GridResult {
  columns: string
  rows: string
  layout: MonitorLayout[]
}

// App State Types
export type AppView = 'awakening' | 'wall' | 'memory'

export interface AppState {
  view: AppView
  selectedMemoryId: string | null
  searchQuery: string
  isImporting: boolean
  importProgress: number
}

// Database Types
export interface ImportResult {
  success: boolean
  message: string
  memoriesImported?: number
  errors?: string[]
}

export interface SearchResult {
  memories: Memory[]
  total: number
  query: string
  took: number
}

// Animation Presets
export interface AnimationPreset {
  duration: number
  ease: number[] | string
  delay?: number
}

export const ANIMATION_PRESETS = {
  monitorFade: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  collageFade: { duration: 0.6, ease: 'easeInOut' },
  searchHighlight: { duration: 0.3, ease: 'easeOut' },
  awakeningPulse: { duration: 2, ease: 'easeInOut' },
} as const
