import concurrently from 'concurrently'
import { findProjectRoot, getBackendDir, getFrontendDir } from '../utils/paths.js'
import { log } from '../utils/logger.js'

export async function dev() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Forge project. Run "forge init <name>" first.')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)

  log.info('Starting development servers...')
  log.blank()
  log.step('Django      → http://localhost:8000')
  log.step('Vite        → http://localhost:5173')
  log.step('Swagger     → http://localhost:8000/api/docs/')
  log.step('OpenAPI sync → watching for schema changes')
  log.blank()

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
          command: 'npx openapi-ts --watch',
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
