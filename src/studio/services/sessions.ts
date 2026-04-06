import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { Session, SessionSummary, StoredMessage } from '../types.js'

export class SessionManager {
  private sessionsDir: string

  constructor(projectRoot: string) {
    this.sessionsDir = path.join(projectRoot, '.blacksmith-studio', 'sessions')
    fs.mkdirSync(this.sessionsDir, { recursive: true })
  }

  createSession(name?: string): Session {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const session: Session = {
      id,
      name: name || `Session ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    this.saveSession(session)
    return session
  }

  getSession(id: string): Session | null {
    const filePath = path.join(this.sessionsDir, `${id}.json`)
    if (!fs.existsSync(filePath)) return null
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return null
    }
  }

  listSessions(): SessionSummary[] {
    let entries: string[]
    try {
      entries = fs.readdirSync(this.sessionsDir).filter((f) => f.endsWith('.json'))
    } catch {
      return []
    }

    const summaries: SessionSummary[] = []
    for (const entry of entries) {
      try {
        const data = JSON.parse(
          fs.readFileSync(path.join(this.sessionsDir, entry), 'utf-8'),
        ) as Session
        const userMessages = data.messages.filter((m) => m.role === 'user')
        summaries.push({
          id: data.id,
          name: data.name,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          messageCount: data.messages.length,
          lastPrompt: userMessages[userMessages.length - 1]?.content,
        })
      } catch {
        // Skip corrupted files
      }
    }

    return summaries.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  addMessage(sessionId: string, message: StoredMessage): void {
    const session = this.getSession(sessionId)
    if (!session) return
    session.messages.push(message)
    session.updatedAt = new Date().toISOString()
    this.saveSession(session)
  }

  renameSession(id: string, name: string): Session | null {
    const session = this.getSession(id)
    if (!session) return null
    session.name = name
    session.updatedAt = new Date().toISOString()
    this.saveSession(session)
    return session
  }

  deleteSession(id: string): boolean {
    const filePath = path.join(this.sessionsDir, `${id}.json`)
    if (!fs.existsSync(filePath)) return false
    fs.unlinkSync(filePath)
    return true
  }

  private saveSession(session: Session): void {
    const filePath = path.join(this.sessionsDir, `${session.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2) + '\n', 'utf-8')
  }
}
