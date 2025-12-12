import { motion } from 'framer-motion'
import { ExtractedText, MonitorStyle } from '@/types'
import { format } from 'date-fns'

interface NewsProps {
  memory: { id: string }
  text: ExtractedText
  style: MonitorStyle
}

export function News({ text, style }: NewsProps) {
  const headline = text.phrases[0] || 'Breaking News'
  const subheadline = text.phrases[1] || text.questions[0] || 'Story developing...'

  return (
    <div className="absolute inset-0 bg-[#1e3a5f] overflow-hidden">
      {/* News Studio Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, #1e3a5f 0%, #0f2439 50%, #1e3a5f 100%)`,
        }}
      />

      {/* Globe Graphic (simplified) */}
      <motion.div
        className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-cyan-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-2 rounded-full border border-cyan-400/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/20" />
      </motion.div>

      {/* Breaking News Banner */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-red-600 py-1"
        animate={{ backgroundColor: ['#dc2626', '#b91c1c', '#dc2626'] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <p className="text-white text-[10px] font-bold text-center uppercase tracking-wider">
          Breaking News
        </p>
      </motion.div>

      {/* Main Content Area */}
      <div className="absolute inset-0 pt-8 pb-10 px-4 flex flex-col justify-center">
        {/* Headline */}
        <motion.h2
          className="text-white font-bold text-sm leading-tight mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {headline.slice(0, 50)}
          {headline.length > 50 && '...'}
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="text-cyan-200/80 text-xs leading-snug"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subheadline.slice(0, 60)}
          {subheadline.length > 60 && '...'}
        </motion.p>
      </div>

      {/* News Ticker */}
      <div className="absolute bottom-0 left-0 right-0 bg-blue-900">
        {/* Ticker content */}
        <div className="overflow-hidden py-1">
          <motion.p
            className="text-white text-[10px] font-mono whitespace-nowrap"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {text.phrases.slice(0, 5).join(' /// ')} ///
          </motion.p>
        </div>

        {/* Network Logo */}
        <div className="absolute left-0 top-0 bottom-0 bg-yellow-400 px-2 flex items-center">
          <span className="text-blue-900 font-bold text-[10px]">MEM</span>
        </div>
      </div>

      {/* Time Display */}
      <div className="absolute top-8 left-4 text-white/60 text-[10px] font-mono">
        {format(text.date || new Date(), 'HH:mm')}
      </div>

      {/* Live Indicator */}
      <motion.div
        className="absolute top-8 left-16 flex items-center gap-1"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-red-400 text-[10px] font-bold">LIVE</span>
      </motion.div>
    </div>
  )
}
