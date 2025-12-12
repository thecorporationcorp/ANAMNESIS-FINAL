import { motion } from 'framer-motion'
import { Position } from '@/types'

interface MatchbookProps {
  text: string
  position: Position
  rotation?: number
}

export function Matchbook({ text, position, rotation = 0 }: MatchbookProps) {
  // Platform-specific colors
  const platformColors: Record<string, { bg: string; accent: string }> = {
    chatgpt: { bg: '#10a37f', accent: '#0d8a6a' },
    claude: { bg: '#d97706', accent: '#b45309' },
    gemini: { bg: '#4285f4', accent: '#3367d6' },
    local: { bg: '#6b7280', accent: '#4b5563' },
    other: { bg: '#78716c', accent: '#57534e' },
  }

  const colors = platformColors[text.toLowerCase()] || platformColors.other

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, rotate: rotation - 5 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.4 }}
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Matchbook shape */}
      <div
        className="relative w-16 h-10 rounded-sm overflow-hidden shadow-md"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Strike strip at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{ backgroundColor: colors.accent }}
        />

        {/* Diagonal stripes pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 3px,
              rgba(255,255,255,0.3) 3px,
              rgba(255,255,255,0.3) 6px
            )`,
          }}
        />

        {/* Platform text */}
        <div className="absolute inset-0 flex items-center justify-center pb-1">
          <span className="text-white text-[9px] font-bold uppercase tracking-wider">
            {text}
          </span>
        </div>

        {/* Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
      </div>

      {/* Shadow */}
      <div
        className="absolute inset-0 -z-10 translate-y-1 translate-x-0.5 rounded-sm opacity-20"
        style={{ backgroundColor: '#000' }}
      />
    </motion.div>
  )
}
