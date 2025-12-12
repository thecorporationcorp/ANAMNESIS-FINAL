import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { Memory, Platform } from '../../src/types'

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'anamnesis.db')
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      conversation TEXT NOT NULL,
      user_messages TEXT NOT NULL,
      assistant_messages TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      platform TEXT NOT NULL,
      topic TEXT,
      tags TEXT,
      word_count INTEGER,
      turn_count INTEGER,
      duration INTEGER,
      model TEXT,
      compressed INTEGER DEFAULT 0,
      compression_ratio REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp);
    CREATE INDEX IF NOT EXISTS idx_memories_platform ON memories(platform);
    CREATE INDEX IF NOT EXISTS idx_memories_topic ON memories(topic);

    CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
      id,
      title,
      conversation,
      tags,
      content='memories',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
      INSERT INTO memories_fts(rowid, id, title, conversation, tags)
      VALUES (new.rowid, new.id, new.title, new.conversation, new.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
      INSERT INTO memories_fts(memories_fts, rowid, id, title, conversation, tags)
      VALUES('delete', old.rowid, old.id, old.title, old.conversation, old.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
      INSERT INTO memories_fts(memories_fts, rowid, id, title, conversation, tags)
      VALUES('delete', old.rowid, old.id, old.title, old.conversation, old.tags);
      INSERT INTO memories_fts(rowid, id, title, conversation, tags)
      VALUES (new.rowid, new.id, new.title, new.conversation, new.tags);
    END;
  `)

  return db
}

export function getMemories(options?: {
  limit?: number
  offset?: number
  platform?: Platform
  topic?: string
}): Memory[] {
  const database = initDatabase()

  let query = 'SELECT * FROM memories WHERE 1=1'
  const params: any[] = []

  if (options?.platform) {
    query += ' AND platform = ?'
    params.push(options.platform)
  }

  if (options?.topic) {
    query += ' AND topic = ?'
    params.push(options.topic)
  }

  query += ' ORDER BY timestamp DESC'

  if (options?.limit) {
    query += ' LIMIT ?'
    params.push(options.limit)
  }

  if (options?.offset) {
    query += ' OFFSET ?'
    params.push(options.offset)
  }

  const rows = database.prepare(query).all(...params) as any[]
  return rows.map(rowToMemory)
}

export function searchMemories(query: string): Memory[] {
  const database = initDatabase()

  const searchQuery = `
    SELECT m.* FROM memories m
    JOIN memories_fts fts ON m.id = fts.id
    WHERE memories_fts MATCH ?
    ORDER BY rank
    LIMIT 100
  `

  const rows = database.prepare(searchQuery).all(query) as any[]
  return rows.map(rowToMemory)
}

export function getMemory(id: string): Memory | null {
  const database = initDatabase()

  const row = database.prepare('SELECT * FROM memories WHERE id = ?').get(id) as any
  return row ? rowToMemory(row) : null
}

export function insertMemory(memory: Memory): void {
  const database = initDatabase()

  const stmt = database.prepare(`
    INSERT INTO memories (
      id, title, conversation, user_messages, assistant_messages,
      timestamp, platform, topic, tags, word_count, turn_count,
      duration, model, compressed, compression_ratio
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)

  stmt.run(
    memory.id,
    memory.title,
    memory.conversation,
    JSON.stringify(memory.userMessages),
    JSON.stringify(memory.assistantMessages),
    memory.timestamp.toISOString(),
    memory.platform,
    memory.topic,
    JSON.stringify(memory.tags),
    memory.metadata?.wordCount || 0,
    memory.metadata?.turnCount || 0,
    memory.metadata?.duration || null,
    memory.metadata?.model || null,
    memory.metadata?.compressed ? 1 : 0,
    memory.metadata?.compressionRatio || null
  )
}

export function insertManyMemories(memories: Memory[]): void {
  const database = initDatabase()

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO memories (
      id, title, conversation, user_messages, assistant_messages,
      timestamp, platform, topic, tags, word_count, turn_count,
      duration, model, compressed, compression_ratio
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)

  const insertMany = database.transaction((items: Memory[]) => {
    for (const memory of items) {
      stmt.run(
        memory.id,
        memory.title,
        memory.conversation,
        JSON.stringify(memory.userMessages),
        JSON.stringify(memory.assistantMessages),
        memory.timestamp.toISOString(),
        memory.platform,
        memory.topic,
        JSON.stringify(memory.tags),
        memory.metadata?.wordCount || 0,
        memory.metadata?.turnCount || 0,
        memory.metadata?.duration || null,
        memory.metadata?.model || null,
        memory.metadata?.compressed ? 1 : 0,
        memory.metadata?.compressionRatio || null
      )
    }
  })

  insertMany(memories)
}

export function deleteMemory(id: string): void {
  const database = initDatabase()
  database.prepare('DELETE FROM memories WHERE id = ?').run(id)
}

export function getStats(): {
  totalMemories: number
  totalWords: number
  platforms: Record<string, number>
  topTopics: { topic: string; count: number }[]
} {
  const database = initDatabase()

  const totalMemories = (
    database.prepare('SELECT COUNT(*) as count FROM memories').get() as any
  ).count

  const totalWords = (
    database.prepare('SELECT SUM(word_count) as total FROM memories').get() as any
  ).total || 0

  const platformRows = database
    .prepare('SELECT platform, COUNT(*) as count FROM memories GROUP BY platform')
    .all() as any[]

  const platforms: Record<string, number> = {}
  platformRows.forEach((row) => {
    platforms[row.platform] = row.count
  })

  const topTopics = database
    .prepare(
      'SELECT topic, COUNT(*) as count FROM memories WHERE topic IS NOT NULL GROUP BY topic ORDER BY count DESC LIMIT 10'
    )
    .all() as { topic: string; count: number }[]

  return { totalMemories, totalWords, platforms, topTopics }
}

function rowToMemory(row: any): Memory {
  return {
    id: row.id,
    title: row.title,
    conversation: row.conversation,
    userMessages: JSON.parse(row.user_messages),
    assistantMessages: JSON.parse(row.assistant_messages),
    timestamp: new Date(row.timestamp),
    platform: row.platform as Platform,
    topic: row.topic,
    tags: JSON.parse(row.tags || '[]'),
    metadata: {
      wordCount: row.word_count,
      turnCount: row.turn_count,
      duration: row.duration,
      model: row.model,
      compressed: !!row.compressed,
      compressionRatio: row.compression_ratio,
    },
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
