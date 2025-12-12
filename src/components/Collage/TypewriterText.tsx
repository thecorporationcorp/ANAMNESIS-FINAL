import { motion } from 'framer-motion'
import { Position } from '@/types'

interface TypewriterTextProps {
  text: string
  position: Position
  width?: number
  rotation?: number
}

export function TypewriterText({
  text,
  position,
  width = 600,
  rotation = 0,
}: TypewriterTextProps) {
  // Format conversation text
  const formattedText = text
    .split('\n')
    .map((line) => {
      if (line.startsWith('USER:')) {
        return { type: 'user', content: line.replace('USER:', '').trim() }
      }
      if (line.startsWith('ASSISTANT:')) {
        return { type: 'assistant', content: line.replace('ASSISTANT:', '').trim() }
      }
      return { type: 'text', content: line }
    })
    .filter((line) => line.content.trim())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute bg-white shadow-xl"
      style={{
        left: position.x,
        top: position.y,
        width,
        transform: `rotate(${rotation}deg)`,
        padding: '2rem',
        border: '1px solid #e5e5e5',
      }}
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Typewriter text content */}
      <div className="relative space-y-4 typewriter-text text-sm leading-relaxed">
        {formattedText.slice(0, 20).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`
              ${line.type === 'user' ? 'text-vintage-ink font-medium' : ''}
              ${line.type === 'assistant' ? 'text-vintage-brown/80 pl-4 border-l-2 border-vintage-sepia/30' : ''}
            `}
          >
            {line.type === 'user' && (
              <span className="text-vintage-red text-xs uppercase tracking-wider mr-2">
                You:
              </span>
            )}
            {line.content.slice(0, 200)}
            {line.content.length > 200 && '...'}
          </motion.div>
        ))}

        {formattedText.length > 20 && (
          <p className="text-vintage-brown/50 text-xs italic text-center pt-4 border-t border-vintage-sepia/20">
            ... and {formattedText.length - 20} more exchanges
          </p>
        )}
      </div>

      {/* Corner fold effect */}
      <div
        className="absolute top-0 right-0 w-8 h-8"
        style={{
          background: `linear-gradient(135deg, transparent 50%, #f0ece4 50%)`,
          boxShadow: '-2px 2px 5px rgba(0,0,0,0.1)',
        }}
      />
    </motion.div>
  )
}
