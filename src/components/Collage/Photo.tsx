import { motion } from 'framer-motion'
import { Position, PhotoElement } from '@/types'

interface PhotoProps {
  type: PhotoElement['type']
  src: string
  position: Position
  size: { width: number; height: number }
  rotation?: number
}

export function Photo({
  type,
  src,
  position,
  size,
  rotation = 0,
}: PhotoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Polaroid Frame */}
      <div
        className="bg-white p-3 pb-12 shadow-xl"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Photo Content */}
        <div
          className="bg-gray-200 overflow-hidden"
          style={{
            height: size.height,
          }}
        >
          {type === 'code-snippet' && (
            <CodeSnippetContent content={src} />
          )}
          {type === 'diagram' && (
            <DiagramContent />
          )}
          {type === 'placeholder' && (
            <PlaceholderContent />
          )}
          {type === 'polaroid' && src && (
            <img
              src={src}
              alt="Memory"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Polaroid caption area */}
        <div className="absolute bottom-2 left-3 right-3">
          <div className="h-6 flex items-end">
            <span className="handwritten-text text-xs text-vintage-brown/60">
              memory fragment
            </span>
          </div>
        </div>
      </div>

      {/* Photo corners effect */}
      <PhotoCorners />
    </motion.div>
  )
}

function CodeSnippetContent({ content }: { content: string }) {
  return (
    <div className="bg-[#1e1e1e] p-3 h-full overflow-hidden font-mono text-[10px]">
      <pre className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {content.slice(0, 300)}
        {content.length > 300 && '\n...'}
      </pre>
    </div>
  )
}

function DiagramContent() {
  return (
    <div className="bg-white h-full flex items-center justify-center p-4">
      <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
          <path d="M3 9h18M9 21V9" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  )
}

function PlaceholderContent() {
  return (
    <div className="bg-gradient-to-br from-vintage-sepia/20 to-vintage-brown/20 h-full flex items-center justify-center">
      <div className="text-center text-vintage-brown/40">
        <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
          <path d="M21 15l-5-5L5 21" strokeWidth="1.5" />
        </svg>
        <span className="text-xs">Image</span>
      </div>
    </div>
  )
}

function PhotoCorners() {
  return (
    <>
      {/* Corner tabs */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-vintage-brown/20" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-vintage-brown/20" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-vintage-brown/20" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-vintage-brown/20" />
    </>
  )
}
