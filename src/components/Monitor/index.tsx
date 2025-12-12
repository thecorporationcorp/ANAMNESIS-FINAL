import { motion } from 'framer-motion'
import { useMemo, memo } from 'react'
import { Memory, MonitorLayout, MonitorStyle } from '@/types'
import { Cartoon } from './Cartoon'
import { Sitcom } from './Sitcom'
import { Tutorial } from './Tutorial'
import { Cyberpunk } from './Cyberpunk'
import { Terminal } from './Terminal'
import { Glitch } from './Glitch'
import { Emergency } from './Emergency'
import { News } from './News'
import { Static } from './Static'
import { deriveMonitorStyle } from '@/systems/monitor-classifier'
import { extractUserText } from '@/systems/text-extraction'
import { Scanlines, FilmGrain, Flicker } from '@/components/Effects'

interface MonitorProps {
  memory: Memory
  layout: MonitorLayout
  isHighlighted: boolean
  isHovered: boolean
  onClick: () => void
  onHover: () => void
  onLeave: () => void
}

const MonitorComponents = {
  cartoon: Cartoon,
  sitcom: Sitcom,
  tutorial: Tutorial,
  cyberpunk: Cyberpunk,
  terminal: Terminal,
  glitch: Glitch,
  emergency: Emergency,
  news: News,
  static: Static,
} as const

export const Monitor = memo(function Monitor({
  memory,
  layout,
  isHighlighted,
  isHovered,
  onClick,
  onHover,
  onLeave,
}: MonitorProps) {
  const style = useMemo(() => deriveMonitorStyle(memory), [memory])
  const userText = useMemo(() => extractUserText(memory), [memory])

  const Component = MonitorComponents[style.type] || Static

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer monitor-frame"
      style={{
        aspectRatio: layout.aspectRatio,
        gridColumn: layout.gridColumn,
        gridRow: layout.gridRow,
        zIndex: isHovered ? 10 : layout.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isHighlighted ? 1 : 0.2,
        scale: isHovered ? 1.05 : 1,
        filter: isHighlighted
          ? isHovered
            ? 'brightness(1.4) saturate(1.3)'
            : 'brightness(1) saturate(1)'
          : 'brightness(0.3) saturate(0.5)',
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ zIndex: 20 }}
    >
      {/* Animated Content */}
      <Component memory={memory} text={userText} style={style} />

      {/* Screen Effects Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {style.scanlines && <Scanlines opacity={0.08} />}
        <FilmGrain intensity={0.03} />
        {style.flicker && <Flicker interval={style.flickerSpeed || 4000} />}
      </div>

      {/* Hover Glow */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 30px ${style.palette[0]}40, 0 0 20px ${style.palette[0]}30`,
          }}
        />
      )}

      {/* Corner Info (visible on hover) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 right-2"
        >
          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
            <p className="text-white/90 font-mono text-xs truncate">
              {memory.title}
            </p>
            <p className="text-white/50 font-mono text-[10px]">
              {memory.platform} · {memory.topic}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
})

export default Monitor
