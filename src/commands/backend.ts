import { findProjectRoot, getBackendDir } from '../utils/paths.js'
import { log } from '../utils/logger.js'
import { execPython } from '../utils/exec.js'

export async function backend(args: string[]) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }
  if (args.length === 0) {
    log.error('Please provide a Django management command.')
    log.step('Usage: blacksmith backend <command> [args...]')
    log.step('Example: blacksmith backend createsuperuser')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)

  try {
    await execPython(['manage.py', ...args], backendDir)
  } catch {
    process.exit(1)
  }
}
