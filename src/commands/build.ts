import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { exec } from '../utils/exec.js'
import { BACKEND_TOOLCHAINS } from '../utils/backend-toolchains.js'
import { runStep } from '../utils/steps.js'
import { log, spinner } from '../utils/logger.js'

export async function build() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const projectHasBackend = hasBackend(root)
  const projectHasFrontend = hasFrontend(root)

  // Build frontend
  if (projectHasFrontend) {
    const frontendDir = getFrontendDir(root)
    const frontendSpinner = spinner('Building frontend...')
    try {
      await exec('npm', ['run', 'build'], { cwd: frontendDir, silent: true })
      frontendSpinner.succeed('Frontend built → dist/')
    } catch (error: any) {
      frontendSpinner.fail('Frontend build failed')
      log.error(error.message || error)
      process.exit(1)
    }
  }

  // Compile or collect whatever the backend's production build needs
  const toolchain = projectHasBackend ? BACKEND_TOOLCHAINS[getBackendFramework(root)] : null
  if (toolchain?.build) {
    await runStep(toolchain.build, getBackendDir(root))
  }

  log.blank()
  log.success('Production build complete!')
  log.blank()
  if (projectHasFrontend) log.step('Frontend assets: dist/')
  if (toolchain) log.step(toolchain.buildOutput)
  log.blank()
}
