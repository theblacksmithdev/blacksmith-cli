import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { log } from '../utils/logger.js'
import { BACKEND_TOOLCHAINS } from '../utils/backend-toolchains.js'
import { RUNTIMES } from '../utils/runtimes.js'
import { runNpmTests } from '../utils/test-runners.js'
import type { TestOptions } from '../utils/test-runners.js'

export async function test(options: TestOptions = {}) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  // With no flags, run whichever sides the project actually has
  const explicit = Boolean(options.backend || options.frontend)
  const runBackend = (explicit ? Boolean(options.backend) : true) && hasBackend(root)
  const runFrontend = (explicit ? Boolean(options.frontend) : true) && hasFrontend(root)

  if (options.backend && !hasBackend(root)) {
    log.error('This is a frontend-only project. There is no backend to test.')
    process.exit(1)
  }
  if (options.frontend && !hasFrontend(root)) {
    log.error('This is a backend-only project. There is no frontend to test.')
    process.exit(1)
  }

  if (options.watch && runBackend && runFrontend) {
    log.error('--watch runs a single suite. Add --frontend (or --backend) to choose one.')
    process.exit(1)
  }

  const failed: string[] = []

  if (runBackend) {
    const backendDir = getBackendDir(root)
    const { runtime } = BACKEND_TOOLCHAINS[getBackendFramework(root)]
    const ok = await RUNTIMES[runtime].runTests(backendDir, options)
    if (!ok) failed.push('backend')
    log.blank()
  }

  if (runFrontend) {
    const ok = await runNpmTests(getFrontendDir(root), options, 'frontend')
    if (!ok) failed.push('frontend')
    log.blank()
  }

  if (failed.length > 0) {
    log.error(`Tests failed: ${failed.join(', ')}`)
    process.exit(1)
  }

  log.success('All tests passed.')
}
