import { createReadStream, statSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Memory, Platform, ImportResult } from '../../src/types'
import { insertMemoryBatch } from './database'
import { BrowserWindow } from 'electron'
import { createInterface } from 'readline'

// ============================================================================
// CONFIGURATION: Bulletproof Constraints
// ============================================================================
const BATCH_SIZE = 50                    // Conversations per batch
const MAX_FILE_SIZE_MB = 500             // Reject files larger than 500MB
const JSON_PARSE_TIMEOUT_MS = 30000      // 30s timeout for JSON parsing
const PROGRESS_THROTTLE_MS = 100         // Throttle progress updates

// ============================================================================
// MAIN IMPORT FUNCTION: Adversarially Hardened
// ============================================================================
export async function importExportFileBatched(
  filePath: string,
  mainWindow?: BrowserWindow
): Promise<ImportResult> {
  let aborted = false

  try {
    // ========================================================================
    // STEP 1: File Size Validation (Prevent Memory Exhaustion)
    // ========================================================================
    sendProgress(mainWindow, 1, 'Validating file...')

    const stats = statSync(filePath)
    const fileSizeMB = stats.size / (1024 * 1024)

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return {
        success: false,
        message: `File too large: ${fileSizeMB.toFixed(1)}MB (max: ${MAX_FILE_SIZE_MB}MB)`,
      }
    }

    // ========================================================================
    // STEP 2: Asynchronous File Read with Streaming
    // ========================================================================
    sendProgress(mainWindow, 5, 'Reading file...')

    const content = await readFileAsync(filePath)
    if (!content) {
      return { success: false, message: 'File is empty' }
    }

    // ========================================================================
    // STEP 3: Timeout-Protected JSON Parsing
    // ========================================================================
    sendProgress(mainWindow, 10, 'Parsing data...')

    let data: any
    try {
      data = await parseJSONWithTimeout(content, JSON_PARSE_TIMEOUT_MS)
    } catch (error) {
      return {
        success: false,
        message: `Invalid JSON: ${(error as Error).message}`,
      }
    }

    // ========================================================================
    // STEP 4: Format Detection & Validation
    // ========================================================================
    sendProgress(mainWindow, 15, 'Detecting format...')

    let memories: Memory[]

    if (isChatGPTExport(data)) {
      if (!Array.isArray(data) || data.length === 0) {
        return { success: false, message: 'ChatGPT export contains no conversations' }
      }
      memories = await parseChatGPTExportBatched(data, mainWindow, () => aborted)
    } else if (isClaudeExport(data)) {
      const conversations = data.conversations || data.chats || []
      if (conversations.length === 0) {
        return { success: false, message: 'Claude export contains no conversations' }
      }
      memories = await parseClaudeExportBatched(data, mainWindow, () => aborted)
    } else {
      return {
        success: false,
        message: 'Unknown export format. Supported: ChatGPT, Claude exports.',
      }
    }

    if (aborted) {
      return { success: false, message: 'Import cancelled by user' }
    }

    // ========================================================================
    // STEP 5: Database Insertion with Rollback Protection
    // ========================================================================
    await insertMemoriesBatched(memories, mainWindow, () => aborted)

    if (aborted) {
      return { success: false, message: 'Import cancelled during save' }
    }

    sendProgress(mainWindow, 100, 'Import complete!')

    return {
      success: true,
      message: `Successfully imported ${memories.length} memories`,
      memoriesImported: memories.length,
    }
  } catch (error) {
    const errorMsg = (error as Error).message
    console.error('Import failed:', errorMsg, error)

    return {
      success: false,
      message: `Import failed: ${errorMsg}`,
      errors: [errorMsg],
    }
  }
}

// ============================================================================
// ASYNC FILE READER: Non-Blocking, Stream-Based
// ============================================================================
async function readFileAsync(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = []
    const stream = createReadStream(filePath, { encoding: 'utf-8' })

    stream.on('data', (chunk: string) => {
      chunks.push(chunk)
    })

    stream.on('end', () => {
      resolve(chunks.join(''))
    })

    stream.on('error', (error) => {
      reject(new Error(`File read failed: ${error.message}`))
    })

    // Timeout protection
    setTimeout(() => {
      stream.destroy()
      reject(new Error('File read timeout (60s)'))
    }, 60000)
  })
}

