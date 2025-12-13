import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { Search } from './Search'
import { Stats } from './Stats'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

export function Wall() {
  const memories = useAppStore((state) => state.memories)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchResults = useAppStore((state) => state.setSearchResults)
  const searchResults = useAppStore((state) => state.searchResults)
  const selectMemory = useAppStore((state) => state.selectMemory)
  const setCurrentView = useAppStore((state) => state.setCurrentView)

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
      className="fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-blue-950 overflow-hidden"
    >
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-500/10 blur-3xl"
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
          className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-violet-500/8 to-purple-500/8 blur-3xl"
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
        <motion.div
          className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/6 to-orange-500/6 blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 10,
          }}
        />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setCurrentView('awakening')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
        <span className="text-cyan-400 font-light text-sm group-hover:text-cyan-300">Back</span>
      </motion.button>

      {/* Ticker Ribbons Container - ALL MOVE RIGHT */}
      <div className="absolute inset-0 flex flex-col justify-center pt-16 pb-8 gap-6">
        {/* Ribbon 1 */}
        {ribbon1.length > 0 && (
          <TickerRibbon
            memories={ribbon1}
            speed={50}
            onMemoryClick={selectMemory}
          />
        )}

        {/* Ribbon 2 */}
        {ribbon2.length > 0 && (
          <TickerRibbon
            memories={ribbon2}
            speed={45}
            onMemoryClick={selectMemory}
          />
        )}

        {/* Ribbon 3 */}
        {ribbon3.length > 0 && (
          <TickerRibbon
            memories={ribbon3}
            speed={55}
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
            <p className="text-cyan-300/60 font-light text-2xl mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
              {searchQuery.trim() ? 'No memories found' : 'No memories loaded'}
            </p>
            {!searchQuery.trim() && (
              <p className="text-cyan-400/40 font-light text-lg">
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
  speed: number
  onMemoryClick: (id: string) => void
}

function TickerRibbon({ memories, speed, onMemoryClick }: TickerRibbonProps) {
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
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-slate-950/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-slate-950/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling Container - ALL MOVE RIGHT */}
      <motion.div
        className="flex gap-4"
        animate={{
          x: ['0%', '-33.33%'],
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
            index={i}
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
  index: number
  onClick: () => void
}

function MemoryCard({ memory, index, onClick }: MemoryCardProps) {
  const wordCount = memory.conversation.split(/\s+/).length

  // Cyberpunk color schemes - rotate through them
  const colorSchemes = [
    {
      border: 'border-cyan-400/20',
      hoverBorder: 'hover:border-cyan-400/50',
      text: 'text-cyan-300',
      glow: 'drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]',
      hoverGlow: 'group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]',
      bg: 'from-cyan-500/5 to-blue-500/5',
      badge: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30'
    },
    {
      border: 'border-violet-400/20',
      hoverBorder: 'hover:border-violet-400/50',
      text: 'text-violet-300',
      glow: 'drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]',
      hoverGlow: 'group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]',
      bg: 'from-violet-500/5 to-purple-500/5',
      badge: 'from-violet-500/20 to-purple-500/20 border-violet-400/30'
    },
    {
      border: 'border-pink-400/20',
      hoverBorder: 'hover:border-pink-400/50',
      text: 'text-pink-300',
      glow: 'drop-shadow-[0_0_6px_rgba(244,114,182,0.4)]',
      hoverGlow: 'group-hover:drop-shadow-[0_0_12px_rgba(244,114,182,0.6)]',
      bg: 'from-pink-500/5 to-rose-500/5',
      badge: 'from-pink-500/20 to-rose-500/20 border-pink-400/30'
    },
    {
      border: 'border-emerald-400/20',
      hoverBorder: 'hover:border-emerald-400/50',
      text: 'text-emerald-300',
      glow: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]',
      hoverGlow: 'group-hover:drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]',
      bg: 'from-emerald-500/5 to-teal-500/5',
      badge: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30'
    },
    {
      border: 'border-orange-400/20',
      hoverBorder: 'hover:border-orange-400/50',
      text: 'text-orange-300',
      glow: 'drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]',
      hoverGlow: 'group-hover:drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]',
      bg: 'from-orange-500/5 to-amber-500/5',
      badge: 'from-orange-500/20 to-amber-500/20 border-orange-400/30'
    },
  ]

  const scheme = colorSchemes[index % colorSchemes.length]

  // Vary title sizes - some larger, some smaller
  const titleSizes = ['text-base', 'text-lg', 'text-xl', 'text-2xl']
  const titleSize = titleSizes[index % titleSizes.length]

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex-none w-72 h-40
        cursor-pointer relative
        bg-gradient-to-br ${scheme.bg}
        backdrop-blur-md
        border ${scheme.border} ${scheme.hoverBorder}
        rounded-xl
        p-4
        hover:shadow-2xl
        transition-all duration-300
        group
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${scheme.badge}`}>
          <span className={`text-xs ${scheme.text} font-light ${scheme.glow}`}>
            {memory.platform.toUpperCase()}
          </span>
        </div>
        <div className={`text-xs ${scheme.text}/40 font-light`}>
          {format(new Date(memory.timestamp), 'MMM d')}
        </div>
      </div>

      {/* Title - varying sizes with GLOW */}
      <h3 className={`${scheme.text} font-light ${titleSize} mb-2 leading-tight line-clamp-2 ${scheme.glow} ${scheme.hoverGlow} transition-all`}>
        {memory.title}
      </h3>

      {/* Topic */}
      <div className="mb-2">
        <span className={`text-xs ${scheme.text}/60 font-light uppercase tracking-wider`}>
          {memory.topic}
        </span>
      </div>

      {/* Footer */}
      <div className={`flex items-center gap-3 text-xs ${scheme.text}/40 font-light`}>
        <span>{(wordCount / 1000).toFixed(1)}k</span>
        <span>•</span>
        <span>{memory.tags.length} tags</span>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }} />
      </div>
    </motion.div>
  )
}
