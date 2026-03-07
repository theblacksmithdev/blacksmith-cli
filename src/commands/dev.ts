import concurrently from 'concurrently'
import { findProjectRoot, getBackendDir, getFrontendDir } from '../utils/paths.js'
import { log } from '../utils/logger.js'

export async function dev() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)

  log.info('Starting development servers...')
  log.blank()
  log.step('Django      → http://localhost:8000')
  log.step('Vite        → http://localhost:5173')
  log.step('Swagger     → http://localhost:8000/api/docs/')
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
          command: './venv/bin/python manage.py runserver 0.0.0.0:8000',
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
