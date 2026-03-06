import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot } from '../utils/paths.js'
import { log } from '../utils/logger.js'

export async function eject() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Forge project.')
    process.exit(1)
  }

  const configPath = path.join(root, 'forge.config.json')

  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath)
  }

  log.success('Forge has been ejected.')
  log.blank()
  log.step('Your project is now a standard Django + React project.')
  log.step('All generated code remains in place and is fully owned by you.')
  log.step('The forge CLI commands will no longer work in this directory.')
  log.blank()
  log.info('To continue development without Forge:')
  log.step('Backend:  cd backend && ./venv/bin/python manage.py runserver')
  log.step('Frontend: cd frontend && npm run dev')
  log.step('Codegen:  cd frontend && npx openapi-ts')
  log.blank()
}
