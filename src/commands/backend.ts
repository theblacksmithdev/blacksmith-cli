import { findProjectRoot, getBackendDir, getBackendFramework, hasBackend } from '../utils/paths.js'
import { log } from '../utils/logger.js'
import { exec, execPython } from '../utils/exec.js'

/**
 * Run a command against the backend's own toolchain.
 *
 * Django projects get `manage.py <args>`. Express projects have no management
 * commands, so they get `npm <args>` — the same passthrough the `frontend`
 * command provides, which covers scripts, installs and `npm exec prisma ...`.
 */
export async function backend(args: string[]) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }
  if (!hasBackend(root)) {
    log.error('This is a frontend-only project. The "backend" command is not available.')
    process.exit(1)
  }

  const isExpress = getBackendFramework(root) === 'express'

  if (args.length === 0) {
    if (isExpress) {
      log.error('Please provide an npm command.')
      log.step('Usage: blacksmith backend <command> [args...]')
      log.step('Example: blacksmith backend run migrate')
      log.step('Example: blacksmith backend exec prisma studio')
    } else {
      log.error('Please provide a Django management command.')
      log.step('Usage: blacksmith backend <command> [args...]')
      log.step('Example: blacksmith backend createsuperuser')
    }
    process.exit(1)
  }

  const backendDir = getBackendDir(root)

  try {
    if (isExpress) {
      await exec('npm', args, { cwd: backendDir })
    } else {
      await execPython(['manage.py', ...args], backendDir)
    }
  } catch {
    process.exit(1)
  }
}
