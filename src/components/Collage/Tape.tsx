import { motion } from 'framer-motion'
import { Position } from '@/types'

interface TapeProps {
  position: Position
  rotation?: number
  length?: number
  variant?: 'clear' | 'masking' | 'washi'
}

export function Tape({
  position,
  rotation = 0,
  length = 80,
  variant = 'clear',
}: TapeProps) {
  const styles = {
    clear: {
      background: 'rgba(250, 248, 243, 0.7)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      shadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
    },
    masking: {
      background: '#f5f0e6',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      shadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
    },
    washi: {
      background: 'linear-gradient(90deg, #e8d5c4 0%, #f0e6d8 50%, #e8d5c4 100%)',
      border: 'none',
      shadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
    },
  }

  const style = styles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        width: length,
        height: 24,
        transform: `rotate(${rotation}deg)`,
        background: style.background,
        border: style.border,
        boxShadow: style.shadow,
        borderRadius: '1px',
      }}
    >
      {/* Tape texture - subtle diagonal lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          )`,
        }}
      />

      {/* Edge highlights */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-black/5" />

      {/* Torn edges effect */}
      <svg
        className="absolute -left-[2px] top-0 h-full w-[3px]"
        viewBox="0 0 3 24"
        preserveAspectRatio="none"
      >
        <path
          d="M3,0 L2,2 L3,4 L2,6 L3,8 L2,10 L3,12 L2,14 L3,16 L2,18 L3,20 L2,22 L3,24"
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />
      </svg>
      <svg
        className="absolute -right-[2px] top-0 h-full w-[3px]"
        viewBox="0 0 3 24"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 L1,2 L0,4 L1,6 L0,8 L1,10 L0,12 L1,14 L0,16 L1,18 L0,20 L1,22 L0,24"
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  )
}
