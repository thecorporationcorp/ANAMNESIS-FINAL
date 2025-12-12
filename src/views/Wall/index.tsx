import { motion } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Monitor } from '@/components/Monitor'
import { Search } from './Search'
import { Stats } from './Stats'
import { BladeRunnerEffects } from '@/components/Effects'
import { generateGrid } from '@/systems/grid-layout'

export function Wall() {
  const memories = useAppStore((state) => state.memories)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const selectMemory = useAppStore((state) => state.selectMemory)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Generate grid layout
  const grid = useMemo(
    () =>
      generateGrid(memories, {
        columns: 'auto',
        aspectRatios: ['16:9', '4:3', '1:1', '9:16', '21:9'],
        density: 'ultra-high',
      }),
    [memories]
  )

  // Filter memories based on search
  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) {
      return memories.map((m) => ({ ...m, matchesSearch: true }))
    }

    const query = searchQuery.toLowerCase()
    return memories.map((m) => ({
      ...m,
      matchesSearch:
        m.title.toLowerCase().includes(query) ||
        m.conversation.toLowerCase().includes(query) ||
        m.topic.toLowerCase().includes(query) ||
        m.tags.some((t) => t.toLowerCase().includes(query)),
    }))
  }, [memories, searchQuery])

  const matchCount = filteredMemories.filter((m) => m.matchesSearch).length

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
        {filteredMemories.map((memory, i) => (
          <Monitor
            key={memory.id}
            memory={memory}
            layout={grid.layout[i]}
            isHighlighted={memory.matchesSearch}
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
      <Search resultsCount={matchCount} totalCount={memories.length} />

      {/* Stats Corner */}
      <Stats />

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-cyber-cyan/5 via-transparent to-transparent opacity-50" />
    </motion.div>
  )
}
