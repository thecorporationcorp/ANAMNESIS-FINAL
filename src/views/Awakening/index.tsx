import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useAppStore } from '@/stores/appStore'

// Stage types
type AwakeningStage =
  | 'intro'
  | 'prompt'
  | 'processing'
  | 'awakening'
  | 'complete'

export function Awakening() {
  const [stage, setStage] = useState<AwakeningStage>('intro')
  const [progress, setProgress] = useState(0)
  const [monitorCount, setMonitorCount] = useState(0)

  const setView = useAppStore((state) => state.setView)
  const setMemories = useAppStore((state) => state.setMemories)

  // Real import workflow with database integration
  const handleImport = useCallback(async (filePath?: string) => {
    setStage('processing')

    try {
      // Stage 1: Parsing (0-30%)
      for (let i = 0; i <= 30; i++) {
        await new Promise((r) => setTimeout(r, 30))
        setProgress(i)
      }

      // If file path provided, import it
      if (filePath) {
        const result = await window.electronAPI?.db.importExport(filePath)
        if (!result?.success) {
          console.error('Import failed:', result?.message)
          alert(`Import failed: ${result?.message || 'Unknown error'}`)
          setStage('prompt')
          return
        }
      }

      // Stage 2: Understanding (30-60%)
      for (let i = 30; i <= 60; i++) {
        await new Promise((r) => setTimeout(r, 25))
        setProgress(i)
      }

      // Stage 3: Loading from database (60-90%)
      for (let i = 60; i <= 90; i++) {
        await new Promise((r) => setTimeout(r, 20))
        setProgress(i)
      }

      // Load memories from database
      const memories = await window.electronAPI?.db.getMemories({ limit: 1000 })
      const memoryCount = memories?.length || 0

      setMemories(memories || [])

      // Stage 4: Awakening - Animate monitor multiplication
      setStage('awakening')
      for (let i = 0; i <= memoryCount; i += 5) {
        await new Promise((r) => setTimeout(r, 10))
        setMonitorCount(i)
      }
      setMonitorCount(memoryCount)

      // Final progress (90-100%)
      for (let i = 90; i <= 100; i++) {
        await new Promise((r) => setTimeout(r, 50))
        setProgress(i)
      }

      setStage('complete')

      // Transition to wall
      await new Promise((r) => setTimeout(r, 1000))
      setView('wall')
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed. Please try again.')
      setStage('prompt')
    }
  }, [setView, setMemories])

  // Skip to view existing data (or empty state)
  const handleSkipDemo = useCallback(async () => {
    try {
      // Load existing memories from database
      const existingMemories = await window.electronAPI?.db.getMemories({ limit: 1000 })
      setMemories(existingMemories || [])
      setView('wall')
    } catch (error) {
      console.error('Failed to load memories:', error)
      setMemories([])
      setView('wall')
    }
  }, [setView, setMemories])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Background particle / monitor effect */}
      <div className="absolute inset-0 pointer-events-none">
        {stage === 'awakening' && (
          <MonitorMultiplication count={monitorCount} />
        )}
      </div>

      {/* Stage Transitions */}
      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <IntroStage key="intro" onComplete={() => setStage('prompt')} />
        )}

        {stage === 'prompt' && (
          <PromptStage
            key="prompt"
            onImport={handleImport}
            onSkip={handleSkipDemo}
          />
        )}

        {stage === 'processing' && (
          <ProcessingStage key="processing" progress={progress} />
        )}

        {stage === 'awakening' && (
          <AwakeningStage key="awakening" count={monitorCount} />
        )}

        {stage === 'complete' && <CompleteStage key="complete" />}
      </AnimatePresence>
    </motion.div>
  )
}

