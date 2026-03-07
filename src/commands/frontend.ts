import { findProjectRoot, getFrontendDir } from '../utils/paths.js'
import { log } from '../utils/logger.js'
import { exec } from '../utils/exec.js'

export async function frontend(args: string[]) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }
  if (args.length === 0) {
    log.error('Please provide an npm command.')
    log.step('Usage: blacksmith frontend <command> [args...]')
    log.step('Example: blacksmith frontend install axios')
    process.exit(1)
  }

  const frontendDir = getFrontendDir(root)

  try {
    await exec('npm', args, { cwd: frontendDir })
  } catch {
    process.exit(1)
  }
}
