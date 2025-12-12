import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'

interface SearchProps {
  resultsCount: number
  totalCount: number
}

export function Search({ resultsCount, totalCount }: SearchProps) {
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur()
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, setSearchQuery])

  const isFiltering = searchQuery.trim().length > 0

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div
        className={`
          relative glass-panel transition-all duration-300
          ${isFocused ? 'shadow-[0_0_40px_rgba(0,240,255,0.2)]' : ''}
        `}
      >
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-cyan/50">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search your memories..."
          className="
            w-full bg-transparent py-4 pl-12 pr-32
            text-cyber-cyan font-mono text-lg
            placeholder:text-cyber-cyan/30
            focus:outline-none
            caret-cyber-cyan
          "
          spellCheck={false}
          autoComplete="off"
        />

        {/* Keyboard Shortcut Hint */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence>
            {!isFocused && !searchQuery && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-cyber-cyan/30 font-mono text-xs"
              >
                <kbd className="px-2 py-1 bg-cyber-cyan/10 rounded border border-cyber-cyan/20">
                  ⌘K
                </kbd>
              </motion.span>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="text-cyber-cyan/50 hover:text-cyber-cyan transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <AnimatePresence>
          {isFiltering && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-8 left-0 right-0 text-center"
            >
              <span className="text-cyber-cyan/60 font-mono text-sm">
                {resultsCount} of {totalCount} memories match
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blade Runner Style Decorative Lines */}
      <div className="absolute -left-8 top-1/2 w-8 h-px bg-gradient-to-l from-cyber-cyan/30 to-transparent" />
      <div className="absolute -right-8 top-1/2 w-8 h-px bg-gradient-to-r from-cyber-cyan/30 to-transparent" />
    </motion.div>
  )
}
