import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'
import { useMemo } from 'react'

interface GlitchProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Glitch({ text, style }: GlitchProps) {
  const phrase = text.phrases[0] || 'ERROR'

  // Generate random glitch blocks
  const glitchBlocks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: Math.random() * 30 + 10,
        height: Math.random() * 20 + 5,
        color: style.palette[Math.floor(Math.random() * style.palette.length)],
        delay: Math.random() * 2,
      })),
    [style.palette]
  )

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Base gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, ${style.palette[0]}40 0%, #000 50%, ${style.palette[1] || style.palette[0]}40 100%)`,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Glitch Blocks */}
      {glitchBlocks.map((block) => (
        <motion.div
          key={block.id}
          className="absolute"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            width: `${block.width}%`,
            height: `${block.height}%`,
            backgroundColor: block.color,
            mixBlendMode: 'screen',
          }}
          animate={{
            opacity: [0, 0.8, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scaleX: [1, Math.random() * 2, 1],
          }}
          transition={{
            duration: 0.3,
            delay: block.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 1,
          }}
        />
      ))}

      {/* Central Glitched Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{
            x: [0, -3, 3, -1, 1, 0],
          }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {/* RGB Split Effect */}
          <motion.span
            className="absolute text-2xl font-bold text-red-500 opacity-70"
            style={{ mixBlendMode: 'screen' }}
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          >
            {phrase.slice(0, 12)}
          </motion.span>
          <motion.span
            className="absolute text-2xl font-bold text-green-500 opacity-70"
            style={{ mixBlendMode: 'screen' }}
            animate={{ x: [1, -1, 1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          >
            {phrase.slice(0, 12)}
          </motion.span>
          <motion.span
            className="absolute text-2xl font-bold text-blue-500 opacity-70"
            style={{ mixBlendMode: 'screen' }}
            animate={{ x: [2, -2, 2] }}
            transition={{ duration: 0.12, repeat: Infinity }}
          >
            {phrase.slice(0, 12)}
          </motion.span>
          <span className="relative text-2xl font-bold text-white">
            {phrase.slice(0, 12)}
          </span>
        </motion.div>
      </div>

      {/* Horizontal Tear Lines */}
      {[20, 45, 70].map((top, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-[2px] bg-white/30"
          style={{ top: `${top}%` }}
          animate={{
            opacity: [0, 1, 0],
            scaleY: [1, 3, 1],
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 0.2,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />
      ))}

      {/* Noise Overlay */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 0.1, repeat: Infinity }}
      />
    </div>
  )
}
