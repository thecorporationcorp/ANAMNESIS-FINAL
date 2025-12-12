import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { format } from 'date-fns'

interface MemoryCollageProps {
  memoryId: string
  onClose: () => void
}

export function MemoryCollage({ memoryId, onClose }: MemoryCollageProps) {
  const memories = useAppStore((state) => state.memories)
  const memory = memories.find((m) => m.id === memoryId)

  if (!memory) {
    return null
  }

  // Parse conversation into messages
  const lines = memory.conversation.split('\n').filter((l) => l.trim())
  const messages = lines.map((line) => {
    const isUser = line.startsWith('USER:') || line.startsWith('Human:')
    const isAssistant = line.startsWith('ASSISTANT:') || line.startsWith('Assistant:')

    if (isUser) {
      return {
        role: 'user' as const,
        content: line.replace(/^(USER:|Human:)\s*/, ''),
      }
    } else if (isAssistant) {
      return {
        role: 'assistant' as const,
        content: line.replace(/^(ASSISTANT:|Assistant:)\s*/, ''),
      }
    }
    return null
  }).filter(Boolean) as Array<{ role: 'user' | 'assistant'; content: string }>

  const wordCount = memory.conversation.split(/\s+/).length
  const exchangeCount = Math.floor(messages.length / 2)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={onClose}
    >
      {/* Futuristic Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 blur-3xl"
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
          className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/8 to-orange-500/8 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-violet-500/12 to-cyan-500/8 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 7,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-12 pt-12 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight leading-tight"
          >
            {memory.title}
          </motion.h1>

          {/* Metadata Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-sm text-white/70 font-light">
                {memory.platform}
              </span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-sm text-white/70 font-light">
                {format(new Date(memory.timestamp), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-sm text-white/70 font-light">
                {wordCount.toLocaleString()} words
              </span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-sm text-white/70 font-light">
                {exchangeCount} exchanges
              </span>
            </div>
          </motion.div>

          {/* Topic & Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2"
          >
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30">
              <span className="text-sm text-cyan-200 font-light">{memory.topic}</span>
            </div>
            {memory.tags.slice(0, 6).map((tag) => (
              <div
                key={tag}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <span className="text-xs text-white/50 font-light">#{tag}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-12 pb-32 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, staggerChildren: 0.05 }}
            className="space-y-6 max-w-4xl"
          >
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: message.role === 'user' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.03 }}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`
                    max-w-3xl px-6 py-4 rounded-2xl
                    ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-400/20'
                        : 'bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-400/20'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium tracking-wider uppercase ${
                        message.role === 'user' ? 'text-cyan-300' : 'text-violet-300'
                      }`}
                    >
                      {message.role}
                    </span>
                  </div>
                  <p className="text-white/80 text-base leading-relaxed font-light whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex-none fixed bottom-0 left-0 right-0 px-12 py-6 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-xl"
        >
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
            >
              <span className="text-white text-base font-light tracking-wider">CLOSE</span>
            </button>
          </div>
        </motion.div>

        {/* ESC hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 left-12 text-white/30 text-sm font-light"
        >
          Press ESC or click outside to close
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export { MemoryCollage as default }
