import { motion } from 'framer-motion'
import { useStats } from '@/stores/appStore'
import { format } from 'date-fns'

export function Stats() {
  const stats = useStats()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="glass-panel px-6 py-4 space-y-2">
        {/* Memory Count */}
        <div className="flex items-baseline gap-2">
          <span className="text-cyber-cyan font-mono text-2xl tabular-nums">
            {stats.totalMemories.toLocaleString()}
          </span>
          <span className="text-cyber-cyan/50 font-mono text-xs uppercase tracking-wider">
            Memories
          </span>
        </div>

        {/* Word Count */}
        <div className="flex items-baseline gap-2">
          <span className="text-cyber-cyan/70 font-mono text-lg tabular-nums">
            {formatNumber(stats.totalWords)}
          </span>
          <span className="text-cyber-cyan/40 font-mono text-xs uppercase tracking-wider">
            Words
          </span>
        </div>

        {/* Platform Distribution */}
        <div className="pt-2 border-t border-cyber-cyan/20">
          <div className="flex gap-3">
            {Object.entries(stats.platforms).map(([platform, count]) => (
              <PlatformBadge key={platform} platform={platform} count={count} />
            ))}
          </div>
        </div>

        {/* Current Time - Blade Runner style */}
        <div className="pt-2 border-t border-cyber-cyan/20">
          <span className="text-cyber-cyan/40 font-mono text-[10px] tracking-[0.3em]">
            {format(new Date(), 'yyyy.MM.dd HH:mm:ss')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function PlatformBadge({ platform, count }: { platform: string; count: number }) {
  const colors: Record<string, string> = {
    chatgpt: 'bg-green-500/20 text-green-400 border-green-500/30',
    claude: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    gemini: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    local: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  return (
    <div
      className={`
        px-2 py-1 rounded border font-mono text-[10px] uppercase
        ${colors[platform] || colors.other}
      `}
    >
      {platform}: {count}
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
