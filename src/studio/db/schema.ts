import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/**
 * Sessions — a conversation thread.
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * Messages — individual messages within a session.
 */
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
})

/**
 * Tool calls — tool invocations within a message.
 */
export const toolCalls = sqliteTable('tool_calls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  toolId: text('tool_id').notNull(),
  toolName: text('tool_name').notNull(),
  input: text('input').notNull(), // JSON stringified
  output: text('output'),
})
