import { motion } from 'framer-motion'
import { Position } from '@/types'

interface StampProps {
  text: string
  position: Position
  rotation?: number
  variant?: 'date' | 'status' | 'label'
}

export function Stamp({
  text,
  position,
  rotation = -5,
  variant = 'date',
}: StampProps) {
  const variants = {
    date: {
      color: '#991b1b',
      borderColor: '#991b1b',
      fontSize: '11px',
    },
    status: {
      color: '#166534',
      borderColor: '#166534',
      fontSize: '10px',
    },
    label: {
      color: '#1e40af',
      borderColor: '#1e40af',
      fontSize: '10px',
    },
  }

  const style = variants[variant]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.2, rotate: rotation + 10 }}
      animate={{ opacity: 0.7, scale: 1, rotate: rotation }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div
        className="px-3 py-1.5 font-mono uppercase tracking-wider"
        style={{
          color: style.color,
          border: `2px solid ${style.borderColor}`,
          fontSize: style.fontSize,
          fontWeight: 600,
          borderRadius: '2px',
        }}
      >
        {/* Stamp texture overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='white'/%3E%3Crect width='1' height='1' fill='%23${style.color.slice(1)}'/%3E%3C/svg%3E")`,
            backgroundSize: '4px 4px',
            mixBlendMode: 'multiply',
          }}
        />

        {/* Text */}
        <span className="relative">{text}</span>
      </div>

      {/* Ink bleed effect */}
      <div
        className="absolute -inset-1 opacity-10 blur-[1px]"
        style={{
          border: `3px solid ${style.color}`,
          borderRadius: '3px',
        }}
      />
    </motion.div>
  )
}
