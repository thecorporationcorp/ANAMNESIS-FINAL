/**
 * Lightweight Vector Embeddings System
 *
 * Generates semantic embeddings for text using a simple but effective
 * TF-IDF + dimensionality reduction approach.
 *
 * For production, this could be replaced with:
 * - OpenAI embeddings API
 * - HuggingFace transformers.js
 * - Local sentence-transformers model
 */

export interface EmbeddingVector {
  vector: number[]
  dimensions: number
  text: string
}

export interface SimilarityResult {
  id: string
  similarity: number
}

/**
 * Vocabulary and IDF scores
 */
let vocabulary: Map<string, number> = new Map()
let idfScores: Map<string, number> = new Map()
let documentCount: number = 0

/**
 * Initialize vocabulary from corpus
 */
export function initializeEmbeddings(documents: string[]) {
  vocabulary.clear()
  idfScores.clear()
  documentCount = documents.length

  // Build vocabulary
  const termDocumentFreq: Map<string, number> = new Map()

  documents.forEach(doc => {
    const terms = tokenize(doc)
    const uniqueTerms = new Set(terms)

    uniqueTerms.forEach(term => {
      termDocumentFreq.set(term, (termDocumentFreq.get(term) || 0) + 1)

      if (!vocabulary.has(term)) {
        vocabulary.set(term, vocabulary.size)
      }
    })
  })

  // Calculate IDF scores
  termDocumentFreq.forEach((docFreq, term) => {
    const idf = Math.log((documentCount + 1) / (docFreq + 1))
    idfScores.set(term, idf)
  })
}

/**
 * Generate embedding vector for text
 */
export function embed(text: string, dimensions: number = 128): EmbeddingVector {
  const terms = tokenize(text)
  const termFreq: Map<string, number> = new Map()

  // Calculate term frequency
  terms.forEach(term => {
    termFreq.set(term, (termFreq.get(term) || 0) + 1)
  })

  // Create TF-IDF vector
  const tfidf: number[] = Array(vocabulary.size).fill(0)

  termFreq.forEach((freq, term) => {
    const idx = vocabulary.get(term)
    if (idx !== undefined) {
      const tf = freq / terms.length
      const idf = idfScores.get(term) || 0
      tfidf[idx] = tf * idf
    }
  })

  // Reduce dimensionality via random projection
  const reduced = randomProjection(tfidf, dimensions)

  // Normalize
  const normalized = normalize(reduced)

  return {
    vector: normalized,
    dimensions: normalized.length,
    text,
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    throw new Error('Vectors must have same dimensions')
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i]
    norm1 += v1[i] * v1[i]
    norm2 += v2[i] * v2[i]
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

/**
 * Find most similar vectors
 */
export function findSimilar(
  query: number[],
  candidates: Map<string, number[]>,
  topK: number = 5
): SimilarityResult[] {
  const results: SimilarityResult[] = []

  candidates.forEach((vector, id) => {
    const similarity = cosineSimilarity(query, vector)
    results.push({ id, similarity })
  })

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

/**
 * Cluster vectors using K-means
 */
export function clusterVectors(
  vectors: Map<string, number[]>,
  k: number = 5,
  maxIterations: number = 100
): Map<number, string[]> {
  const vectorArray = Array.from(vectors.entries())
  const dimensions = vectorArray[0]?.[1].length || 0

  if (vectorArray.length < k) {
    k = Math.max(1, vectorArray.length)
  }

  // Initialize centroids randomly
  const centroids: number[][] = []
  const used = new Set<number>()

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * vectorArray.length)
    if (!used.has(idx)) {
      centroids.push([...vectorArray[idx][1]])
      used.add(idx)
    }
  }

  let assignments: Map<string, number> = new Map()

  // Iterate
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign to nearest centroid
    const newAssignments: Map<string, number> = new Map()

    vectorArray.forEach(([id, vector]) => {
      let minDist = Infinity
      let cluster = 0

      centroids.forEach((centroid, c) => {
        const dist = euclideanDistance(vector, centroid)
        if (dist < minDist) {
          minDist = dist
          cluster = c
        }
      })

      newAssignments.set(id, cluster)
    })

    // Check convergence
    if (mapsEqual(assignments, newAssignments)) {
      break
    }

    assignments = newAssignments

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterVectors = vectorArray
        .filter(([id]) => assignments.get(id) === c)
        .map(([, vector]) => vector)

      if (clusterVectors.length > 0) {
        centroids[c] = meanVector(clusterVectors)
      }
    }
  }

  // Build result
  const clusters: Map<number, string[]> = new Map()

  assignments.forEach((cluster, id) => {
    if (!clusters.has(cluster)) {
      clusters.set(cluster, [])
    }
    clusters.get(cluster)!.push(id)
  })

  return clusters
}

// Helper functions

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && w.length < 20)
    .filter(w => !isStopWord(w))
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
  ])
  return stopWords.has(word)
}

function randomProjection(vector: number[], targetDim: number): number[] {
  const sourceDim = vector.length
  const projected: number[] = Array(targetDim).fill(0)

  // Simple random projection matrix
  for (let i = 0; i < targetDim; i++) {
    for (let j = 0; j < sourceDim; j++) {
      // Random value from {-1, 0, 1} with specific probabilities
      const rand = Math.random()
      const projValue = rand < 1 / 6 ? -1 : rand < 2 / 6 ? 1 : 0
      projected[i] += vector[j] * projValue / Math.sqrt(targetDim)
    }
  }

  return projected
}

function normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  return norm > 0 ? vector.map(v => v / norm) : vector
}

function euclideanDistance(v1: number[], v2: number[]): number {
  let sum = 0
  for (let i = 0; i < v1.length; i++) {
    sum += (v1[i] - v2[i]) ** 2
  }
  return Math.sqrt(sum)
}

function meanVector(vectors: number[][]): number[] {
  if (vectors.length === 0) return []

  const dimensions = vectors[0].length
  const mean: number[] = Array(dimensions).fill(0)

  vectors.forEach(vector => {
    for (let i = 0; i < dimensions; i++) {
      mean[i] += vector[i]
    }
  })

  return mean.map(v => v / vectors.length)
}

function mapsEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
  if (map1.size !== map2.size) return false

  for (const [key, value] of map1) {
    if (map2.get(key) !== value) return false
  }

  return true
}

/**
 * Batch embed multiple texts
 */
export function batchEmbed(
  texts: string[],
  dimensions: number = 128
): Map<string, number[]> {
  // Initialize if needed
  if (vocabulary.size === 0) {
    initializeEmbeddings(texts)
  }

  const embeddings = new Map<string, number[]>()

  texts.forEach((text, i) => {
    const embedding = embed(text, dimensions)
    embeddings.set(i.toString(), embedding.vector)
  })

  return embeddings
}
