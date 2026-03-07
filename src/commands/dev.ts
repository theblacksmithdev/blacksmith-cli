import net from 'node:net'
import concurrently from 'concurrently'
import { findProjectRoot, getBackendDir, getFrontendDir, loadConfig } from '../utils/paths.js'
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

export async function dev() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const config = loadConfig(root)
  const backendPort = config.backend.port
  const frontendPort = config.frontend.port
  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)

  // Check port availability before starting
  const [backendAvailable, frontendAvailable] = await Promise.all([
    isPortAvailable(backendPort),
    isPortAvailable(frontendPort),
  ])

  if (!backendAvailable || !frontendAvailable) {
    if (!backendAvailable) {
      log.error(`Port ${backendPort} is already in use (backend).`)
    }
    if (!frontendAvailable) {
      log.error(`Port ${frontendPort} is already in use (frontend).`)
    }
    log.blank()
    log.step('Free the port(s) or change them in blacksmith.config.json')
    log.step(`Find what\'s using a port: lsof -i :${backendAvailable ? frontendPort : backendPort}`)
    process.exit(1)
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
    `exec("npx openapi-ts",{cwd:${JSON.stringify(frontendDir)}},(err,o,se)=>{`,
    `s=false;`,
    `if(err)console.error("Sync failed:",se||err.message);`,
    `else console.log("OpenAPI types synced");`,
    `})`,
    `},2000)});`,
    `console.log("Watching for .py changes...");`,
  ].join('')

  try {
    await concurrently(
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
  } catch {
    // concurrently exits when processes are killed (e.g. Ctrl+C)
    log.blank()
    log.info('Development servers stopped.')
  }
}
