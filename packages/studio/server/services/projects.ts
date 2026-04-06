import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/index.js'
import { projects } from '../db/schema.js'

export interface Project {
  id: string
  name: string
  path: string
  createdAt: string
  lastOpenedAt: string
}

export class ProjectManager {
  private activeProjectId: string | null = null

  constructor() {
    getDatabase()
  }

  private get db() {
    return getDatabase()
  }

  list(): Project[] {
    return this.db.select().from(projects).all() as Project[]
  }

  get(id: string): Project | null {
    return this.db.select().from(projects).where(eq(projects.id, id)).get() as Project | null
  }

  getByPath(projectPath: string): Project | null {
    return this.db.select().from(projects).where(eq(projects.path, projectPath)).get() as Project | null
  }

  register(projectPath: string, name?: string): Project {
    const absPath = path.resolve(projectPath)

    // Check if already registered
    const existing = this.getByPath(absPath)
    if (existing) {
      this.setActive(existing.id)
      return existing
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const projectName = name || path.basename(absPath)

    this.db.insert(projects).values({
      id,
      name: projectName,
      path: absPath,
      createdAt: now,
      lastOpenedAt: now,
    }).run()

    this.activeProjectId = id
    return { id, name: projectName, path: absPath, createdAt: now, lastOpenedAt: now }
  }

  remove(id: string): boolean {
    const existing = this.get(id)
    if (!existing) return false
    this.db.delete(projects).where(eq(projects.id, id)).run()
    if (this.activeProjectId === id) {
      this.activeProjectId = null
    }
    return true
  }

  rename(id: string, name: string): Project | null {
    const existing = this.get(id)
    if (!existing) return null
    this.db.update(projects).set({ name }).where(eq(projects.id, id)).run()
    return { ...existing, name }
  }

  getActive(): Project | null {
    if (!this.activeProjectId) return null
    return this.get(this.activeProjectId)
  }

  getActiveId(): string | null {
    return this.activeProjectId
  }

  getActivePath(): string | null {
    const project = this.getActive()
    return project?.path || null
  }

  setActive(id: string): Project | null {
    const project = this.get(id)
    if (!project) return null

    this.activeProjectId = id
    this.db.update(projects)
      .set({ lastOpenedAt: new Date().toISOString() })
      .where(eq(projects.id, id))
      .run()

    return project
  }
}
