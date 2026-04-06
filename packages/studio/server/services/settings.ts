import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../db/index.js'
import { settings } from '../db/schema.js'

const DEFAULTS: Record<string, any> = {
  'appearance.theme': 'system',
  'appearance.fontSize': 14,
  'appearance.sidebarCollapsed': false,
  'ai.model': 'sonnet',
  'ai.maxBudget': null,
  'ai.customInstructions': '',
  'ai.permissionMode': 'bypassPermissions',
  'editor.tabSize': 2,
  'editor.wordWrap': true,
  'editor.minimap': true,
  'editor.lineNumbers': true,
  'project.displayName': '',
  'project.ignoredPatterns': 'node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio',
}

export class SettingsManager {
  constructor() {
    getDatabase()
  }

  private get db() {
    return getDatabase()
  }

  getAll(projectId: string): Record<string, any> {
    const rows = this.db.select().from(settings)
      .where(eq(settings.projectId, projectId))
      .all()
    const result = { ...DEFAULTS }
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value)
      } catch {
        result[row.key] = row.value
      }
    }
    return result
  }

  get(projectId: string, key: string): any {
    const row = this.db.select().from(settings)
      .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
      .get()
    if (!row) return DEFAULTS[key] ?? null
    try {
      return JSON.parse(row.value)
    } catch {
      return row.value
    }
  }

  set(projectId: string, key: string, value: any): void {
    const serialized = JSON.stringify(value)
    const existing = this.db.select().from(settings)
      .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
      .get()
    if (existing) {
      this.db.update(settings).set({ value: serialized })
        .where(and(eq(settings.projectId, projectId), eq(settings.key, key)))
        .run()
    } else {
      this.db.insert(settings).values({ projectId, key, value: serialized }).run()
    }
  }

  setMany(projectId: string, pairs: Record<string, any>): void {
    for (const [key, value] of Object.entries(pairs)) {
      this.set(projectId, key, value)
    }
  }
}
