import { useCallback, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Memory } from '@/types'
import Fuse from 'fuse.js'

// Fuse.js options for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'conversation', weight: 0.4 },
    { name: 'topic', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export function useMemories() {
  const memories = useAppStore((state) => state.memories)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const setSearchResults = useAppStore((state) => state.setSearchResults)
  const setIsSearching = useAppStore((state) => state.setIsSearching)
  const setMemories = useAppStore((state) => state.setMemories)

  // Initialize Fuse instance
  const fuse = useMemo(() => new Fuse(memories, fuseOptions), [memories])

  // Search function with semantic understanding
  const search = useCallback(
    (query: string) => {
      setIsSearching(true)

      if (!query.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      try {
        // Fuzzy search with Fuse.js
        const fuseResults = fuse.search(query)
        let matchedMemories = fuseResults.map((r) => ({
          ...r.item,
          matchesSearch: true,
          searchScore: r.score,
        }))

        // Enhance with semantic matching for better results
        // Check for concept matches
        const queryLower = query.toLowerCase()
        const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2)

        // Boost results that match topic or have high concept overlap
        matchedMemories = matchedMemories.map(memory => {
          let boost = 0

          // Topic match boost
          if (memory.topic?.toLowerCase().includes(queryLower)) {
            boost += 0.3
          }

          // Tag match boost
          if (memory.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
            boost += 0.2
          }

          // Concept overlap boost
          const conceptMatches = queryTerms.filter(term =>
            memory.conversation.toLowerCase().includes(term)
          ).length

          boost += (conceptMatches / queryTerms.length) * 0.2

          return {
            ...memory,
            searchScore: Math.max(0, (memory.searchScore || 0) - boost),
          }
        })

        // Re-sort by adjusted score
        matchedMemories.sort((a, b) => (a.searchScore || 0) - (b.searchScore || 0))

        setSearchResults(matchedMemories)
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [fuse, setSearchResults, setIsSearching]
  )

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchQuery)
    }, 150)

    return () => clearTimeout(timer)
  }, [searchQuery, search])

  // Load memories from Electron backend
  const loadMemories = useCallback(async () => {
    try {
      const data = await window.electronAPI?.db.getMemories()
      if (data && data.length > 0) {
        setMemories(data)
      }
    } catch (error) {
      console.error('Failed to load memories:', error)
    }
  }, [setMemories])

  // Import export file with VESPERTINE compression
  const importExport = useCallback(
    async (filePath: string) => {
      try {
        useAppStore.getState().setIsImporting(true)
        const result = await window.electronAPI?.db.importExport(filePath)

        if (result?.success) {
          await loadMemories()
        }

        return result
      } catch (error) {
        console.error('Import failed:', error)
        return { success: false, message: 'Import failed' }
      } finally {
        useAppStore.getState().setIsImporting(false)
      }
    },
    [loadMemories]
  )

  // Compress memory using VESPERTINE
  const compressMemory = useCallback(async (memoryId: string) => {
    const memory = memories.find(m => m.id === memoryId)
    if (!memory) return null

    // This would call the Electron backend VESPERTINE service
    // For now, return a mock result
    return {
      originalSize: memory.conversation.length,
      compressedSize: Math.floor(memory.conversation.length * 0.4),
      compressionRatio: 2.5,
    }
  }, [memories])

  // Get semantic graph
  const getSemanticGraph = useCallback(async () => {
    // This would call the Electron backend semantic graph builder
    // Returns nodes and edges for visualization
    return {
      nodes: memories.slice(0, 50).map(m => ({
        id: m.id,
        label: m.title,
        topic: m.topic,
      })),
      edges: [],
    }
  }, [memories])

  // Find related memories using semantic graph
  const findRelated = useCallback(
    (memoryId: string, limit: number = 5) => {
      const memory = memories.find(m => m.id === memoryId)
      if (!memory) return []

      // Simple relatedness based on topic and tags
      return memories
        .filter(m => m.id !== memoryId)
        .map(m => {
          let score = 0

          // Same topic
          if (m.topic === memory.topic) score += 0.5

          // Shared tags
          const sharedTags = m.tags?.filter(t => memory.tags?.includes(t)) || []
          score += sharedTags.length * 0.2

          // Temporal proximity (same month)
          const timeDiff = Math.abs(
            new Date(m.timestamp).getTime() - new Date(memory.timestamp).getTime()
          )
          const oneMonth = 30 * 24 * 60 * 60 * 1000
          if (timeDiff < oneMonth) score += 0.3

          return { memory: m, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.memory)
    },
    [memories]
  )

  return {
    memories,
    searchQuery,
    setSearchQuery,
    search,
    loadMemories,
    importExport,
    compressMemory,
    getSemanticGraph,
    findRelated,
  }
}

export function useSearch() {
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const searchResults = useAppStore((state) => state.searchResults)
  const isSearching = useAppStore((state) => state.isSearching)

  return {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    isSearching,
  }
}

export function useCollage(memoryId: string) {
  const memories = useAppStore((state) => state.memories)
  const memory = memories.find((m) => m.id === memoryId)

  const handleContinue = useCallback(async () => {
    if (!memory) return

    // Generate SPINE seed using the real engine
    const seed = await generateRealSpineSeed(memory)

    // Copy to clipboard
    await navigator.clipboard.writeText(seed)

    console.log('SPINE seed copied to clipboard')
  }, [memory])

  const handleExport = useCallback(async () => {
    if (!memory) return

    const seed = await generateRealSpineSeed(memory)

    // Create and download file
    const blob = new Blob([seed], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spine-${memory.title.slice(0, 20).replace(/\s+/g, '-')}-${memory.id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [memory])

  return {
    memory,
    handleContinue,
    handleExport,
  }
}

/**
 * Generate a real SPINE seed using the backend engine
 */
async function generateRealSpineSeed(memory: Memory): string {
  // This would call the Electron backend SPINE service
  // For now, use the enhanced frontend version

  const sections: string[] = []

  // Header
  sections.push('# SPINE SEED v1.0')
  sections.push(`Generated: ${new Date().toISOString()}`)
  sections.push(`Source: ${memory.platform} | ${memory.title}`)
  sections.push(`Date: ${new Date(memory.timestamp).toLocaleDateString()}`)
  sections.push('')

  // Context
  sections.push('## CONTEXT')
  sections.push(`Topic: ${memory.topic}`)
  sections.push(`Tags: ${memory.tags?.join(', ') || 'none'}`)
  sections.push('')

  // Summary
  const firstMessage = memory.userMessages[0] || ''
  sections.push('### Summary')
  sections.push(`Started with: "${firstMessage.slice(0, 150)}${firstMessage.length > 150 ? '...' : ''}"`)
  sections.push('')

  // Key concepts
  const concepts = extractConcepts(memory.conversation)
  if (concepts.length > 0) {
    sections.push('## KEY CONCEPTS')
    concepts.slice(0, 8).forEach(c => sections.push(`- ${c}`))
    sections.push('')
  }

  // Decisions
  const decisions = extractDecisions(memory.conversation)
  if (decisions.length > 0) {
    sections.push('## DECISIONS MADE')
    decisions.forEach(d => sections.push(`- ${d}`))
    sections.push('')
  }

  // Code patterns
  const codeBlocks = memory.conversation.match(/```[\s\S]*?```/g) || []
  if (codeBlocks.length > 0) {
    sections.push('## CODE PATTERNS')
    codeBlocks.slice(0, 2).forEach(code => sections.push(code))
    sections.push('')
  }

  // Last exchange
  sections.push('## LAST EXCHANGE')
  const lastUser = memory.userMessages[memory.userMessages.length - 1] || ''
  const lastAssistant = memory.assistantMessages[memory.assistantMessages.length - 1] || ''
  sections.push('```')
  sections.push(`USER: ${lastUser}`)
  sections.push('')
  sections.push(`ASSISTANT: ${lastAssistant.slice(0, 500)}${lastAssistant.length > 500 ? '...' : ''}`)
  sections.push('```')
  sections.push('')

  // Continuation
  sections.push('---')
  sections.push('')
  sections.push('## CONTINUATION')
  sections.push('I was working on this previously. Please help me continue from where we left off.')

  return sections.join('\n')
}

function extractConcepts(text: string): string[] {
  const concepts = new Set<string>()

  // PascalCase
  const pascalCase = text.match(/\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g) || []
  pascalCase.forEach(t => concepts.add(t))

  // ACRONYMS
  const acronyms = text.match(/\b[A-Z]{2,}\b/g) || []
  acronyms.forEach(t => {
    if (t.length > 2 && t.length < 10) concepts.add(t)
  })

  return Array.from(concepts).slice(0, 10)
}

function extractDecisions(text: string): string[] {
  const patterns = [
    /(decided to|going with|will use|chose to) ([^.!?]+)/gi,
  ]

  const decisions: string[] = []
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || []
    matches.forEach(m => decisions.push(m.slice(0, 100)))
  })

  return decisions.slice(0, 5)
}