/* --------------------------------------------------
   INTRO STAGE - FLOATING ORBS DESIGN
-------------------------------------------------- */
function IntroStage({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="text-center relative"
    >
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-pink-400/15 to-orange-500/15 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/2 w-56 h-56 rounded-full bg-gradient-to-br from-violet-400/20 to-cyan-500/15 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Main Text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-5xl md:text-7xl font-light text-white mb-4 tracking-tight relative z-10"
      >
        Your mind is about<br />to become visible
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-white/50 text-lg md:text-xl font-light tracking-wide relative z-10"
      >
        A living visualization of consciousness
      </motion.p>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        onClick={onComplete}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-16 px-12 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 relative z-10 group"
      >
        <span className="text-white text-lg font-light tracking-wider group-hover:text-white/90">
          CONTINUE
        </span>
      </motion.button>
    </motion.div>
  )
}

/* --------------------------------------------------
   PROMPT STAGE — PRODUCTION IMPORT
-------------------------------------------------- */
function PromptStage({
  onImport,
  onSkip,
}: {
  onImport: (filePath?: string) => Promise<void>
  onSkip: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    // In Electron, use the file browser for security
    handleBrowse()
  }

  const handleBrowse = async () => {
    const filePath = await window.electronAPI?.file.selectExport()
    if (filePath) {
      await onImport(filePath)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center max-w-xl"
    >
      <h2 className="text-white font-light text-4xl md:text-5xl mb-8 tracking-tight">
        Import Your History
      </h2>

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowse}
        className={`
          border-2 border-dashed rounded-lg p-16 cursor-pointer
          transition-all duration-300
          ${
            isDragging
              ? 'border-cyber-cyan bg-cyber-cyan/10 scale-105'
              : 'border-cyber-cyan/30 hover:border-cyber-cyan/60'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-white/60">
          <svg
            className="w-20 h-20 mx-auto mb-6 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-2xl font-light mb-2">Drop export file here</p>
          <p className="text-lg text-white/40 font-light">
            ChatGPT, Claude, or Gemini exports
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onSkip}
        className="mt-8 text-white/30 font-light text-base hover:text-white/60 transition-colors"
      >
        Continue without import
      </motion.button>
    </motion.div>
  )
}

/* --------------------------------------------------
   PROCESSING STAGE
-------------------------------------------------- */
function ProcessingStage({ progress }: { progress: number }) {
  const getStatusText = () => {
    if (progress < 30) return 'Parsing...'
    if (progress < 60) return 'Understanding...'
    if (progress < 90) return 'Remembering...'
    return 'Awakening...'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <p className="text-white font-light text-3xl mb-8 tracking-wide">
        {getStatusText()}
      </p>

      <div className="w-96 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      <p className="mt-6 text-white/40 font-light text-lg">{progress}%</p>
    </motion.div>
  )
}

/* --------------------------------------------------
   AWAKENING STAGE
-------------------------------------------------- */
function AwakeningStage({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center z-10"
    >
      <motion.p
        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 font-light text-7xl md:text-8xl"
        animate={{
          opacity: [0.7, 1, 0.7],
          scale: [0.98, 1, 0.98],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {count}
      </motion.p>
      <p className="text-white/60 font-light text-xl mt-4 tracking-wider">
        memories found
      </p>
    </motion.div>
  )
}

/* --------------------------------------------------
   COMPLETE STAGE
-------------------------------------------------- */
function CompleteStage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="text-center"
    >
      <motion.p
        className="text-white font-light text-6xl tracking-wide"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        Awakening
      </motion.p>
    </motion.div>
  )
}

/* --------------------------------------------------
   MONITOR MULTIPLICATION EFFECT
-------------------------------------------------- */
function MonitorMultiplication({ count }: { count: number }) {
  const monitors = Array.from({ length: Math.min(count, 100) }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 60 + 20,
    opacity: Math.random() * 0.3 + 0.1,
    delay: Math.random() * 0.5,
  }))

  return (
    <>
      {monitors.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: m.opacity, scale: 1 }}
          transition={{ delay: m.delay, duration: 0.3 }}
          className="absolute bg-cyber-cyan/20 border border-cyber-cyan/30"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size * 0.6,
          }}
        />
      ))}
    </>
  )
}
