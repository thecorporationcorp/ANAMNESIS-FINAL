import { motion } from 'framer-motion'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Monitor } from '@/components/Monitor'
import { Search } from './Search'
import { Stats } from './Stats'
import { BladeRunnerEffects } from '@/components/Effects'
import { generateGrid } from '@/systems/grid-layout'

export function Wall() {
  const memories = useAppStore((state) => state.memories)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchResults = useAppStore((state) => state.setSearchResults)
  const searchResults = useAppStore((state) => state.searchResults)
  const selectMemory = useAppStore((state) => state.selectMemory)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Perform database search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      try {
        // Use FTS5 database search for production-grade performance
        const results = await window.electronAPI?.db.searchMemories(searchQuery)
        setSearchResults(results || [])
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      }
    }

    // Debounce search
    const timer = setTimeout(performSearch, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, setSearchResults])

  // Determine which memories to display
  const displayMemories = searchQuery.trim() ? searchResults : memories

  // Generate grid layout
  const grid = useMemo(
    () =>
      generateGrid(displayMemories, {
        columns: 'auto',
        aspectRatios: ['16:9', '4:3', '1:1', '9:16', '21:9'],
        density: 'ultra-high',
      }),
    [displayMemories]
  )

  const handleMonitorClick = useCallback(
    (memoryId: string) => {
      selectMemory(memoryId)
    },
    [selectMemory]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      {/* Monitor Grid */}
      <div
        className="absolute inset-0 grid gap-[2px] p-[2px] pt-12"
        style={{
          gridTemplateColumns: grid.columns,
          gridAutoRows: 'minmax(80px, 1fr)',
        }}
      >
        {displayMemories.map((memory, i) => (
          <Monitor
            key={memory.id}
            memory={memory}
            layout={grid.layout[i]}
            isHighlighted={true}
            isHovered={hoveredId === memory.id}
            onClick={() => handleMonitorClick(memory.id)}
            onHover={() => setHoveredId(memory.id)}
            onLeave={() => setHoveredId(null)}
          />
        ))}
      </div>

      {/* Blade Runner Post-Processing Effects */}
      <BladeRunnerEffects />

      {/* Search Bar */}
      <Search
        resultsCount={displayMemories.length}
        totalCount={memories.length}
      />

      {/* Stats Corner */}
      <Stats />

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-cyber-cyan/5 via-transparent to-transparent opacity-50" />

      {/* Empty State */}
      {displayMemories.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-cyber-cyan/40 font-mono text-lg mb-4">
              {searchQuery.trim() ? 'No memories found' : 'No memories loaded'}
            </p>
            {!searchQuery.trim() && (
              <p className="text-cyber-cyan/30 font-mono text-sm">
                Import your chat history to get started
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
