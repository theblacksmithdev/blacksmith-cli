import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

let _db: ReturnType<typeof drizzle> | null = null
let _sqlite: Database.Database | null = null

/**
 * Get the global Studio database directory.
 */
function getStudioDir(): string {
  return path.join(os.homedir(), '.blacksmith-studio')
}

/**
 * Initialize the global SQLite database.
 * Stored at ~/.blacksmith-studio/studio.db
 */
export function getDatabase() {
  if (_db) return _db

  const studioDir = getStudioDir()
  fs.mkdirSync(studioDir, { recursive: true })

  const dbPath = path.join(studioDir, 'studio.db')
  _sqlite = new Database(dbPath)

  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')

  _sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_opened_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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

    CREATE TABLE IF NOT EXISTS settings (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      PRIMARY KEY (project_id, key)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_tool_calls_message_id ON tool_calls(message_id);
    CREATE INDEX IF NOT EXISTS idx_settings_project_id ON settings(project_id);
  `)

  _db = drizzle(_sqlite, { schema })

  console.log(`[db] Global database ready at ${dbPath}`)
  return _db
}

export function closeDatabase() {
  if (_sqlite) {
    _sqlite.close()
    _sqlite = null
    _db = null
  }
}
