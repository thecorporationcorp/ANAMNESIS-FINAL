/**
 * Semantic Graph Builder
 *
 * Constructs a knowledge graph from memories showing:
 * - Conceptual relationships
 * - Temporal connections
 * - Topic clusters
 * - Idea evolution
 * - Cross-references
 */

import { Memory } from '../../src/types'

export interface MemoryNode {
  id: string
  title: string
  topic: string
  timestamp: Date
  concepts: string[]
  embedding?: number[]
  cluster?: number
  centrality: number
  importance: number
}

export interface MemoryEdge {
  source: string
  target: string
  weight: number
  type: EdgeType
  sharedConcepts: string[]
}

export type EdgeType =
  | 'temporal' // Sequential in time
  | 'conceptual' // Shared concepts
  | 'causal' // One led to another
  | 'reference' // Explicit reference
  | 'similar' // Semantically similar

export interface SemanticGraph {
  nodes: Map<string, MemoryNode>
  edges: MemoryEdge[]
  clusters: Map<number, string[]>
  topics: Map<string, string[]>
  timeline: Map<string, string[]> // date -> memory IDs
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  density: number
  avgDegree: number
  clusters: number
  mostCentral: string[]
  mostImportant: string[]
}

/**
 * Build semantic graph from memories
 */
export function buildSemanticGraph(memories: Memory[]): SemanticGraph {
  const graph: SemanticGraph = {
    nodes: new Map(),
    edges: [],
    clusters: new Map(),
    topics: new Map(),
    timeline: new Map(),
  }

  // Step 1: Create nodes
  memories.forEach(memory => {
    const node = createNode(memory)
    graph.nodes.set(memory.id, node)

    // Add to timeline
    const dateKey = new Date(memory.timestamp).toISOString().split('T')[0]
    if (!graph.timeline.has(dateKey)) {
      graph.timeline.set(dateKey, [])
    }
    graph.timeline.get(dateKey)!.push(memory.id)

    // Add to topic map
    if (!graph.topics.has(memory.topic)) {
      graph.topics.set(memory.topic, [])
    }
    graph.topics.get(memory.topic)!.push(memory.id)
  })

  // Step 2: Create edges
  const nodeArray = Array.from(graph.nodes.values())

  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const edges = findEdges(nodeArray[i], nodeArray[j])
      graph.edges.push(...edges)
    }
  }

  // Step 3: Calculate centrality
  calculateCentrality(graph)

  // Step 4: Calculate importance
  calculateImportance(graph)

  // Step 5: Detect clusters
  detectClusters(graph)

  return graph
}

/**
 * Create node from memory
 */
function createNode(memory: Memory): MemoryNode {
  return {
    id: memory.id,
    title: memory.title,
    topic: memory.topic,
    timestamp: new Date(memory.timestamp),
    concepts: extractConcepts(memory.conversation),
    centrality: 0,
    importance: 0,
  }
}

/**
 * Find edges between two nodes
 */
function findEdges(node1: MemoryNode, node2: MemoryNode): MemoryEdge[] {
  const edges: MemoryEdge[] = []

  // Temporal edge
  const timeDiff = Math.abs(
    node1.timestamp.getTime() - node2.timestamp.getTime()
  )
  const oneDay = 24 * 60 * 60 * 1000

  if (timeDiff < oneDay * 7) {
    // Within a week
    const weight = 1 - timeDiff / (oneDay * 7)
    edges.push({
      source: node1.id,
      target: node2.id,
      weight: weight * 0.3,
      type: 'temporal',
      sharedConcepts: [],
    })
  }

  // Conceptual edge
  const sharedConcepts = node1.concepts.filter(c =>
    node2.concepts.includes(c)
  )

  if (sharedConcepts.length > 0) {
    const weight =
      sharedConcepts.length /
      Math.max(node1.concepts.length, node2.concepts.length)

    edges.push({
      source: node1.id,
      target: node2.id,
      weight: weight * 0.7,
      type: 'conceptual',
      sharedConcepts,
    })
  }

  // Similar topics
  if (node1.topic === node2.topic && sharedConcepts.length > 0) {
    edges.push({
      source: node1.id,
      target: node2.id,
      weight: 0.5,
      type: 'similar',
      sharedConcepts: [],
    })
  }

  return edges
}

/**
 * Calculate centrality for each node (PageRank-like)
 */
function calculateCentrality(graph: SemanticGraph) {
  const damping = 0.85
  const iterations = 10

  // Initialize
  graph.nodes.forEach(node => {
    node.centrality = 1.0
  })

  // Iterate
  for (let iter = 0; iter < iterations; iter++) {
    const newScores = new Map<string, number>()

    graph.nodes.forEach((node, id) => {
      let score = (1 - damping) / graph.nodes.size

      // Incoming edges
      const incomingEdges = graph.edges.filter(e => e.target === id)
      incomingEdges.forEach(edge => {
        const sourceNode = graph.nodes.get(edge.source)
        if (sourceNode) {
          const outDegree = graph.edges.filter(
            e => e.source === edge.source
          ).length
          score += (damping * sourceNode.centrality * edge.weight) / outDegree
        }
      })

      newScores.set(id, score)
    })

    // Update scores
    newScores.forEach((score, id) => {
      const node = graph.nodes.get(id)
      if (node) node.centrality = score
    })
  }
}

/**
 * Calculate importance based on multiple factors
 */
