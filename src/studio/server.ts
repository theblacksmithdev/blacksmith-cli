import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { Server as SocketServer } from 'socket.io'
import { createApiRouter } from './routes/api.js'
import { createStaticRouter } from './routes/static.js'
import { setupSocketHandlers } from './ws/handler.js'
import { ClaudeManager } from './services/claude/index.js'
import { SessionManager } from './services/sessions.js'
import { SettingsManager } from './services/settings.js'
import { RunnerManager } from './services/runner/index.js'
import { ProjectManager } from './services/projects.js'
import { closeDatabase } from './db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getStudioClientDir(): string {
  const packageRoot = path.resolve(__dirname, '..')
  return path.join(packageRoot, 'studio', 'dist', 'client')
}

export interface StudioOptions {
  projectRoot?: string
  port: number
}

export async function createStudioServer({ projectRoot, port }: StudioOptions): Promise<{
  server: http.Server
  port: number
}> {
  const app = express()
  app.use(express.json())

  const server = http.createServer(app)
  const io = new SocketServer(server, { cors: { origin: '*' } })

  // Services — no longer tied to a single projectRoot
  const projectManager = new ProjectManager()
  const claudeManager = new ClaudeManager()
  const sessionManager = new SessionManager()
  const settingsManager = new SettingsManager()
  const runnerManager = new RunnerManager()

  // Register initial project if provided
  if (projectRoot) {
    const project = projectManager.register(projectRoot)
    console.log(`[studio] Registered project: ${project.name} (${project.path})`)
  }

  // Check Claude availability
  const claudeStatus = await claudeManager.checkInstalled()
  if (claudeStatus.installed) {
    console.log(`[studio] Claude Code ${claudeStatus.version} found`)
  } else {
    console.warn('[studio] WARNING: Claude Code CLI not found. Prompts will fail.')
  }

  // Routes
  app.use(createApiRouter(projectManager, sessionManager, claudeManager, settingsManager, runnerManager))

  // WebSocket
  setupSocketHandlers(io, projectManager, claudeManager, sessionManager, settingsManager, runnerManager)

  // Static files
  const clientDir = getStudioClientDir()
  console.log(`[studio] Serving client from: ${clientDir}`)
  app.use(createStaticRouter(clientDir))

  server.on('close', () => {
    runnerManager.stopAll()
    closeDatabase()
    console.log('[studio] Runner processes stopped, database closed')
  })

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`[studio] Server listening on port ${port}`)
      resolve({ server, port })
    })
    server.on('error', reject)
  })
}
