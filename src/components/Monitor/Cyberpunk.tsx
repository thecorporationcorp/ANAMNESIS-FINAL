import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface CyberpunkProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Cyberpunk({ text, style }: CyberpunkProps) {
  const term = text.terms[0] || text.phrases[0]?.slice(0, 20) || 'SYSTEM'

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      style={{
        background: `linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 100%)`,
      }}
    >
      {/* Neon Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Perspective Grid Floor */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-40"
        style={{
          background: `linear-gradient(transparent 0%, rgba(255, 0, 170, 0.2) 100%)`,
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main Neon Sign */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          animate={{
            textShadow: [
              '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #00f0ff',
              '0 0 15px #00f0ff, 0 0 30px #00f0ff, 0 0 60px #00f0ff',
              '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #00f0ff',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-cyber-cyan font-bold text-lg uppercase tracking-[0.3em]">
            {term.slice(0, 15)}
          </p>
        </motion.div>
      </div>

      {/* Japanese Characters Decoration */}
      <motion.div
        className="absolute top-4 left-4 text-cyber-pink/50 text-xs font-mono"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        記憶
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 text-cyber-cyan/50 text-xs font-mono"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        データ
      </motion.div>

      {/* Scanning Line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner Decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyber-cyan/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyber-cyan/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyber-pink/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyber-pink/50" />

      {/* Data Stream */}
      <motion.div
        className="absolute right-2 top-8 bottom-8 w-4 overflow-hidden opacity-30"
        style={{ writingMode: 'vertical-rl' }}
      >
        <motion.div
          className="text-cyber-cyan font-mono text-[8px]"
          animate={{ y: ['0%', '-50%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          {Array(20)
            .fill(0)
            .map(() => Math.random().toString(16).slice(2, 6))
            .join(' ')}
          {Array(20)
            .fill(0)
            .map(() => Math.random().toString(16).slice(2, 6))
            .join(' ')}
        </motion.div>
      </motion.div>

      {/* Flicker Effect */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        animate={{ opacity: [0, 0.03, 0, 0, 0, 0.02, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  )
}