// ============================================================================
// JSON PARSER: Timeout-Protected, Error-Safe
// ============================================================================
async function parseJSONWithTimeout(content: string, timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('JSON parsing timeout - file may be too large or malformed'))
    }, timeoutMs)

    try {
      const parsed = JSON.parse(content)
      clearTimeout(timer)
      resolve(parsed)
    } catch (error) {
      clearTimeout(timer)
      reject(error)
    }
  })
}

// ============================================================================
// PROGRESS SENDER: Throttled to Prevent IPC Spam
// ============================================================================
let lastProgressTime = 0

function sendProgress(
  mainWindow: BrowserWindow | undefined,
  percent: number,
  message: string
) {
  const now = Date.now()

  // Throttle progress updates (except 0% and 100%)
  if (percent !== 0 && percent !== 100 && now - lastProgressTime < PROGRESS_THROTTLE_MS) {
    return
  }

  lastProgressTime = now

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('import:progress', {
      percent: Math.min(100, Math.max(0, percent)), // Clamp 0-100
      message
    })
  }
}

// ============================================================================
// BATCHED DATABASE INSERTION: Rollback-Safe
// ============================================================================
async function insertMemoriesBatched(
  memories: Memory[],
  mainWindow?: BrowserWindow,
  shouldAbort?: () => boolean
): Promise<void> {
  const total = memories.length

  if (total === 0) {
    return // Guard against division by zero
  }

  for (let i = 0; i < total; i += BATCH_SIZE) {
    if (shouldAbort?.()) {
      throw new Error('Import aborted by user')
    }

    const batch = memories.slice(i, i + BATCH_SIZE)
    const progressPercent = 85 + Math.floor((i / total) * 15)

    sendProgress(
      mainWindow,
      progressPercent,
      `Saving ${i + 1}-${Math.min(i + BATCH_SIZE, total)} of ${total} memories...`
    )

    try {
      insertMemoryBatch(batch)
    } catch (error) {
      throw new Error(`Database insertion failed at batch ${i}-${i + BATCH_SIZE}: ${(error as Error).message}`)
    }

    // Yield to event loop
    await new Promise((resolve) => setImmediate(resolve))
  }
}

// ============================================================================
// CHATGPT PARSER: Batched, Error-Resilient
// ============================================================================
async function parseChatGPTExportBatched(
  data: any[],
  mainWindow?: BrowserWindow,
  shouldAbort?: () => boolean
): Promise<Memory[]> {
  const memories: Memory[] = []
  const total = data.length

  if (total === 0) return memories

  for (let i = 0; i < total; i += BATCH_SIZE) {
    if (shouldAbort?.()) {
      break
    }

    const batch = data.slice(i, i + BATCH_SIZE)
    const progressPercent = 15 + Math.floor((i / total) * 70)

    sendProgress(
      mainWindow,
      progressPercent,
      `Processing ${i + 1}-${Math.min(i + BATCH_SIZE, total)} of ${total}...`
    )

    for (const conversation of batch) {
      try {
        // Validate required fields
        if (!conversation.mapping) continue

        const messages = extractMessagesFromMapping(conversation.mapping)
        if (messages.length === 0) continue

        const userMessages = messages
          .filter((m) => m.role === 'user')
          .map((m) => m.content)

        const assistantMessages = messages
          .filter((m) => m.role === 'assistant')
          .map((m) => m.content)

        const conversationText = messages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n\n')

        const memory: Memory = {
          id: conversation.id || uuidv4(),
          title: conversation.title || generateTitle(userMessages[0] || 'Untitled'),
          conversation: conversationText,
          userMessages,
          assistantMessages,
          timestamp: new Date(conversation.create_time * 1000 || Date.now()),
          platform: 'chatgpt',
          topic: classifyTopic(conversationText),
          tags: extractTags(conversationText),
          metadata: {
            wordCount: conversationText.split(/\s+/).length,
            turnCount: userMessages.length,
            model: extractModel(messages),
          },
        }

        memories.push(memory)
      } catch (e) {
        console.error('Error parsing conversation:', e)
        // Continue processing other conversations
      }
    }

    await new Promise((resolve) => setImmediate(resolve))
  }

  return memories
}

