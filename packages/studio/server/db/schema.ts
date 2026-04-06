import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

/**
 * Projects — registered project directories.
 */
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  path: text('path').notNull().unique(),
  createdAt: text('created_at').notNull(),
  lastOpenedAt: text('last_opened_at').notNull(),
})

/**
 * Sessions — a conversation thread, scoped to a project.
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
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
  input: text('input').notNull(),
  output: text('output'),
})

/**
 * Settings — key-value store, scoped to a project.
 */
export const settings = sqliteTable('settings', {
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
})
