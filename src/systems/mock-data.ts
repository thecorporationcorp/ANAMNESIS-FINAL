import { Memory, Platform } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { classifyTopic, extractTags } from './text-extraction'

const SAMPLE_CONVERSATIONS = [
  {
    title: 'Building a React Component Library',
    userMessages: [
      'How do I create a reusable button component in React with TypeScript?',
      'Can you add hover and focus states?',
      'How should I handle the different variants like primary, secondary?',
    ],
    assistantMessages: [
      'Here is a well-structured button component using TypeScript interfaces for props...',
      'For hover and focus states, you can use Tailwind CSS or styled-components...',
      'Use a variant prop with a union type to handle different button styles...',
    ],
    tags: ['react', 'typescript', 'components', 'ui'],
    topic: 'coding',
  },
  {
    title: 'Understanding Neural Networks',
    userMessages: [
      'What is a neural network and how does it learn?',
      'Can you explain backpropagation in simple terms?',
      'How do I choose the right architecture for my problem?',
    ],
    assistantMessages: [
      'A neural network is a computational model inspired by biological neurons...',
      'Backpropagation is like adjusting blame backwards through the network...',
      'The architecture depends on your data type and task complexity...',
    ],
    tags: ['ai', 'machine-learning', 'neural-networks', 'deep-learning'],
    topic: 'learning',
  },
  {
    title: 'Brainstorming App Ideas',
    userMessages: [
      'I want to build an app that helps people remember things. Any ideas?',
      'What if it visualized their memories somehow?',
      'This is amazing! I finally figured out what I want to build.',
    ],
    assistantMessages: [
      'Consider a memory palace approach with spatial visualization...',
      'You could represent memories as a constellation of interconnected thoughts...',
      'That sounds like a powerful concept for personal knowledge management...',
    ],
    tags: ['ideas', 'app-development', 'creativity', 'brainstorming'],
    topic: 'brainstorm',
  },
  {
    title: 'Debugging API Authentication',
    userMessages: [
      'My API keeps returning 401 errors even with the correct token',
      'The token is valid, I checked in jwt.io',
      'Got it! The issue was the Authorization header format.',
    ],
    assistantMessages: [
      'Check if the Authorization header includes the Bearer prefix...',
      'Also verify the token is not expired and matches the expected audience...',
      'Great debugging! Header format issues are a common pitfall...',
    ],
    tags: ['api', 'authentication', 'debugging', 'jwt'],
    topic: 'coding',
  },
  {
    title: 'Writing a Short Story',
    userMessages: [
      'Help me write a short story about a robot learning to feel emotions',
      'Can you make the ending more bittersweet?',
      'Perfect. This really captures what I was going for.',
    ],
    assistantMessages: [
      'In the year 2157, Unit-7 was the first AI to ask why it existed...',
      'Here is the revised ending where Unit-7 chooses to forget...',
      'The theme of choosing memories resonates deeply with human experience...',
    ],
    tags: ['creative-writing', 'story', 'ai', 'emotions'],
    topic: 'writing',
  },
  {
    title: 'Database Query Optimization',
    userMessages: [
      'This SQL query is taking 30 seconds, how can I optimize it?',
      'Should I add an index on the joined columns?',
      'Wow, that brought it down to 200ms!',
    ],
    assistantMessages: [
      'The query is doing a full table scan. Consider adding indexes...',
      'Yes, composite indexes on the foreign key columns would help significantly...',
      'That is a 150x improvement! Index optimization is often the biggest win...',
    ],
    tags: ['sql', 'database', 'optimization', 'performance'],
    topic: 'coding',
  },
  {
    title: 'Planning a Product Launch',
    userMessages: [
      'I need to plan the launch of my new SaaS product',
      'What should I focus on in the first week?',
      'How do I handle early user feedback?',
    ],
    assistantMessages: [
      'Here is a comprehensive launch checklist covering marketing, technical, and support...',
      'Week one should focus on monitoring, quick bug fixes, and gathering testimonials...',
      'Create a feedback loop: categorize, prioritize, and communicate updates to users...',
    ],
    tags: ['product', 'launch', 'saas', 'planning'],
    topic: 'planning',
  },
  {
    title: 'Understanding Quantum Computing',
    userMessages: [
      'Can you explain quantum entanglement to me?',
      'How is this useful for computing?',
      'This is mind-bending but I think I understand now.',
    ],
    assistantMessages: [
      'Quantum entanglement is when particles become correlated in their quantum states...',
      'Entanglement enables quantum parallelism and quantum error correction...',
      'The key insight is that information can exist in superposition...',
    ],
    tags: ['quantum', 'physics', 'computing', 'science'],
    topic: 'learning',
  },
]

const PLATFORMS: Platform[] = ['chatgpt', 'claude', 'gemini', 'local']

export function generateMockMemories(count: number): Memory[] {
  const memories: Memory[] = []

  for (let i = 0; i < count; i++) {
    const sampleIndex = i % SAMPLE_CONVERSATIONS.length
    const sample = SAMPLE_CONVERSATIONS[sampleIndex]

    // Create varied timestamps over past year
    const daysAgo = Math.floor(Math.random() * 365)
    const timestamp = new Date()
    timestamp.setDate(timestamp.getDate() - daysAgo)

    // Build conversation string
    const conversation = sample.userMessages
      .map((user, idx) => {
        const assistant = sample.assistantMessages[idx] || ''
        return `USER: ${user}\n\nASSISTANT: ${assistant}`
      })
      .join('\n\n')

    const memory: Memory = {
      id: uuidv4(),
      title: `${sample.title}${i > SAMPLE_CONVERSATIONS.length ? ` (${Math.floor(i / SAMPLE_CONVERSATIONS.length)})` : ''}`,
      conversation,
      userMessages: sample.userMessages,
      assistantMessages: sample.assistantMessages,
      timestamp,
      platform: PLATFORMS[i % PLATFORMS.length],
      topic: sample.topic,
      tags: sample.tags,
      metadata: {
        wordCount: conversation.split(/\s+/).length,
        turnCount: sample.userMessages.length,
        duration: Math.floor(Math.random() * 3600) + 300,
        model: getRandomModel(PLATFORMS[i % PLATFORMS.length]),
        compressed: false,
      },
    }

    memories.push(memory)
  }

  // Sort by timestamp (most recent first)
  return memories.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

function getRandomModel(platform: Platform): string {
  const models = {
    chatgpt: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-2'],
    gemini: ['gemini-pro', 'gemini-ultra'],
    local: ['llama-2-70b', 'mistral-7b', 'codellama-34b'],
    other: ['unknown'],
  }
  const platformModels = models[platform]
  return platformModels[Math.floor(Math.random() * platformModels.length)]
}

export function generateRandomMemory(): Memory {
  const sample =
    SAMPLE_CONVERSATIONS[
      Math.floor(Math.random() * SAMPLE_CONVERSATIONS.length)
    ]

  const conversation = sample.userMessages
    .map((user, idx) => {
      const assistant = sample.assistantMessages[idx] || ''
      return `USER: ${user}\n\nASSISTANT: ${assistant}`
    })
    .join('\n\n')

  return {
    id: uuidv4(),
    title: sample.title,
    conversation,
    userMessages: sample.userMessages,
    assistantMessages: sample.assistantMessages,
    timestamp: new Date(),
    platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
    topic: sample.topic,
    tags: sample.tags,
    metadata: {
      wordCount: conversation.split(/\s+/).length,
      turnCount: sample.userMessages.length,
      compressed: false,
    },
  }
}
