import { findProjectRoot, getBackendDir, getBackendFramework, hasBackend } from '../utils/paths.js'
import { BACKEND_PASSTHROUGHS } from '../utils/backend-passthrough.js'
import { log } from '../utils/logger.js'

/**
 * Run a command against the backend's own toolchain: `manage.py` for Django,
 * `npm` for Express, `python -m` for FastAPI (see BACKEND_PASSTHROUGHS).
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

  const passthrough = BACKEND_PASSTHROUGHS[getBackendFramework(root)]

  if (args.length === 0) {
    log.error(`Please provide ${passthrough.needs}.`)
    log.step('Usage: blacksmith backend <command> [args...]')
    for (const example of passthrough.examples) {
      log.step(`Example: blacksmith backend ${example}`)
    }
    process.exit(1)
  }

  try {
    await passthrough.run(args, getBackendDir(root))
  } catch {
    process.exit(1)
  }
}
