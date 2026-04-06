import { Router } from 'express'
import type { SessionManager } from '../services/sessions.js'
import type { ClaudeManager } from '../services/claude/index.js'
import type { SettingsManager } from '../services/settings.js'
import type { RunnerManager } from '../services/runner/index.js'
import { buildFileTree, readFileContent } from '../services/files.js'
import { getTemplates, interpolateTemplate } from '../services/templates.js'

export function createApiRouter(
  projectRoot: string,
  sessionManager: SessionManager,
  claudeManager: ClaudeManager,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
): Router {
  const router = Router()

  // Health check
  router.get('/api/health', async (_req, res) => {
    const claude = await claudeManager.checkInstalled()
    res.json({
      projectName: projectRoot.split('/').pop() || 'project',
      projectRoot,
      claudeInstalled: claude.installed,
      claudeVersion: claude.version,
    })
  })

  // Sessions
  router.get('/api/sessions', (_req, res) => {
    res.json(sessionManager.listSessions())
  })

  router.post('/api/sessions', (req, res) => {
    const session = sessionManager.createSession(req.body?.name)
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

  // Files
  router.get('/api/files', (_req, res) => {
    const tree = buildFileTree(projectRoot)
    res.json(tree)
  })

  router.get('/api/files/content', (req, res) => {
    const filePath = req.query.path as string
    if (!filePath) return res.status(400).json({ error: 'path query param required' })
    try {
      const result = readFileContent(projectRoot, filePath)
      res.json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  })

  // Templates
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

  // Settings
  router.get('/api/settings', (_req, res) => {
    res.json(settingsManager.getAll())
  })

  router.patch('/api/settings', (req, res) => {
    const pairs = req.body
    if (!pairs || typeof pairs !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object of key-value pairs' })
    }
    settingsManager.setMany(pairs)
    res.json(settingsManager.getAll())
  })

  // Runner
  router.get('/api/runner/status', (_req, res) => {
    res.json(runnerManager.getStatus())
  })

  return router
}