function calculateImportance(graph: SemanticGraph) {
  graph.nodes.forEach(node => {
    let importance = 0

    // Centrality contributes
    importance += node.centrality * 0.4

    // Number of concepts
    importance += (node.concepts.length / 20) * 0.2

    // Recency (newer = more important)
    const age = Date.now() - node.timestamp.getTime()
    const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year
    importance += (1 - Math.min(age / maxAge, 1)) * 0.2

    // Degree (number of connections)
    const degree = graph.edges.filter(
      e => e.source === node.id || e.target === node.id
    ).length
    importance += Math.min(degree / 10, 1) * 0.2

    node.importance = Math.min(importance, 1)
  })
}

/**
 * Detect clusters using simple community detection
 */
function detectClusters(graph: SemanticGraph) {
  const visited = new Set<string>()
  let clusterId = 0

  graph.nodes.forEach((node, id) => {
    if (!visited.has(id)) {
      const cluster: string[] = []
      const queue = [id]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue

        visited.add(current)
        cluster.push(current)

        const connectedNodes = graph.edges
          .filter(
            e =>
              (e.source === current || e.target === current) && e.weight > 0.5
          )
          .map(e => (e.source === current ? e.target : e.source))

        queue.push(...connectedNodes.filter(n => !visited.has(n)))
      }

      if (cluster.length > 1) {
        graph.clusters.set(clusterId, cluster)
        cluster.forEach(nodeId => {
          const node = graph.nodes.get(nodeId)
          if (node) node.cluster = clusterId
        })
        clusterId++
      }
    }
  })
}

/**
 * Get graph metrics
 */
export function getGraphMetrics(graph: SemanticGraph): GraphMetrics {
  const totalNodes = graph.nodes.size
  const totalEdges = graph.edges.length
  const maxEdges = (totalNodes * (totalNodes - 1)) / 2
  const density = totalEdges / maxEdges

  const degrees: number[] = []
  graph.nodes.forEach((_, id) => {
    const degree = graph.edges.filter(
      e => e.source === id || e.target === id
    ).length
    degrees.push(degree)
  })

  const avgDegree =
    degrees.reduce((sum, d) => sum + d, 0) / degrees.length || 0

  const sortedByCentrality = Array.from(graph.nodes.values())
    .sort((a, b) => b.centrality - a.centrality)
    .slice(0, 5)
    .map(n => n.id)

  const sortedByImportance = Array.from(graph.nodes.values())
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map(n => n.id)

  return {
    totalNodes,
    totalEdges,
    density,
    avgDegree,
    clusters: graph.clusters.size,
    mostCentral: sortedByCentrality,
    mostImportant: sortedByImportance,
  }
}

/**
 * Find related memories
 */
export function findRelatedMemories(
  graph: SemanticGraph,
  memoryId: string,
  limit: number = 5
): string[] {
  const edges = graph.edges
    .filter(e => e.source === memoryId || e.target === memoryId)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)

  return edges.map(e => (e.source === memoryId ? e.target : e.source))
}

/**
 * Get cluster summary
 */
export function getClusterSummary(
  graph: SemanticGraph,
  clusterId: number
): {
  size: number
  mainTopic: string
  concepts: string[]
  timespan: { start: Date; end: Date }
} {
  const cluster = graph.clusters.get(clusterId) || []
  const nodes = cluster.map(id => graph.nodes.get(id)!).filter(Boolean)

  const topics: Record<string, number> = {}
  const allConcepts = new Set<string>()
  let minTime = Infinity
  let maxTime = 0

  nodes.forEach(node => {
    topics[node.topic] = (topics[node.topic] || 0) + 1
    node.concepts.forEach(c => allConcepts.add(c))

    const time = node.timestamp.getTime()
    if (time < minTime) minTime = time
    if (time > maxTime) maxTime = time
  })

  const mainTopic = Object.entries(topics).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

  return {
    size: cluster.length,
    mainTopic,
    concepts: Array.from(allConcepts).slice(0, 10),
    timespan: {
      start: new Date(minTime),
      end: new Date(maxTime),
    },
  }
}

/**
 * Export graph for visualization
 */
export function exportGraphForVisualization(graph: SemanticGraph) {
  return {
    nodes: Array.from(graph.nodes.values()).map(node => ({
      id: node.id,
      label: node.title,
      size: node.importance * 10,
      color: getColorForTopic(node.topic),
      cluster: node.cluster,
      centrality: node.centrality,
    })),
    edges: graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      type: edge.type,
    })),
  }
}

function getColorForTopic(topic: string): string {
  const colors: Record<string, string> = {
    coding: '#10a37f',
    writing: '#ff6b9d',
    learning: '#00a8e8',
    brainstorm: '#9900ff',
    planning: '#ffd700',
    research: '#00ffff',
    conversation: '#ff00aa',
  }
  return colors[topic] || '#808080'
}

function extractConcepts(text: string): string[] {
  const concepts = new Set<string>()

  // PascalCase terms
  const pascalCase = text.match(/\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g) || []
  pascalCase.forEach(t => concepts.add(t))

  // ACRONYMS
  const acronyms = text.match(/\b[A-Z]{2,}\b/g) || []
  acronyms.forEach(t => {
    if (t.length > 2 && t.length < 10) concepts.add(t)
  })

  // Technical terms in backticks
  const backticks = text.match(/`([^`]+)`/g) || []
  backticks.forEach(t => {
    const cleaned = t.replace(/`/g, '')
    if (cleaned.length > 2 && cleaned.length < 30) {
      concepts.add(cleaned)
    }
  })

  // Common technical patterns
  const patterns = [
    /\b(function|class|interface|type|const|let|var)\s+(\w+)/g,
    /\bimport\s+.*from\s+['"](.+)['"]/g,
  ]

  patterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern))
    matches.forEach(match => {
      if (match[2] || match[1]) {
        concepts.add(match[2] || match[1])
      }
    })
  })

  return Array.from(concepts).slice(0, 20)
}
