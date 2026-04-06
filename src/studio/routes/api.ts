import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { ProjectManager } from '../services/projects.js'
import type { SessionManager } from '../services/sessions.js'
import type { ClaudeManager } from '../services/claude/index.js'
import type { SettingsManager } from '../services/settings.js'
import type { RunnerManager } from '../services/runner/index.js'
import { buildFileTree, readFileContent } from '../services/files.js'
import { getTemplates, interpolateTemplate } from '../services/templates.js'

export function createApiRouter(
  projectManager: ProjectManager,
  sessionManager: SessionManager,
  claudeManager: ClaudeManager,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
): Router {
  const router = Router()

  // Helper: get active project or 400
  function requireActiveProject(res: any): string | null {
    const project = projectManager.getActive()
    if (!project) {
      res.status(400).json({ error: 'No active project. Select or create a project first.' })
      return null
    }
    return project.id
  }

  function requireActivePath(res: any): string | null {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) {
      res.status(400).json({ error: 'No active project.' })
      return null
    }
    return projectPath
  }

  // ─── Projects ───
  router.get('/api/projects', (_req, res) => {
    res.json(projectManager.list())
  })

  router.get('/api/projects/active', (_req, res) => {
    const project = projectManager.getActive()
    res.json(project || null)
  })

  // Browse directories for the folder picker
  router.get('/api/browse', (req, res) => {
    const requestedPath = (req.query.path as string) || os.homedir()
    const absPath = path.resolve(requestedPath)

    if (!fs.existsSync(absPath)) {
      return res.status(400).json({ error: 'Path does not exist' })
    }

    const stat = fs.statSync(absPath)
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' })
    }

    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(absPath, { withFileTypes: true })
    } catch {
      return res.status(403).json({ error: 'Cannot read directory' })
    }

    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => ({
        name: e.name,
        path: path.join(absPath, e.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const hasBlacksmithConfig = fs.existsSync(path.join(absPath, 'blacksmith.config.json'))
    const hasPackageJson = fs.existsSync(path.join(absPath, 'package.json'))
    const hasGit = fs.existsSync(path.join(absPath, '.git'))

    res.json({
      current: absPath,
      parent: path.dirname(absPath),
      dirs,
      isProject: hasBlacksmithConfig || hasPackageJson || hasGit,
      isBlacksmithProject: hasBlacksmithConfig,
    })
  })

  // Validate a path and read project info before registering
  router.post('/api/projects/validate', (req, res) => {
    const { path: projectPath } = req.body
    if (!projectPath) return res.status(400).json({ error: 'path is required' })

    const absPath = path.resolve(projectPath)

    if (!fs.existsSync(absPath)) {
      return res.status(400).json({ error: 'Directory does not exist', valid: false })
    }

    const stat = fs.statSync(absPath)
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory', valid: false })
    }

    const configPath = path.join(absPath, 'blacksmith.config.json')
    let configName: string | null = null
    let isBlacksmithProject = false

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        configName = config.name || null
        isBlacksmithProject = true
      } catch { /* ignore */ }
    }

    const hasPackageJson = fs.existsSync(path.join(absPath, 'package.json'))
    const hasGit = fs.existsSync(path.join(absPath, '.git'))

    res.json({
      valid: true,
      path: absPath,
      name: configName || path.basename(absPath),
      isBlacksmithProject,
      hasPackageJson,
      hasGit,
    })
  })

  router.post('/api/projects', (req, res) => {
    const { name, path: projectPath } = req.body
    if (!projectPath) return res.status(400).json({ error: 'path is required' })
    const project = projectManager.register(projectPath, name)
    res.status(201).json(project)
  })

  router.post('/api/projects/:id/activate', (req, res) => {
    const project = projectManager.setActive(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  })

  router.patch('/api/projects/:id', (req, res) => {
    const project = projectManager.rename(req.params.id, req.body?.name)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  })

  router.delete('/api/projects/:id', (req, res) => {
    const removed = projectManager.remove(req.params.id)
    if (!removed) return res.status(404).json({ error: 'Project not found' })
    res.status(204).send()
  })

  // ─── Health ───
  router.get('/api/health', async (_req, res) => {
    const claude = await claudeManager.checkInstalled()
    const project = projectManager.getActive()
    res.json({
      projectName: project?.name || null,
      projectPath: project?.path || null,
      claudeInstalled: claude.installed,
      claudeVersion: claude.version,
    })
  })

  // ─── Sessions (scoped to active project) ───
  router.get('/api/sessions', (_req, res) => {
    const projectId = requireActiveProject(res)
    if (!projectId) return
    res.json(sessionManager.listSessions(projectId))
  })

  router.post('/api/sessions', (req, res) => {
    const projectId = requireActiveProject(res)
    if (!projectId) return
    const session = sessionManager.createSession(projectId, req.body?.name)
    res.status(201).json(session)
  })

  router.get('/api/sessions/:id', (req, res) => {
    const session = sessionManager.getSession(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
  })

  router.patch('/api/sessions/:id', (req, res) => {
    const session = sessionManager.renameSession(req.params.id, req.body?.name)
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
  })

  router.delete('/api/sessions/:id', (req, res) => {
    const deleted = sessionManager.deleteSession(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Session not found' })
    res.status(204).send()
  })

  // ─── Files (scoped to active project path) ───
  router.get('/api/files', (_req, res) => {
    const projectPath = requireActivePath(res)
    if (!projectPath) return
    const tree = buildFileTree(projectPath)
    res.json(tree)
  })

  router.get('/api/files/content', (req, res) => {
    const projectPath = requireActivePath(res)
    if (!projectPath) return
    const filePath = req.query.path as string
    if (!filePath) return res.status(400).json({ error: 'path query param required' })
    try {
      const result = readFileContent(projectPath, filePath)
      res.json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  })

  // ─── Templates ───
  router.get('/api/templates', (_req, res) => {
    res.json(getTemplates())
  })

  router.post('/api/templates/interpolate', (req, res) => {
    const { templateId, values } = req.body
    const templates = getTemplates()
    const template = templates.find((t) => t.id === templateId)
    if (!template) return res.status(404).json({ error: 'Template not found' })
    const prompt = interpolateTemplate(template, values)
    res.json({ prompt })
  })

  // ─── Settings (scoped to active project) ───
  router.get('/api/settings', (_req, res) => {
    const projectId = requireActiveProject(res)
    if (!projectId) return
    res.json(settingsManager.getAll(projectId))
  })

  router.patch('/api/settings', (req, res) => {
    const projectId = requireActiveProject(res)
    if (!projectId) return
    const pairs = req.body
    if (!pairs || typeof pairs !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object' })
    }
    settingsManager.setMany(projectId, pairs)
    res.json(settingsManager.getAll(projectId))
  })

  // ─── Runner ───
  router.get('/api/runner/status', (_req, res) => {
    res.json(runnerManager.getStatus())
  })

  return router
}
