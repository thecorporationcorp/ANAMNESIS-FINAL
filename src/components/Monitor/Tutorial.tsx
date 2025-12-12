import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface TutorialProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Tutorial({ text, style }: TutorialProps) {
  const command = text.commands[0] || text.phrases[0] || 'Step 1...'

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #ff6b9d 0%, #c44569 50%, #ff6b9d 100%)`,
      }}
    >
      {/* VHS Tracking Lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          )`,
        }}
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />

      {/* VHS Date Stamp */}
      <motion.div
        className="absolute top-3 right-3 text-white font-mono text-xs bg-black/50 px-2 py-1"
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-yellow-300">REC</span> ●{' '}
        {new Date(text.date).toLocaleDateString()}
      </motion.div>

      {/* Tutorial Step Card */}
      <div className="absolute inset-4 flex flex-col items-center justify-center">
        {/* Step Number */}
        <motion.div
          className="bg-white text-pink-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4 shadow-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {Math.floor(Math.random() * 5) + 1}
        </motion.div>

        {/* Instruction Text */}
        <motion.div
          className="bg-white/90 rounded-lg px-4 py-3 max-w-[85%] shadow-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-pink-800 text-sm font-medium text-center leading-tight">
            {command.slice(0, 50)}
            {command.length > 50 && '...'}
          </p>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex gap-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= 2 ? 'bg-white' : 'bg-white/30'
              }`}
              animate={i <= 2 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      {/* Brush Stroke Decorations */}
      <motion.div
        className="absolute bottom-8 left-4 w-20 h-1 bg-white/50 rounded-full"
        style={{ transform: 'rotate(-5deg)' }}
        animate={{ scaleX: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <motion.div
        className="absolute top-12 left-6 w-16 h-1 bg-white/30 rounded-full"
        style={{ transform: 'rotate(3deg)' }}
        animate={{ scaleX: [1, 0.8, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* VHS Glitch */}
      <motion.div
        className="absolute left-0 right-0 h-2 bg-white/20"
        style={{ top: '30%' }}
        animate={{
          opacity: [0, 1, 0],
          y: [0, 100, 200],
        }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  )
}
