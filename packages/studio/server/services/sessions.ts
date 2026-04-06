import crypto from 'node:crypto'
import { eq, desc, and } from 'drizzle-orm'
import { getDatabase } from '../db/index.js'
import { sessions, messages, toolCalls } from '../db/schema.js'
import type { Session, SessionSummary, StoredMessage, ToolCall } from '../types.js'

export class SessionManager {
  constructor() {
    getDatabase()
  }

  private get db() {
    return getDatabase()
  }

  createSession(projectId: string, name?: string): Session {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const sessionName = name || `Session ${new Date().toLocaleDateString()}`

    this.db.insert(sessions).values({
      id,
      projectId,
      name: sessionName,
      createdAt: now,
      updatedAt: now,
    }).run()

    return { id, name: sessionName, createdAt: now, updatedAt: now, messages: [] }
  }

  getSession(id: string): Session | null {
    const row = this.db.select().from(sessions).where(eq(sessions.id, id)).get()
    if (!row) return null

    const msgs = this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, id))
      .orderBy(messages.timestamp)
      .all()

    const sessionMessages: StoredMessage[] = msgs.map((msg) => {
      const tcs = this.db
        .select()
        .from(toolCalls)
        .where(eq(toolCalls.messageId, msg.id))
        .all()

      const mappedToolCalls: ToolCall[] | undefined = tcs.length > 0
        ? tcs.map((tc) => ({
            toolId: tc.toolId,
            toolName: tc.toolName,
            input: JSON.parse(tc.input),
            output: tc.output ?? undefined,
          }))
        : undefined

      return {
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        toolCalls: mappedToolCalls,
        timestamp: msg.timestamp,
      }
    })

    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      messages: sessionMessages,
    }
  }

  listSessions(projectId: string): SessionSummary[] {
    const rows = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .orderBy(desc(sessions.updatedAt))
      .all()

    return rows.map((row) => {
      const msgCount = this.db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, row.id))
        .all()
        .length

      const lastUserMsg = this.db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, row.id))
        .orderBy(desc(messages.timestamp))
        .all()
        .find((m) => m.role === 'user')

      return {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        messageCount: msgCount,
        lastPrompt: lastUserMsg?.content,
      }
    })
  }

  addMessage(sessionId: string, message: StoredMessage): void {
    this.db.insert(messages).values({
      id: message.id,
      sessionId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }).run()

    if (message.toolCalls) {
      for (const tc of message.toolCalls) {
        this.db.insert(toolCalls).values({
          messageId: message.id,
          toolId: tc.toolId,
          toolName: tc.toolName,
          input: JSON.stringify(tc.input),
          output: tc.output ?? null,
        }).run()
      }
    }

    this.db.update(sessions)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, sessionId))
      .run()
  }

  renameSession(id: string, name: string): Session | null {
    const existing = this.db.select().from(sessions).where(eq(sessions.id, id)).get()
    if (!existing) return null
    this.db.update(sessions)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, id))
      .run()
    return this.getSession(id)
  }

  deleteSession(id: string): boolean {
    const existing = this.db.select().from(sessions).where(eq(sessions.id, id)).get()
    if (!existing) return false
    this.db.delete(sessions).where(eq(sessions.id, id)).run()
    return true
  }
}
