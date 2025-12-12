import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface SitcomProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Sitcom({ text, style }: SitcomProps) {
  const question = text.questions[0] || text.phrases[0] || '...'

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${style.palette[0]}40 0%, ${style.palette[1] || '#1a1a2e'}80 100%)`,
      }}
    >
      {/* 1950s Living Room Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(255,255,255,0.03) 50px,
              rgba(255,255,255,0.03) 100px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              rgba(255,255,255,0.03) 50px,
              rgba(255,255,255,0.03) 100px
            )
          `,
        }}
      />

      {/* CRT Curve Effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Dialogue Subtitle */}
      <motion.div
        className="absolute bottom-4 left-4 right-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/80 px-4 py-2 text-center">
          <motion.p
            className="text-white font-mono text-sm"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {question.slice(0, 80)}
            {question.length > 80 && '...'}
          </motion.p>
        </div>
      </motion.div>

      {/* Laugh Track Indicator */}
      <motion.div
        className="absolute top-4 right-4"
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.8, 1, 1, 0.8],
        }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      >
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
          LIVE
        </div>
      </motion.div>

      {/* Static Noise Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />

      {/* Channel Number */}
      <div className="absolute top-4 left-4 text-white/30 font-mono text-xs">
        CH-{Math.floor(Math.random() * 99) + 1}
      </div>
    </div>
  )
}
