import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { Awakening } from '@/views/Awakening'
import { Wall } from '@/views/Wall'
import { MemoryCollage } from '@/views/Memory'
import { WindowControls } from '@/components/WindowControls'

export function App() {
  const view = useAppStore((state) => state.view)
  const selectedMemoryId = useAppStore((state) => state.selectedMemoryId)
  const selectMemory = useAppStore((state) => state.selectMemory)

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Custom Window Controls (frameless window) */}
      <WindowControls />

      {/* Main View Router */}
      <AnimatePresence mode="wait">
        {view === 'awakening' && <Awakening key="awakening" />}
        {view === 'wall' && <Wall key="wall" />}
      </AnimatePresence>

      {/* Memory Collage Overlay */}
      <AnimatePresence>
        {selectedMemoryId && (
          <MemoryCollage
            key="memory-collage"
            memoryId={selectedMemoryId}
            onClose={() => selectMemory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
