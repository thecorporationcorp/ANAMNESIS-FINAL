import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { generateCollageLayout } from '@/systems/collage-generator'
import {
  TypewriterText,
  HandwrittenNote,
  Photo,
  Tape,
  Stamp,
  Matchbook,
} from '@/components/Collage'

interface MemoryCollageProps {
  memoryId: string
  onClose: () => void
}

export function MemoryCollage({ memoryId, onClose }: MemoryCollageProps) {
  const memories = useAppStore((state) => state.memories)
  const memory = memories.find((m) => m.id === memoryId)

  const layout = useMemo(() => {
    if (!memory) return null
    return generateCollageLayout(memory)
  }, [memory])

  if (!memory || !layout) {
    return null
  }

  const handleContinue = () => {
    // Generate SPINE seed and open in new tab/window
    console.log('Continue this memory:', memory.id)
  }

  const handleExport = () => {
    // Export as SPINE seed file
    console.log('Export SPINE for:', memory.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 overflow-auto"
      onClick={onClose}
    >
      {/* Vintage Paper Background */}
      <div className="absolute inset-0 bg-vintage-cream paper-texture" />

      {/* Subtle Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Collage Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative w-full min-h-screen p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Conversation Text */}
        <TypewriterText
          text={memory.conversation}
          position={layout.mainText.position}
          width={layout.mainText.width}
          rotation={layout.mainText.rotation}
        />

        {/* Handwritten Notes */}
        {layout.notes.map((note, i) => (
          <HandwrittenNote
            key={`note-${i}`}
            text={note.text}
            position={note.position}
            rotation={note.rotation}
            color={note.color}
          />
        ))}

        {/* Photos / Code Snippets */}
        {layout.photos.map((photo, i) => (
          <Photo
            key={`photo-${i}`}
            type={photo.type}
            src={photo.src}
            position={photo.position}
            size={photo.size}
            rotation={photo.rotation}
          />
        ))}

        {/* Tape Pieces */}
        {layout.tape.map((piece, i) => (
          <Tape
            key={`tape-${i}`}
            position={piece.position}
            rotation={piece.rotation}
            length={piece.length}
          />
        ))}

        {/* Date Stamp */}
        <Stamp
          text={new Date(memory.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          position={layout.dateStamp}
          rotation={layout.dateStamp.rotation}
        />

        {/* Platform Label */}
        <Matchbook text={memory.platform} position={layout.platformLabel} />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute top-8 left-12"
        >
          <h1
            className="text-vintage-ink font-script text-4xl"
            style={{ transform: 'rotate(-2deg)' }}
          >
            {memory.title}
          </h1>
        </motion.div>

        {/* Topic Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-8 right-12"
        >
          <span
            className="
              px-4 py-2 bg-vintage-sepia/30
              text-vintage-brown font-mono text-sm
              border border-vintage-brown/30 rounded
            "
            style={{ transform: 'rotate(1deg)' }}
          >
            {memory.topic}
          </span>
        </motion.div>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-32 left-12 flex flex-wrap gap-2 max-w-xs"
          >
            {memory.tags.slice(0, 5).map((tag, i) => (
              <span
                key={tag}
                className="
                  px-2 py-1 text-xs font-mono
                  bg-vintage-cream border border-vintage-brown/20
                  text-vintage-brown/70
                "
                style={{ transform: `rotate(${(i - 2) * 2}deg)` }}
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-8 right-8 flex gap-4"
      >
        <button onClick={handleContinue} className="vintage-button">
          Continue This
        </button>

        <button
          onClick={handleExport}
          className="vintage-button bg-cyber-cyan/90 hover:bg-cyber-cyan"
        >
          Export SPINE
        </button>

        <button
          onClick={onClose}
          className="vintage-button bg-slate-300 text-slate-800 hover:bg-slate-200"
        >
          Close
        </button>
      </motion.div>

      {/* Close hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 left-8 text-vintage-brown/40 font-mono text-xs"
      >
        Click outside or press ESC to close
      </motion.div>
    </motion.div>
  )
}

export { MemoryCollage as default }
