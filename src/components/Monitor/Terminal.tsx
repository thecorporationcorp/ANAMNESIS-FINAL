import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'

interface TerminalProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function Terminal({ text, style }: TerminalProps) {
  const terms = text.terms.slice(0, 8)
  const command = text.commands[0] || text.phrases[0] || '> system ready'

  return (
    <div className="absolute inset-0 bg-[#0d1117] overflow-hidden font-mono">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-[#8b949e] text-xs">memory.sh</span>
      </div>

      {/* Terminal Content */}
      <div className="p-3 text-xs space-y-1 overflow-hidden h-full">
        {/* Command Prompt */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-[#7ee787]">➜</span>
          <span className="text-[#79c0ff]">~/memories</span>
          <motion.span
            className="text-[#c9d1d9]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            █
          </motion.span>
        </motion.div>

        {/* Output Lines */}
        <motion.div
          className="text-[#8b949e] text-[10px] mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-[#7ee787]">$</span> {command.slice(0, 40)}
        </motion.div>

        {/* Variable Definitions */}
        <motion.div
          className="space-y-0.5 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {terms.slice(0, 4).map((term, i) => (
            <motion.div
              key={term}
              className="text-[10px]"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <span className="text-[#ff7b72]">const</span>{' '}
              <span className="text-[#d2a8ff]">{term}</span>{' '}
              <span className="text-[#c9d1d9]">=</span>{' '}
              <span className="text-[#a5d6ff]">
                "{Math.random().toString(36).slice(2, 8)}"
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Function Call */}
        <motion.div
          className="mt-2 text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className="text-[#ffa657]">process</span>
          <span className="text-[#c9d1d9]">(</span>
          <span className="text-[#a5d6ff]">"memory"</span>
          <span className="text-[#c9d1d9]">)</span>
        </motion.div>

        {/* Output */}
        <motion.div
          className="mt-2 text-[10px] text-[#7ee787]"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✓ Compiled successfully
        </motion.div>
      </div>

      {/* Scanline Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.01) 2px,
            rgba(0, 255, 0, 0.01) 4px
          )`,
        }}
      />

      {/* Screen Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(39, 201, 63, 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
