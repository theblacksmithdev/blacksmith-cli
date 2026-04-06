#!/usr/bin/env node

import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_PORT = 3939

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => { server.close(() => resolve(true)) })
    server.listen(port)
  })
}

async function findAvailablePort(startPort) {
  let port = startPort
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) return port
    port++
  }
  throw new Error(`No available port found near ${startPort}`)
}

async function main() {
  // Parse args
  const args = process.argv.slice(2)
  let port = DEFAULT_PORT
  let projectRoot = process.cwd()

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '-p' || args[i] === '--port') && args[i + 1]) {
      port = parseInt(args[i + 1], 10)
      i++
    } else if ((args[i] === '-d' || args[i] === '--dir') && args[i + 1]) {
      projectRoot = path.resolve(args[i + 1])
      i++
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
  Blacksmith Studio — Web UI for AI-powered development

  Usage: blacksmith-studio [options]

  Options:
    -p, --port <port>   Port to run on (default: ${DEFAULT_PORT})
    -d, --dir <path>    Project directory to open (default: current dir)
    -h, --help          Show this help
`)
      process.exit(0)
    }
  }

  const availablePort = await findAvailablePort(port)

  // Import the server
  const { createStudioServer } = await import('../dist/server/index.js')
  const { server } = await createStudioServer({ projectRoot, port: availablePort })

  const url = `http://localhost:${availablePort}`
  console.log(`\n  Blacksmith Studio running at ${url}\n`)

  // Open browser
  try {
    const open = (await import('open')).default
    await open(url)
  } catch { /* silently ignore */ }

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n  Studio stopped.')
    server.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Failed to start Blacksmith Studio:', err.message)
  process.exit(1)
})
