import { readFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Memory, Platform, ImportResult } from '../../src/types'
import { insertManyMemories } from './database'

export async function importExportFile(filePath: string): Promise<ImportResult> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)

    let memories: Memory[] = []

    // Detect export format
    if (isChatGPTExport(data)) {
      memories = parseChatGPTExport(data)
    } else if (isClaudeExport(data)) {
      memories = parseClaudeExport(data)
    } else if (isGenericExport(data)) {
      memories = parseGenericExport(data)
    } else {
      return {
        success: false,
        message: 'Unknown export format. Supported: ChatGPT, Claude exports.',
      }
    }

    // Insert into database
    insertManyMemories(memories)

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

function isChatGPTExport(data: any): boolean {
  return Array.isArray(data) && data[0]?.mapping !== undefined
}

function isClaudeExport(data: any): boolean {
  return data.conversations !== undefined || data.chats !== undefined
}

function isGenericExport(data: any): boolean {
  return Array.isArray(data) || data.messages !== undefined
}

function parseChatGPTExport(data: any[]): Memory[] {
  const memories: Memory[] = []

  for (const conversation of data) {
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

  return memories
}

function parseClaudeExport(data: any): Memory[] {
  const memories: Memory[] = []
  const conversations = data.conversations || data.chats || []

  for (const conv of conversations) {
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

  return memories
}

function parseGenericExport(data: any): Memory[] {
  const memories: Memory[] = []
  const items = Array.isArray(data) ? data : [data]

  for (const item of items) {
    try {
      const messages = item.messages || []

      const userMessages = messages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)

      const assistantMessages = messages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => m.content)

      const conversationText = messages
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n')

      const memory: Memory = {
        id: item.id || uuidv4(),
        title: item.title || generateTitle(userMessages[0] || 'Untitled'),
        conversation: conversationText,
        userMessages,
        assistantMessages,
        timestamp: new Date(item.timestamp || item.created_at || Date.now()),
        platform: (item.platform as Platform) || 'other',
        topic: classifyTopic(conversationText),
        tags: extractTags(conversationText),
        metadata: {
          wordCount: conversationText.split(/\s+/).length,
          turnCount: userMessages.length,
          model: item.model,
        },
      }

      memories.push(memory)
    } catch (e) {
      console.error('Error parsing generic conversation:', e)
    }
  }

  return memories
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
  // Take first 50 chars of first message
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

  // Extract technical terms
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
