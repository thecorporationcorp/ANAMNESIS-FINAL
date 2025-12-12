import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'
import { useMemo } from 'react'

interface StaticProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Static({ text, style }: StaticProps) {
  // Generate static noise pattern
  const noiseLines = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        y: i * 2,
        opacity: Math.random() * 0.5 + 0.1,
        width: Math.random() * 100,
        speed: Math.random() * 0.5 + 0.2,
      })),
    []
  )

  return (
    <div className="absolute inset-0 bg-gray-900 overflow-hidden">
      {/* Base Static Noise */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />

      {/* Horizontal Noise Lines */}
      {noiseLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute left-0 h-px bg-white"
          style={{
            top: `${line.y}%`,
            width: `${line.width}%`,
            opacity: line.opacity,
          }}
          animate={{
            x: ['-100%', '200%'],
            opacity: [0, line.opacity, 0],
          }}
          transition={{
            duration: line.speed,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        />
      ))}

      {/* Channel Number */}
      <motion.div
        className="absolute top-4 left-4 text-white/80 font-mono text-lg"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        CH--
      </motion.div>

      {/* No Signal Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white/60 font-mono text-sm mb-1">NO SIGNAL</p>
          <p className="text-white/30 font-mono text-xs">
            {text.topic || 'Unknown Channel'}
          </p>
        </motion.div>
      </div>

      {/* Color Bars at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex">
        {['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f', '#000'].map(
          (color, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: color, opacity: 0.6 }}
            />
          )
        )}
      </div>

      {/* VHS Tracking Artifact */}
      <motion.div
        className="absolute left-0 right-0 h-8 bg-white/10"
        animate={{
          y: ['-10%', '110%'],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.1) 2px,
            rgba(0,0,0,0.1) 4px
          )`,
        }}
      />
    </div>
  )
}
