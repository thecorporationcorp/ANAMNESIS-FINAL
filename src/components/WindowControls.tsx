import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(true)

  useEffect(() => {
    // Check initial maximized state
    window.electronAPI?.window.isMaximized().then(setIsMaximized)
  }, [])

  const handleMinimize = () => {
    window.electronAPI?.window.minimize()
  }

  const handleMaximize = async () => {
    await window.electronAPI?.window.maximize()
    const maximized = await window.electronAPI?.window.isMaximized()
    setIsMaximized(maximized ?? false)
  }

  const handleClose = () => {
    window.electronAPI?.window.close()
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-10 z-[9999] flex items-center justify-between drag-region">
      {/* App Title */}
      <div className="px-4 flex items-center gap-2">
        <span className="text-cyber-cyan/60 font-mono text-sm tracking-[0.3em] uppercase">
          Anamnesis
        </span>
        <span className="text-cyber-cyan/30 font-mono text-xs">v3.0</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center no-drag">
        <WindowButton
          onClick={handleMinimize}
          hoverColor="cyber-cyan"
          label="Minimize"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </WindowButton>

        <WindowButton
          onClick={handleMaximize}
          hoverColor="cyber-cyan"
          label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="9" width="10" height="10" rx="1" />
              <path d="M9 9V5h10v10h-4" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          )}
        </WindowButton>

        <WindowButton
          onClick={handleClose}
          hoverColor="cyber-red"
          label="Close"
          isClose
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </WindowButton>
      </div>
    </div>
  )
}

interface WindowButtonProps {
  onClick: () => void
  hoverColor: string
  label: string
  isClose?: boolean
  children: React.ReactNode
}

function WindowButton({ onClick, hoverColor, label, isClose, children }: WindowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-12 h-10 flex items-center justify-center
        text-white/40 transition-colors duration-200
        ${isClose ? 'hover:bg-cyber-red/80' : 'hover:bg-white/10'}
        hover:text-white
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      {children}
    </motion.button>
  )
}
