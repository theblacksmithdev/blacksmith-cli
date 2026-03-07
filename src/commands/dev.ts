import net from 'node:net'
import concurrently from 'concurrently'
import { findProjectRoot, getBackendDir, getFrontendDir, loadConfig } from '../utils/paths.js'
import path from 'node:path'
import { log } from '../utils/logger.js'

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

export async function dev() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const config = loadConfig(root)
  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)

  let backendPort: number
  let frontendPort: number
  try {
    ;[backendPort, frontendPort] = await Promise.all([
      findAvailablePort(config.backend.port),
      findAvailablePort(config.frontend.port),
    ])
  } catch (err) {
    log.error((err as Error).message)
    process.exit(1)
  }

  if (backendPort !== config.backend.port) {
    log.step(`Backend port ${config.backend.port} in use, using ${backendPort}`)
  }
  if (frontendPort !== config.frontend.port) {
    log.step(`Frontend port ${config.frontend.port} in use, using ${frontendPort}`)
  }

  log.info('Starting development servers...')
  log.blank()
  log.step(`Django      → http://localhost:${backendPort}`)
  log.step(`Vite        → http://localhost:${frontendPort}`)
  log.step(`Swagger     → http://localhost:${backendPort}/api/docs/`)
  log.step('OpenAPI sync → watching backend .py files')
  log.blank()

  // Build an inline watcher script that watches backend .py files.
  // Runs as a separate child process via concurrently so fs.watch works reliably.
  const syncCmd = `${process.execPath} ${path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')}`
  const watcherCode = [
    `const{watch}=require("fs"),{exec}=require("child_process");`,
    `let t=null,s=false;`,
    `watch(${JSON.stringify(backendDir)},{recursive:true},(e,f)=>{`,
    `if(!f||!f.endsWith(".py"))return;`,
    `if(f.startsWith("venv/")||f.includes("__pycache__")||f.includes("/migrations/"))return;`,
    `if(t)clearTimeout(t);`,
    `t=setTimeout(()=>{`,
    `if(s)return;s=true;`,
    `console.log("Backend change detected — syncing OpenAPI types...");`,
    `exec(${JSON.stringify(syncCmd)},{cwd:${JSON.stringify(frontendDir)}},(err,o,se)=>{`,
    `s=false;`,
    `if(err)console.error("Sync failed:",se||err.message);`,
    `else console.log("OpenAPI types synced");`,
    `})`,
    `},2000)});`,
    `console.log("Watching for .py changes...");`,
  ].join('')

  const { result } = concurrently(
    [
      {
        command: `./venv/bin/python manage.py runserver 0.0.0.0:${backendPort}`,
        name: 'django',
        cwd: backendDir,
        prefixColor: 'green',
      },
      {
        command: 'npm run dev',
        name: 'vite',
        cwd: frontendDir,
        prefixColor: 'blue',
      },
      {
        command: `node -e '${watcherCode}'`,
        name: 'sync',
        cwd: frontendDir,
        prefixColor: 'yellow',
      },
    ],
    {
      prefix: 'name',
      killOthers: ['failure'],
      restartTries: 3,
    }
  )

  const shutdown = () => {
    log.blank()
    log.info('Development servers stopped.')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    await result
  } catch {
    // concurrently rejects when processes are killed
  }
}
