import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface CartoonProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Cartoon({ text, style }: CartoonProps) {
  const phrase = text.phrases[0] || 'Loading...'

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${style.palette[0]} 0%, ${style.palette[1] || style.palette[0]} 100%)`,
      }}
    >
      {/* 1930s Animation Style Background */}
      <div className="absolute inset-0">
        {/* Radiating circles */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `repeating-radial-gradient(
              circle at center,
              transparent 0px,
              transparent 20px,
              rgba(0,0,0,0.1) 20px,
              rgba(0,0,0,0.1) 40px
            )`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />

        {/* Rubber hose style shapes */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-black/10"
          style={{ top: '10%', left: '10%' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute w-24 h-24 rounded-full bg-black/10"
          style={{ bottom: '15%', right: '15%' }}
          animate={{
            scale: [1.1, 0.9, 1.1],
            x: [0, -5, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Text Bubble */}
      <motion.div
        className="relative z-10 bg-white rounded-3xl px-6 py-4 max-w-[80%] shadow-lg"
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Bubble tail */}
        <div
          className="absolute -bottom-3 left-8 w-0 h-0"
          style={{
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: '15px solid white',
          }}
        />

        <p
          className="text-black font-bold text-center text-sm leading-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {phrase.slice(0, 60)}
          {phrase.length > 60 && '...'}
        </p>
      </motion.div>

      {/* Stars / Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 18}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  )
}
