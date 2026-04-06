import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

let _db: ReturnType<typeof drizzle> | null = null
let _sqlite: Database.Database | null = null

/**
 * Initialize the SQLite database connection.
 * Creates the `.blacksmith-studio/` directory and `studio.db` file if needed.
 * Runs migrations inline (push schema) on first connect.
 */
export function getDatabase(projectRoot: string) {
  if (_db) return _db

  const studioDir = path.join(projectRoot, '.blacksmith-studio')
  fs.mkdirSync(studioDir, { recursive: true })

  const dbPath = path.join(studioDir, 'studio.db')
  _sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrent read/write performance
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')

  // Create tables if they don't exist
  _sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tool_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      tool_id TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_tool_calls_message_id ON tool_calls(message_id);
  `)

  _db = drizzle(_sqlite, { schema })

  console.log(`[db] SQLite database ready at ${dbPath}`)
  return _db
}

/**
 * Close the database connection gracefully.
 */
export function closeDatabase() {
  if (_sqlite) {
    _sqlite.close()
    _sqlite = null
    _db = null
  }
}
