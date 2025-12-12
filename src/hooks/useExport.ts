import { useCallback } from 'react'
import { Memory } from '@/types'

export function useExport() {
  const exportAsSpine = useCallback(async (memory: Memory) => {
    const seed = generateSpineSeed(memory)

    // Create and download file
    const blob = new Blob([seed], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spine-${memory.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  }, [])

  const exportAsJson = useCallback(async (memory: Memory) => {
    const data = {
      id: memory.id,
      title: memory.title,
      conversation: memory.conversation,
      messages: memory.userMessages.map((user, i) => [
        { role: 'user', content: user },
        { role: 'assistant', content: memory.assistantMessages[i] || '' },
      ]).flat(),
      metadata: {
        platform: memory.platform,
        topic: memory.topic,
        tags: memory.tags,
        timestamp: memory.timestamp,
        wordCount: memory.metadata?.wordCount,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-${memory.id.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  }, [])

  const copyToClipboard = useCallback(async (memory: Memory) => {
    const seed = generateSpineSeed(memory)
    await navigator.clipboard.writeText(seed)
    return { success: true }
  }, [])

  const exportMultiple = useCallback(async (memories: Memory[], format: 'spine' | 'json') => {
    if (format === 'spine') {
      const combined = memories.map((m) => generateSpineSeed(m)).join('\n\n---\n\n')
      const blob = new Blob([combined], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spine-collection-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      const data = memories.map((m) => ({
        id: m.id,
        title: m.title,
        conversation: m.conversation,
        platform: m.platform,
        topic: m.topic,
        tags: m.tags,
        timestamp: m.timestamp,
      }))
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `memories-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return { success: true }
  }, [])

  return {
    exportAsSpine,
    exportAsJson,
    copyToClipboard,
    exportMultiple,
  }
}

function generateSpineSeed(memory: Memory): string {
  const lines = [
    '# SPINE SEED',
    `# Generated from: ${memory.title}`,
    `# Platform: ${memory.platform}`,
    `# Date: ${new Date(memory.timestamp).toISOString()}`,
    '',
    '## Context',
    `Topic: ${memory.topic}`,
    `Tags: ${memory.tags.join(', ')}`,
    '',
    '## Summary',
    extractSummary(memory),
    '',
    '## Key Insights',
    ...extractKeyInsights(memory),
    '',
    '## Conversation Excerpt',
    memory.conversation.slice(-2000),
    '',
    '---',
    'Use this seed to continue the conversation with context preserved.',
  ]

  return lines.join('\n')
}

function extractSummary(memory: Memory): string {
  const firstUserMessage = memory.userMessages[0] || ''
  const lastUserMessage = memory.userMessages[memory.userMessages.length - 1] || ''

  if (memory.userMessages.length === 1) {
    return `A conversation about: ${firstUserMessage.slice(0, 200)}`
  }

  return `Started with "${firstUserMessage.slice(0, 100)}..." and concluded with "${lastUserMessage.slice(0, 100)}..."`
}

function extractKeyInsights(memory: Memory): string[] {
  const insights: string[] = []

  // Look for question-answer pairs
  memory.userMessages.forEach((user, i) => {
    const assistant = memory.assistantMessages[i]
    if (user.includes('?') && assistant) {
      const answer = assistant.split('.')[0]
      if (answer.length < 200) {
        insights.push(`- Q: "${user.slice(0, 80)}..." → "${answer}"`)
      }
    }
  })

  return insights.slice(0, 5)
}
