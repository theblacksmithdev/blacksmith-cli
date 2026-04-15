import { findProjectRoot, hasBackend, hasFrontend } from '../utils/paths.js'
import { log } from '../utils/logger.js'
import { setupBackend } from './setup-backend.js'
import { setupFrontend } from './setup-frontend.js'

export async function setup() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const needsBackend = hasBackend(root)
  const needsFrontend = hasFrontend(root)

  if (needsBackend) {
    await setupBackend()
    log.blank()
  }

  if (needsFrontend) {
    await setupFrontend()
    log.blank()
  }

  log.success('Project setup complete! Run "blacksmith dev" to start developing.')
}
