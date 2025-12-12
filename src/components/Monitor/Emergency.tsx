import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface EmergencyProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Emergency({ text, style }: EmergencyProps) {
  const breakthrough = text.breakthroughs[0] || text.phrases[0] || 'ALERT'

  return (
    <div className="absolute inset-0 bg-[#1a0000] overflow-hidden">
      {/* Pulsing Red Background */}
      <motion.div
        className="absolute inset-0 bg-red-600"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Test Pattern Bars */}
      <div className="absolute inset-0 flex">
        {['#ff0000', '#ff3300', '#ff6600', '#ffcc00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'].map(
          (color, i) => (
            <motion.div
              key={i}
              className="flex-1"
              style={{ backgroundColor: color, opacity: 0.15 }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
            />
          )
        )}
      </div>

      {/* Emergency Alert Box */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          className="bg-black/80 border-4 border-red-500 p-4 max-w-[90%]"
          animate={{
            borderColor: ['#ef4444', '#fbbf24', '#ef4444'],
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.5)',
              '0 0 40px rgba(251, 191, 36, 0.5)',
              '0 0 20px rgba(239, 68, 68, 0.5)',
            ],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {/* Alert Header */}
          <motion.div
            className="bg-red-600 -m-4 mb-3 p-2 flex items-center justify-center gap-2"
            animate={{ backgroundColor: ['#dc2626', '#b91c1c', '#dc2626'] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <motion.span
              className="text-yellow-300 text-lg"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⚠
            </motion.span>
            <span className="text-white font-bold text-xs uppercase tracking-widest">
              Memory Alert
            </span>
            <motion.span
              className="text-yellow-300 text-lg"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ⚠
            </motion.span>
          </motion.div>

          {/* Alert Content */}
          <motion.p
            className="text-white text-center text-sm font-mono leading-tight"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {breakthrough.slice(0, 60)}
            {breakthrough.length > 60 && '...'}
          </motion.p>
        </motion.div>
      </div>

      {/* Scrolling Alert Ticker */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-red-700 py-1 overflow-hidden"
        style={{ whiteSpace: 'nowrap' }}
      >
        <motion.p
          className="text-white font-mono text-xs inline-block"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          {`ATTENTION: ${breakthrough} /// `.repeat(3)}
        </motion.p>
      </motion.div>

      {/* Static Noise */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
    </div>
  )
}
