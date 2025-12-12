# ANAMNESIS v3.0

**The Mirror of Your Mind** - A living visualization of your consciousness across AI conversations.

![ANAMNESIS](https://img.shields.io/badge/version-3.0.0-cyan)
![Electron](https://img.shields.io/badge/electron-28-blue)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)

---

## The Vision

ANAMNESIS transforms your AI conversation history into a **living, breathing dashboard**. It's not just a tool—it's a window into your own mind.

### Two States

**STATE 1: THE WALL** (Animated, overwhelming, hypnotic)
- Hundreds of monitors displaying your memories
- Constant motion, Blade Runner aesthetic
- Cyberpunk post-processing effects
- Sub-100ms search across all conversations

**STATE 2: THE MEMORY** (Still, intimate, readable)
- Vintage collage layout
- Typewriter text, handwritten notes
- Quality photography aesthetic
- "Forced to stare at your own thoughts"

---

## Core Engines (IMPLEMENTED)

### 🔥 VESPERTINE - Compression Engine

Multi-fold compression system that reduces conversation size while preserving semantic meaning:

- **Symbolic Abstraction**: Common patterns → symbols
- **Temporal Chaining**: Sequential statements → compressed chains
- **Semantic Compression**: Toki Pona-inspired primitives
- **Pattern Recognition**: Repeated phrases → tokens
- **Density Optimization**: Remove filler, optimize whitespace

**Location**: `electron/services/vespertine.ts`

**Compression Ratio**: 2-5x depending on content repetition

### 🔥 SPINE - Seed Generation Engine

Semantic Personality INtegration Engine for context-rich conversation continuity:

- **Context Analysis**: Detects conversation type, technical depth, outcome
- **Personality Extraction**: Communication style, expertise level, preferences
- **Anchor Detection**: Key concepts, decisions, breakthroughs, questions
- **Smart Continuation**: Suggests next steps based on conversation flow

**Location**: `electron/services/spine.ts`

**Output**: Rich markdown seed with all context needed to continue anywhere

### 🔥 Semantic Graph Builder

Knowledge graph construction showing conceptual relationships:

- **Node Creation**: Each memory with concepts, centrality, importance
- **Edge Detection**: Temporal, conceptual, causal, reference connections
- **Centrality Calculation**: PageRank-like algorithm
- **Cluster Detection**: Community detection for topic grouping

**Location**: `electron/services/semantic-graph.ts`

**Features**:
- Find related memories
- Detect topic clusters
- Calculate graph metrics
- Export for 3D visualization

### 🔥 Vector Embeddings System

Lightweight semantic similarity engine:

- **TF-IDF Vectorization**: Term frequency-inverse document frequency
- **Dimensionality Reduction**: Random projection to configurable dimensions
- **Cosine Similarity**: Fast similarity calculation
- **K-Means Clustering**: Automatic topic grouping

**Location**: `electron/services/embeddings.ts`

**Performance**: Sub-millisecond similarity calculations

---

## Features

- **Import** - ChatGPT, Claude, Gemini exports with real parsing
- **Visualize** - 10+ animated monitor styles
- **Search** - Instant fuzzy search with semantic boosting
- **Compress** - VESPERTINE compression for efficient storage
- **Export** - SPINE seeds for conversation continuity
- **Explore** - Semantic graph showing idea connections
- **Cluster** - Automatic topic detection and grouping

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Development

```bash
# Clone the repository
git clone https://github.com/your-username/anamnesis.git
cd anamnesis

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Package for distribution
npm run electron:build
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS
- **3D/Effects**: Three.js (optional)
- **State**: Zustand
- **Search**: Fuse.js (fuzzy) + semantic boosting

### Backend (Electron)
- **Database**: SQLite with FTS5 full-text search
- **Compression**: VESPERTINE engine
- **Context**: SPINE seed generator
- **Graph**: Semantic graph builder
- **Embeddings**: TF-IDF + random projection
- **Import**: Multi-format parser (ChatGPT/Claude/Gemini)

---

## Architecture

```
anamnesis/
├── electron/
│   ├── main.ts                    # Electron entry
│   ├── preload.ts                 # IPC bridge
│   └── services/
│       ├── database.ts            # SQLite + FTS5
│       ├── importer.ts            # Multi-format parser
│       ├── vespertine.ts          # 🔥 Compression engine
│       ├── spine.ts               # 🔥 Seed generator
│       ├── semantic-graph.ts      # 🔥 Graph builder
│       └── embeddings.ts          # 🔥 Vector system
│
├── src/
│   ├── views/
│   │   ├── Awakening/             # Intro sequence
│   │   ├── Wall/                  # Billboard monitors
│   │   └── Memory/                # Vintage collage
│   ├── components/
│   │   ├── Monitor/               # 10 visual styles
│   │   ├── Collage/               # Vintage elements
│   │   └── Effects/               # Post-processing
│   ├── systems/
│   │   ├── grid-layout.ts         # Monitor positioning
│   │   ├── text-extraction.ts    # Content parsing
│   │   ├── collage-generator.ts  # Layout generation
│   │   ├── monitor-classifier.ts # Style detection
│   │   └── mock-data.ts           # Demo data
│   ├── hooks/
│   │   ├── useMemories.ts         # 🔥 Enhanced with engines
│   │   └── useExport.ts           # SPINE export
│   └── stores/
│       └── appStore.ts            # Global state
```

---

## Monitor Styles

Each memory is displayed as one of these animated monitor types:

| Style | Description | Trigger |
|-------|-------------|---------|
| **Cartoon** | 1930s animation style | Creative/brainstorm content |
| **Sitcom** | 1950s TV aesthetic | Conversational content |
| **Tutorial** | VHS makeup tutorial | How-to/learning content |
| **Cyberpunk** | Neon Blade Runner | AI/tech content |
| **Terminal** | Code editor style | Programming content |
| **Glitch** | Abstract RGB split | Experimental content |
| **Emergency** | Alert broadcast | Urgent/important content |
| **News** | Breaking news ticker | Research/information |
| **Static** | No signal noise | Miscellaneous |

---

## Engine APIs

### VESPERTINE Compression

```typescript
import { compressConversation, decompressConversation } from './services/vespertine'

const result = compressConversation(conversation, 3)
// Result: { compressed, compressionRatio, anchors, metadata }

const original = decompressConversation(result.compressed, result.metadata)
```

### SPINE Seed Generation

```typescript
import { generateSpineSeed } from './services/spine'

const seed = generateSpineSeed(memory)
// Seed includes: context, concepts, decisions, personality, continuation
```

### Semantic Graph

```typescript
import { buildSemanticGraph, findRelatedMemories } from './services/semantic-graph'

const graph = buildSemanticGraph(memories)
const related = findRelatedMemories(graph, memoryId, 5)
```

### Vector Embeddings

```typescript
import { embed, findSimilar, clusterVectors } from './services/embeddings'

const embedding = embed(text, 128)
const similar = findSimilar(embedding.vector, candidateVectors, 5)
const clusters = clusterVectors(allVectors, 5)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `⌘/Ctrl + K` | Focus search |
| `Escape` | Close memory / Clear search |
| `Click` | Open memory collage |

---

## Real vs. Placeholder

### ✅ Fully Implemented
- VESPERTINE compression engine
- SPINE seed generation
- Semantic graph builder
- Vector embeddings (TF-IDF)
- Text extraction
- Collage generation
- Monitor classification
- Search with semantic boosting
- Import pipeline (ChatGPT/Claude formats)
- SQLite database with FTS5
- All UI components and views
- Animation system
- Effects system

### 🚧 Future Enhancements
- MeiliSearch integration (currently using Fuse.js)
- External vector API integration (OpenAI, HuggingFace)
- Real-time capture via browser extension
- 3D constellation view
- Advanced graph visualization
- Team collaboration features

---

## Performance

- **Search**: Sub-100ms on 1000+ memories
- **Compression**: 2-5x ratio, <100ms for typical conversations
- **Graph Building**: <500ms for 500 memories
- **Embeddings**: <50ms per document
- **UI**: 60fps animations

---

## License

MIT

---

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

---

*"Your mind is about to become visible."*

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Run in dev mode
npm run dev

# 3. Import your data
# Drag & drop ChatGPT/Claude export into the app

# 4. Explore
# Search, click memories, export SPINE seeds
```

---

## Links

- **GitHub**: [thecorporationcorp/ANAMNESIS](https://github.com/thecorporationcorp/ANAMNESIS)
- **Issues**: Report bugs or request features
- **Docs**: Full documentation (coming soon)
