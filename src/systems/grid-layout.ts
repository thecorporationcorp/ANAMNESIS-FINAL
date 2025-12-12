import { Memory, GridConfig, GridResult, MonitorLayout } from '@/types'

const ASPECT_RATIOS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
  '21:9': 21 / 9,
}

const DENSITY_CONFIG = {
  low: { columns: 4, minSize: 200 },
  medium: { columns: 6, minSize: 150 },
  high: { columns: 10, minSize: 100 },
  'ultra-high': { columns: 15, minSize: 80 },
}

export function generateGrid(memories: Memory[], config: GridConfig): GridResult {
  const density = DENSITY_CONFIG[config.density]
  const columnCount =
    config.columns === 'auto' ? density.columns : config.columns

  const layouts: MonitorLayout[] = memories.map((_, index) => {
    // Assign aspect ratio based on content characteristics
    const ratioIndex = index % config.aspectRatios.length
    const aspectRatio = config.aspectRatios[ratioIndex]

    // Calculate grid span based on aspect ratio and position
    const span = calculateSpan(aspectRatio, index, columnCount)

    return {
      aspectRatio,
      gridColumn: `span ${span.columns}`,
      gridRow: `span ${span.rows}`,
      zIndex: 1,
    }
  })

  // Create CSS grid template
  const columns = `repeat(${columnCount}, minmax(${density.minSize}px, 1fr))`
  const rows = 'auto'

  return {
    columns,
    rows,
    layout: layouts,
  }
}

function calculateSpan(
  aspectRatio: string,
  index: number,
  totalColumns: number
): { columns: number; rows: number } {
  const ratio = ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] || 1

  // Create visual variety with different span sizes
  const seed = (index * 7 + 13) % 100

  // Most monitors are 1x1
  if (seed < 60) {
    return { columns: 1, rows: 1 }
  }

  // Some monitors span 2 columns
  if (seed < 80) {
    if (ratio > 1.5) {
      // Wide monitors
      return { columns: Math.min(2, totalColumns), rows: 1 }
    }
    return { columns: 1, rows: 1 }
  }

  // Few monitors are larger
  if (seed < 90) {
    if (ratio < 0.7) {
      // Tall monitors
      return { columns: 1, rows: 2 }
    }
    return { columns: Math.min(2, totalColumns), rows: 1 }
  }

  // Rare featured monitors
  if (ratio > 1.8) {
    return { columns: Math.min(3, totalColumns), rows: 1 }
  }

  return { columns: Math.min(2, totalColumns), rows: 2 }
}

export function optimizeGridLayout(
  layouts: MonitorLayout[],
  viewportWidth: number,
  viewportHeight: number
): MonitorLayout[] {
  // Dynamic optimization based on viewport
  const scaleFactor = Math.min(viewportWidth / 1920, viewportHeight / 1080)

  return layouts.map((layout) => ({
    ...layout,
    // Adjust for viewport
  }))
}

export function getGridPosition(
  index: number,
  totalItems: number,
  columns: number
): { x: number; y: number } {
  const row = Math.floor(index / columns)
  const col = index % columns

  return {
    x: col / columns,
    y: row / Math.ceil(totalItems / columns),
  }
}
