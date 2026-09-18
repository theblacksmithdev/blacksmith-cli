import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot, getBackendFramework, loadConfig } from '../utils/paths.js'
import { log } from '../utils/logger.js'

export async function eject() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project.')
    process.exit(1)
  }

  const config = loadConfig(root)
  const projectType = config.type || 'fullstack'
  const backendName = getBackendFramework(root) === 'express' ? 'Express' : 'Django'
  const configPath = path.join(root, 'blacksmith.config.json')

  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath)
  }

  log.success('Blacksmith has been ejected.')
  log.blank()

  if (projectType === 'fullstack') {
    log.step(`Your project is now a standard ${backendName} + React project.`)
  } else if (projectType === 'backend') {
    log.step(`Your project is now a standard ${backendName} project.`)
  } else {
    log.step('Your project is now a standard React project.')
  }

  log.step('All generated code remains in place and is fully owned by you.')
  log.step('The blacksmith CLI commands will no longer work in this directory.')
  log.blank()
  log.info('To continue development without Blacksmith:')

  const startBackend =
    backendName === 'Express' ? 'npm run dev' : './venv/bin/python manage.py runserver'

  if (projectType === 'fullstack') {
    log.step(`Backend:  cd backend && ${startBackend}`)
    log.step('Frontend: cd frontend && npm run dev')
    log.step('Codegen:  cd frontend && npx openapi-ts')
  } else if (projectType === 'backend') {
    log.step(`Start:    ${startBackend}`)
  } else {
    log.step('Start:    npm run dev')
  }

  log.blank()
}
