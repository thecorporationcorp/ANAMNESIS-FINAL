import { create } from 'zustand'
import { AppView, Memory } from '@/types'

interface AppStore {
  // View state
  view: AppView
  setView: (view: AppView) => void

  // Memory state
  memories: Memory[]
  setMemories: (memories: Memory[]) => void
  addMemories: (memories: Memory[]) => void

  // Selection state
  selectedMemoryId: string | null
  selectMemory: (id: string | null) => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Memory[]
  setSearchResults: (results: Memory[]) => void
  isSearching: boolean
  setIsSearching: (searching: boolean) => void

  // Import state
  isImporting: boolean
  setIsImporting: (importing: boolean) => void
  importProgress: number
  setImportProgress: (progress: number) => void

  // Stats
  stats: {
    totalMemories: number
    totalWords: number
    platforms: Record<string, number>
    topTopics: string[]
  }
  updateStats: () => void

  // Actions
  reset: () => void
}

const initialState = {
  view: 'awakening' as AppView,
  memories: [],
  selectedMemoryId: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  isImporting: false,
  importProgress: 0,
  stats: {
    totalMemories: 0,
    totalWords: 0,
    platforms: {},
    topTopics: [],
  },
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setView: (view) => set({ view }),

  setMemories: (memories) => {
    set({ memories })
    get().updateStats()
  },

  addMemories: (newMemories) => {
    set((state) => ({ memories: [...state.memories, ...newMemories] }))
    get().updateStats()
  },

  selectMemory: (id) => set({ selectedMemoryId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) => set({ searchResults: results }),

  setIsSearching: (searching) => set({ isSearching: searching }),

  setIsImporting: (importing) => set({ isImporting: importing }),

  setImportProgress: (progress) => set({ importProgress: progress }),

  updateStats: () => {
    const { memories } = get()
    const totalWords = memories.reduce(
      (sum, m) => sum + (m.metadata?.wordCount || 0),
      0
    )
    const platforms: Record<string, number> = {}
    const topicCounts: Record<string, number> = {}

    memories.forEach((m) => {
      platforms[m.platform] = (platforms[m.platform] || 0) + 1
      if (m.topic) {
        topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1
      }
    })

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic)

    set({
      stats: {
        totalMemories: memories.length,
        totalWords,
        platforms,
        topTopics,
      },
    })
  },

  reset: () => set(initialState),
}))

// Selector hooks for optimized re-renders
export const useMemories = () => useAppStore((state) => state.memories)
export const useSelectedMemory = () => {
  const memories = useAppStore((state) => state.memories)
  const selectedId = useAppStore((state) => state.selectedMemoryId)
  return memories.find((m) => m.id === selectedId) ?? null
}
export const useSearchQuery = () => useAppStore((state) => state.searchQuery)
export const useSearchResults = () => useAppStore((state) => state.searchResults)
export const useStats = () => useAppStore((state) => state.stats)
export const useView = () => useAppStore((state) => state.view)
