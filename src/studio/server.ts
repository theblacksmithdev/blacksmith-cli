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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getStudioClientDir(): string {
  // Walk up from dist/ to package root, then into studio/dist/client
  const packageRoot = path.resolve(__dirname, '..')
  return path.join(packageRoot, 'studio', 'dist', 'client')
}

export interface StudioOptions {
  projectRoot: string
  port: number
}

export async function createStudioServer({ projectRoot, port }: StudioOptions): Promise<{
  server: http.Server
  port: number
}> {
  const app = express()
  app.use(express.json())

  const server = http.createServer(app)
  const io = new SocketServer(server, {
    cors: { origin: '*' },
  })

  // Services
  const claudeManager = new ClaudeManager(projectRoot)
  const sessionManager = new SessionManager(projectRoot)

  // Check Claude availability
  const claudeStatus = await claudeManager.checkInstalled()
  if (claudeStatus.installed) {
    console.log(`[studio] Claude Code ${claudeStatus.version} found`)
  } else {
    console.warn('[studio] WARNING: Claude Code CLI not found. Prompts will fail.')
  }

  // Routes
  app.use(createApiRouter(projectRoot, sessionManager, claudeManager))

  // WebSocket
  setupSocketHandlers(io, claudeManager, sessionManager)

  // Static files (React SPA) — must come after API routes
  const clientDir = getStudioClientDir()
  console.log(`[studio] Serving client from: ${clientDir}`)
  app.use(createStaticRouter(clientDir))

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`[studio] Server listening on port ${port}`)
      console.log(`[studio] Project root: ${projectRoot}`)
      resolve({ server, port })
    })
    server.on('error', reject)
  })
}
