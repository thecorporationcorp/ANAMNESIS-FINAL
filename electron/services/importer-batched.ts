import { readFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Memory, Platform, ImportResult } from '../../src/types'
import { BrowserWindow } from 'electron'

const BATCH_SIZE = 50

export async function importExportFileBatched(
  filePath: string,
  mainWindow?: BrowserWindow
): Promise<ImportResult> {
  try {
    sendProgress(mainWindow, 5, 'Reading file...')
    const content = readFileSync(filePath, 'utf-8')

    sendProgress(mainWindow, 10, 'Parsing data...')
    const data = JSON.parse(content)

    let memories: Memory[] = []

    sendProgress(mainWindow, 15, 'Detecting format...')
    if (isChatGPTExport(data)) {
      memories = await parseChatGPTExportBatched(data, mainWindow)
    } else if (isClaudeExport(data)) {
      memories = await parseClaudeExportBatched(data, mainWindow)
    } else {
      return {
        success: false,
        message: 'Unknown export format. Supported: ChatGPT, Claude exports.',
      }
    }

    await insertMemoriesBatched(memories, mainWindow)

    sendProgress(mainWindow, 100, 'Import complete!')

    return {
      success: true,
      message: `Successfully imported ${memories.length} memories`,
      memoriesImported: memories.length,
    }
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${(error as Error).message}`,
      errors: [(error as Error).message],
    }
  }
}

function sendProgress(
  mainWindow: BrowserWindow | undefined,
  percent: number,
  message: string
) {
  if (mainWindow) {
    mainWindow.webContents.send('import:progress', { percent, message })
  }
}

async function insertMemoriesBatched(
  memories: Memory[],
  mainWindow?: BrowserWindow
): Promise<void> {
  const { insertMemoryBatch } = await import('./database')
  const total = memories.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = memories.slice(i, i + BATCH_SIZE)
    const progressPercent = 85 + Math.floor((i / total) * 15)

    sendProgress(
      mainWindow,
      progressPercent,
      `Saving ${i + 1}-${Math.min(i + BATCH_SIZE, total)} of ${total} memories...`
    )

    insertMemoryBatch(batch)
    await new Promise((resolve) => setImmediate(resolve))
  }
}

async function parseChatGPTExportBatched(
  data: any[],
  mainWindow?: BrowserWindow
): Promise<Memory[]> {
  const memories: Memory[] = []
  const total = data.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const progressPercent = 15 + Math.floor((i / total) * 70)

    sendProgress(
      mainWindow,
      progressPercent,
      `Processing ${i + 1}-${Math.min(i + BATCH_SIZE, total)} of ${total}...`
    )

    for (const conversation of batch) {
      try {
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
      }
    }

    await new Promise((resolve) => setImmediate(resolve))
  }

  return memories
}

async function parseClaudeExportBatched(
  data: any,
  mainWindow?: BrowserWindow
): Promise<Memory[]> {
  const memories: Memory[] = []
  const conversations = data.conversations || data.chats || []
  const total = conversations.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
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

function isChatGPTExport(data: any): boolean {
  return Array.isArray(data) && data[0]?.mapping !== undefined
}

function isClaudeExport(data: any): boolean {
  return data.conversations !== undefined || data.chats !== undefined
}

function extractMessagesFromMapping(mapping: any): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = []

  for (const nodeId in mapping) {
    const node = mapping[nodeId]
    if (node.message?.content?.parts) {
      const role = node.message.author?.role || 'unknown'
      if (role === 'user' || role === 'assistant') {
        const content = node.message.content.parts.join('\n')
        if (content.trim()) {
          messages.push({ role, content })
        }
      }
    }
  }

  return messages
}

function generateTitle(firstMessage: string): string {
  const truncated = firstMessage.slice(0, 50).trim()
  return truncated.length < firstMessage.length ? truncated + '...' : truncated
}

function classifyTopic(text: string): string {
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
  const tags = new Set<string>()

  const techTerms = text.match(
    /\b(React|Vue|Angular|Node|Python|JavaScript|TypeScript|API|SQL|CSS|HTML)\b/gi
  )
  techTerms?.forEach((term) => tags.add(term.toLowerCase()))

  return Array.from(tags).slice(0, 10)
}

function extractModel(messages: any[]): string | undefined {
  for (const msg of messages) {
    if (msg.model) return msg.model
  }
  return undefined
}
