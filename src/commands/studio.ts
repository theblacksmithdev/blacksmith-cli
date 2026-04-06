import net from 'node:net'
import { findProjectRoot, loadConfig } from '../utils/paths.js'
import { log } from '../utils/logger.js'

const DEFAULT_PORT = 3939

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port)
  })
}

async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) return port
    port++
  }
  throw new Error(`No available port found in range ${startPort}-${port - 1}`)
}

interface StudioOptions {
  port?: string
}

export async function studio(options: StudioOptions) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const config = loadConfig(root)
  const requestedPort = options.port ? parseInt(options.port, 10) : DEFAULT_PORT

  let port: number
  try {
    port = await findAvailablePort(requestedPort)
  } catch (err) {
    log.error((err as Error).message)
    process.exit(1)
  }

  if (port !== requestedPort) {
    log.step(`Port ${requestedPort} in use, using ${port}`)
  }

  log.info(`Starting Blacksmith Studio for "${config.name}"...`)
  log.blank()

  try {
    const { createStudioServer } = await import('../studio/server.js')
    const { server } = await createStudioServer({ projectRoot: root, port })

    const url = `http://localhost:${port}`
    log.success('Blacksmith Studio is running!')
    log.blank()
    log.step(`Studio  → ${url}`)
    log.step(`Project → ${root}`)
    log.blank()
    log.info('Press Ctrl+C to stop.')

    // Open browser
    try {
      const open = (await import('open')).default
      await open(url)
    } catch {
      // Silently ignore if open fails
    }

    const shutdown = () => {
      log.blank()
      log.info('Blacksmith Studio stopped.')
      server.close()
      process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (error: any) {
    log.error(`Failed to start Studio: ${error.message}`)
    process.exit(1)
  }
}
