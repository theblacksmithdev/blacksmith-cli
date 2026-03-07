import { findProjectRoot, getBackendDir, getFrontendDir } from '../utils/paths.js'
import { exec, execPython } from '../utils/exec.js'
import { log, spinner } from '../utils/logger.js'

export async function build() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)

  // Build frontend
  const frontendSpinner = spinner('Building frontend...')
  try {
    await exec('npm', ['run', 'build'], { cwd: frontendDir, silent: true })
    frontendSpinner.succeed('Frontend built → frontend/dist/')
  } catch (error: any) {
    frontendSpinner.fail('Frontend build failed')
    log.error(error.message || error)
    process.exit(1)
  }

  // Collect static files
  const backendSpinner = spinner('Collecting static files...')
  try {
    await execPython(
      ['manage.py', 'collectstatic', '--noinput'],
      backendDir,
      true
    )
    backendSpinner.succeed('Static files collected')
  } catch (error: any) {
    backendSpinner.fail('Failed to collect static files')
    log.error(error.message || error)
    process.exit(1)
  }

  log.blank()
  log.success('Production build complete!')
  log.blank()
  log.step('Frontend assets: frontend/dist/')
  log.step('Backend ready for deployment')
  log.blank()
}
