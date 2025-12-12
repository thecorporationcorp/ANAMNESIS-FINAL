import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Search } from './Search'
import { Stats } from './Stats'
import { format } from 'date-fns'

export function Wall() {
  const memories = useAppStore((state) => state.memories)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchResults = useAppStore((state) => state.setSearchResults)
  const searchResults = useAppStore((state) => state.searchResults)
  const selectMemory = useAppStore((state) => state.selectMemory)

  // Perform database search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      try {
        const results = await window.electronAPI?.db.searchMemories(searchQuery)
        setSearchResults(results || [])
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      }
    }

    const timer = setTimeout(performSearch, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, setSearchResults])

  // Determine which memories to display
  const displayMemories = searchQuery.trim() ? searchResults : memories

  // Split memories into 3 ribbons for visual variety
  const ribbon1 = displayMemories.filter((_, i) => i % 3 === 0)
  const ribbon2 = displayMemories.filter((_, i) => i % 3 === 1)
  const ribbon3 = displayMemories.filter((_, i) => i % 3 === 2)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden"
    >
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/5 to-violet-500/5 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/4 to-orange-500/4 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
        />
      </div>

      {/* Ticker Ribbons Container */}
      <div className="absolute inset-0 flex flex-col justify-center pt-16 pb-8 gap-8">
        {/* Ribbon 1 - Scrolls Right */}
        {ribbon1.length > 0 && (
          <TickerRibbon
            memories={ribbon1}
            direction="right"
            speed={40}
            onMemoryClick={selectMemory}
          />
        )}

        {/* Ribbon 2 - Scrolls Left */}
        {ribbon2.length > 0 && (
          <TickerRibbon
            memories={ribbon2}
            direction="left"
            speed={35}
            onMemoryClick={selectMemory}
          />
        )}

        {/* Ribbon 3 - Scrolls Right */}
        {ribbon3.length > 0 && (
          <TickerRibbon
            memories={ribbon3}
            direction="right"
            speed={45}
            onMemoryClick={selectMemory}
          />
        )}
      </div>

      {/* Search Bar */}
      <Search
        resultsCount={displayMemories.length}
        totalCount={memories.length}
      />

      {/* Stats Corner */}
      <Stats />

      {/* Empty State */}
      {displayMemories.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-white/40 font-light text-2xl mb-4">
              {searchQuery.trim() ? 'No memories found' : 'No memories loaded'}
            </p>
            {!searchQuery.trim() && (
              <p className="text-white/30 font-light text-lg">
                Import your chat history to get started
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* Ticker Ribbon Component */
interface TickerRibbonProps {
  memories: any[]
  direction: 'left' | 'right'
  speed: number
  onMemoryClick: (id: string) => void
}

function TickerRibbon({ memories, direction, speed, onMemoryClick }: TickerRibbonProps) {
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate memories to create seamless loop
  const duplicatedMemories = [...memories, ...memories, ...memories]

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      {/* Scrolling Container */}
      <motion.div
        className="flex gap-6"
        animate={{
          x: direction === 'right' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          ...(isPaused && { duration: speed * 10 }), // Slow down on hover
        }}
      >
        {duplicatedMemories.map((memory, i) => (
          <MemoryCard
            key={`${memory.id}-${i}`}
            memory={memory}
            onClick={() => onMemoryClick(memory.id)}
          />
        ))}
      </motion.div>
    </div>
  )
}

/* Memory Card Component */
interface MemoryCardProps {
  memory: any
  onClick: () => void
}

function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const wordCount = memory.conversation.split(/\s+/).length

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="
        flex-none w-96 h-56
        cursor-pointer
        bg-gradient-to-br from-white/5 to-white/[0.02]
        backdrop-blur-md
        border border-white/10
        rounded-2xl
        p-6
        hover:border-cyan-400/30
        hover:shadow-xl hover:shadow-cyan-500/10
        transition-all duration-300
        group
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/20">
          <span className="text-xs text-cyan-200 font-light">{memory.platform}</span>
        </div>
        <div className="text-xs text-white/40 font-light">
          {format(new Date(memory.timestamp), 'MMM d, yyyy')}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-light text-xl mb-3 leading-tight line-clamp-2 group-hover:text-cyan-100 transition-colors">
        {memory.title}
      </h3>

      {/* Topic */}
      <div className="mb-4">
        <span className="text-sm text-white/50 font-light">{memory.topic}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-white/40 font-light">
        <span>{wordCount.toLocaleString()} words</span>
        <span>•</span>
        <span>{memory.tags.length} tags</span>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  )
}