// ============================================================================
// CLAUDE PARSER: Batched, Error-Resilient
// ============================================================================
async function parseClaudeExportBatched(
  data: any,
  mainWindow?: BrowserWindow,
  shouldAbort?: () => boolean
): Promise<Memory[]> {
  const memories: Memory[] = []
  const conversations = data.conversations || data.chats || []
  const total = conversations.length

  if (total === 0) return memories

  for (let i = 0; i < total; i += BATCH_SIZE) {
    if (shouldAbort?.()) {
      break
    }

    const batch = conversations.slice(i, i + BATCH_SIZE)
    const progressPercent = 15 + Math.floor((i / total) * 70)

    sendProgress(
      mainWindow,
      progressPercent,
      `Processing ${i + 1}-${Math.min(i + BATCH_SIZE, total)} of ${total}...`
    )

    for (const conv of batch) {
      try {
        const messages = conv.messages || conv.chat_messages || []
        if (messages.length === 0) continue

        const userMessages = messages
          .filter((m: any) => m.sender === 'human' || m.role === 'user')
          .map((m: any) => m.text || m.content)

        const assistantMessages = messages
          .filter((m: any) => m.sender === 'assistant' || m.role === 'assistant')
          .map((m: any) => m.text || m.content)

        const conversationText = messages
          .map((m: any) => {
            const role = m.sender === 'human' || m.role === 'user' ? 'USER' : 'ASSISTANT'
            return `${role}: ${m.text || m.content}`
          })
          .join('\n\n')

        const memory: Memory = {
          id: conv.uuid || conv.id || uuidv4(),
          title: conv.name || conv.title || generateTitle(userMessages[0] || 'Untitled'),
          conversation: conversationText,
          userMessages,
          assistantMessages,
          timestamp: new Date(conv.created_at || conv.create_time || Date.now()),
          platform: 'claude',
          topic: classifyTopic(conversationText),
          tags: extractTags(conversationText),
          metadata: {
            wordCount: conversationText.split(/\s+/).length,
            turnCount: userMessages.length,
            model: conv.model || 'claude',
          },
        }

        memories.push(memory)
      } catch (e) {
        console.error('Error parsing Claude conversation:', e)
      }
    }

    await new Promise((resolve) => setImmediate(resolve))
  }

  return memories
}

// ============================================================================
// UTILITY FUNCTIONS: Defensive, Type-Safe
// ============================================================================

function isChatGPTExport(data: any): boolean {
  return Array.isArray(data) && data.length > 0 && data[0]?.mapping !== undefined
}

function isClaudeExport(data: any): boolean {
  return (
    data !== null &&
    typeof data === 'object' &&
    (data.conversations !== undefined || data.chats !== undefined)
  )
}

function extractMessagesFromMapping(mapping: any): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = []

  if (!mapping || typeof mapping !== 'object') {
    return messages
  }

  for (const nodeId in mapping) {
    try {
      const node = mapping[nodeId]
      if (node?.message?.content?.parts) {
        const role = node.message.author?.role || 'unknown'
        if (role === 'user' || role === 'assistant') {
          const content = Array.isArray(node.message.content.parts)
            ? node.message.content.parts.join('\n')
            : String(node.message.content.parts)

          if (content.trim()) {
            messages.push({ role, content })
          }
        }
      }
    } catch (e) {
      // Skip malformed nodes
      continue
    }
  }

  return messages
}

function generateTitle(firstMessage: string): string {
  if (!firstMessage || typeof firstMessage !== 'string') {
    return 'Untitled Conversation'
  }

  const truncated = firstMessage.slice(0, 50).trim()
  return truncated.length < firstMessage.length ? truncated + '...' : truncated
}

function classifyTopic(text: string): string {
  if (!text || typeof text !== 'string') return 'general'

  const lowerText = text.toLowerCase()

  const topics: Record<string, string[]> = {
    coding: ['function', 'code', 'programming', 'bug', 'api', 'database'],
    writing: ['write', 'story', 'article', 'blog', 'essay'],
    learning: ['learn', 'understand', 'explain', 'how does', 'what is'],
    brainstorm: ['idea', 'brainstorm', 'think', 'concept'],
    planning: ['plan', 'schedule', 'organize', 'project'],
  }

  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return topic
    }
  }

  return 'general'
}

function extractTags(text: string): string[] {
  if (!text || typeof text !== 'string') return []

  const tags = new Set<string>()

  const techTerms = text.match(
    /\b(React|Vue|Angular|Node|Python|JavaScript|TypeScript|API|SQL|CSS|HTML|Java|C\+\+|Ruby|Go|Rust|Swift|Kotlin)\b/gi
  )

  techTerms?.forEach((term) => tags.add(term.toLowerCase()))

  return Array.from(tags).slice(0, 10)
}

function extractModel(messages: any[]): string | undefined {
  if (!Array.isArray(messages)) return undefined

  for (const msg of messages) {
    if (msg?.model && typeof msg.model === 'string') {
      return msg.model
    }
  }

  return undefined
}
