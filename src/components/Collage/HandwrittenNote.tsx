import { motion } from 'framer-motion'
import { Position } from '@/types'

interface HandwrittenNoteProps {
  text: string
  position: Position
  rotation?: number
  color?: string
}

export function HandwrittenNote({
  text,
  position,
  rotation = 0,
  color = '#2563eb',
}: HandwrittenNoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: rotation - 5 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute max-w-[280px]"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Note content */}
      <div
        className="handwritten-text text-lg leading-relaxed"
        style={{
          color,
          textShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        {/* Quotation mark */}
        <span
          className="text-3xl opacity-30 block -mb-2"
          style={{ color }}
        >
          "
        </span>

        {text}

        {/* Closing quotation */}
        <span
          className="text-3xl opacity-30 inline-block ml-1"
          style={{ color }}
        >
          "
        </span>
      </div>

      {/* Underline flourish */}
      <motion.svg
        className="absolute -bottom-2 left-0 w-full h-3 opacity-30"
        viewBox="0 0 200 10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.path
          d="M0,5 Q50,0 100,5 T200,5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  )
}
