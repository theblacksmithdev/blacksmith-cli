import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/index.js'
import { settings } from '../db/schema.js'

const DEFAULTS: Record<string, any> = {
  // Appearance
  'appearance.theme': 'system',
  'appearance.fontSize': 14,
  'appearance.sidebarCollapsed': false,

  // AI & Prompting
  'ai.model': 'sonnet',
  'ai.maxBudget': null,
  'ai.customInstructions': '',
  'ai.permissionMode': 'bypassPermissions',

  // Editor
  'editor.tabSize': 2,
  'editor.wordWrap': true,
  'editor.minimap': true,
  'editor.lineNumbers': true,

  // Project
  'project.displayName': '',
  'project.ignoredPatterns': 'node_modules,.git,__pycache__,venv,dist,.env,.blacksmith-studio',
}

export class SettingsManager {
  private projectRoot: string

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
    getDatabase(projectRoot)
  }

  private get db() {
    return getDatabase(this.projectRoot)
  }

  getAll(): Record<string, any> {
    const rows = this.db.select().from(settings).all()
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

  get(key: string): any {
    const row = this.db.select().from(settings).where(eq(settings.key, key)).get()
    if (!row) return DEFAULTS[key] ?? null
    try {
      return JSON.parse(row.value)
    } catch {
      return row.value
    }
  }

  set(key: string, value: any): void {
    const serialized = JSON.stringify(value)
    const existing = this.db.select().from(settings).where(eq(settings.key, key)).get()
    if (existing) {
      this.db.update(settings).set({ value: serialized }).where(eq(settings.key, key)).run()
    } else {
      this.db.insert(settings).values({ key, value: serialized }).run()
    }
  }

  setMany(pairs: Record<string, any>): void {
    for (const [key, value] of Object.entries(pairs)) {
      this.set(key, value)
    }
  }

  getDefaults(): Record<string, any> {
    return { ...DEFAULTS }
  }
}
