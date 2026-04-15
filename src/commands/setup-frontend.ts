import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot, getFrontendDir, hasFrontend } from '../utils/paths.js'
import { exec, commandExists } from '../utils/exec.js'
import { log, spinner } from '../utils/logger.js'

function ensureFrontendProject(): string {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  if (!hasFrontend(root)) {
    log.error('This is a backend-only project. No frontend to set up.')
    process.exit(1)
  }

  return getFrontendDir(root)
}

export async function setupFrontendNode() {
  const hasNode = await commandExists('node')
  const hasNpm = await commandExists('npm')

  if (hasNode && hasNpm) {
    log.success('Node.js and npm are already installed')
    const nodeResult = await exec('node', ['--version'], { silent: true })
    const npmResult = await exec('npm', ['--version'], { silent: true })
    log.step(`Node: ${nodeResult.stdout.trim()}`)
    log.step(`npm: ${npmResult.stdout.trim()}`)
    return
  }

  log.info('Node.js/npm is not installed. Attempting to install...')

  const platform = process.platform
  const installSpinner = spinner('Installing Node.js...')

  try {
    if (platform === 'darwin') {
      const hasBrew = await commandExists('brew')
      if (!hasBrew) {
        installSpinner.fail('Homebrew is required to install Node.js on macOS. Install it from https://brew.sh')
        process.exit(1)
      }
      await exec('brew', ['install', 'node'], { silent: false })
    } else if (platform === 'linux') {
      const hasApt = await commandExists('apt-get')
      const hasDnf = await commandExists('dnf')
      if (hasApt) {
        await exec('sudo', ['apt-get', 'update'], { silent: true })
        await exec('sudo', ['apt-get', 'install', '-y', 'nodejs', 'npm'], { silent: false })
      } else if (hasDnf) {
        await exec('sudo', ['dnf', 'install', '-y', 'nodejs', 'npm'], { silent: false })
      } else {
        installSpinner.fail('Could not detect package manager (apt-get or dnf). Install Node.js manually from https://nodejs.org')
        process.exit(1)
      }
    } else {
      installSpinner.fail(`Automatic Node.js installation is not supported on ${platform}. Install from https://nodejs.org`)
      process.exit(1)
    }
    installSpinner.succeed('Node.js installed')
  } catch (error: any) {
    installSpinner.fail('Failed to install Node.js')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupFrontendDeps() {
  const frontendDir = ensureFrontendProject()
  const packageJsonPath = path.join(frontendDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found in frontend directory.')
    process.exit(1)
  }

  const hasNode = await commandExists('node')
  const hasNpm = await commandExists('npm')
  if (!hasNode || !hasNpm) {
    log.error('Node.js and npm are required. Run "blacksmith setup:frontend node" first.')
    process.exit(1)
  }

  const npmSpinner = spinner('Installing Node.js dependencies...')
  try {
    await exec('npm', ['install'], { cwd: frontendDir, silent: true })
    npmSpinner.succeed('Node.js dependencies installed')
  } catch (error: any) {
    npmSpinner.fail('Failed to install Node.js dependencies')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupFrontend() {
  log.info('Setting up frontend project...')
  log.blank()

  await setupFrontendNode()
  log.blank()

  await setupFrontendDeps()
  log.blank()

  log.success('Frontend setup complete! Run "blacksmith dev" to start the server.')
}
