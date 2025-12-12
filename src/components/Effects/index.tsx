import { motion } from 'framer-motion'

// Scanlines Effect
export function Scanlines({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.3) 2px,
          rgba(0, 0, 0, 0.3) 4px
        )`,
      }}
    />
  )
}

// Film Grain Effect
export function FilmGrain({ intensity = 0.05 }: { intensity?: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: intensity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
      animate={{ opacity: [intensity, intensity * 1.5, intensity] }}
      transition={{ duration: 0.1, repeat: Infinity }}
    />
  )
}

// Flicker Effect
export function Flicker({ interval = 4000 }: { interval?: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none bg-white"
      animate={{
        opacity: [0, 0, 0, 0.03, 0, 0, 0.02, 0, 0, 0],
      }}
      transition={{
        duration: interval / 1000,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// Chromatic Aberration Effect
export function ChromaticAberration({ intensity = 2 }: { intensity?: number }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          linear-gradient(90deg,
            rgba(255, 0, 0, 0.05) 0%,
            transparent 20%,
            transparent 80%,
            rgba(0, 255, 255, 0.05) 100%
          )
        `,
      }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  )
}

// Bloom/Glow Effect
export function Bloom({ color = '#00f0ff', intensity = 0.3 }: { color?: string; intensity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
      }}
    />
  )
}

// Vignette Effect
export function Vignette({ intensity = 0.4 }: { intensity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${intensity}) 100%)`,
      }}
    />
  )
}

// Complete Blade Runner Effects Package
export function BladeRunnerEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Global Scanlines */}
      <Scanlines opacity={0.03} />

      {/* Chromatic Aberration on edges */}
      <ChromaticAberration intensity={1.5} />

      {/* Subtle Film Grain */}
      <FilmGrain intensity={0.02} />

      {/* Edge Vignette */}
      <Vignette intensity={0.3} />

      {/* Ambient Glow from monitors */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 0, 170, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 102, 255, 0.03) 0%, transparent 70%)
          `,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Horizontal Scan Line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
