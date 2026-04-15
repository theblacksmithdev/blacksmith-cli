import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot, getBackendDir, hasBackend } from '../utils/paths.js'
import { exec, execPip, execPython, commandExists } from '../utils/exec.js'
import { log, spinner } from '../utils/logger.js'

function ensureBackendProject(): string {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  if (!hasBackend(root)) {
    log.error('This is a frontend-only project. No backend to set up.')
    process.exit(1)
  }

  return getBackendDir(root)
}

export async function setupBackendPython() {
  const hasPython = await commandExists('python3')
  if (hasPython) {
    log.success('Python 3 is already installed')
    const result = await exec('python3', ['--version'], { silent: true })
    log.step(`Version: ${result.stdout.trim()}`)
    return
  }

  log.info('Python 3 is not installed. Attempting to install...')

  const platform = process.platform
  const installSpinner = spinner('Installing Python 3...')

  try {
    if (platform === 'darwin') {
      const hasBrew = await commandExists('brew')
      if (!hasBrew) {
        installSpinner.fail('Homebrew is required to install Python on macOS. Install it from https://brew.sh')
        process.exit(1)
      }
      await exec('brew', ['install', 'python3'], { silent: false })
    } else if (platform === 'linux') {
      const hasApt = await commandExists('apt-get')
      const hasDnf = await commandExists('dnf')
      if (hasApt) {
        await exec('sudo', ['apt-get', 'update'], { silent: true })
        await exec('sudo', ['apt-get', 'install', '-y', 'python3', 'python3-venv', 'python3-pip'], { silent: false })
      } else if (hasDnf) {
        await exec('sudo', ['dnf', 'install', '-y', 'python3', 'python3-pip'], { silent: false })
      } else {
        installSpinner.fail('Could not detect package manager (apt-get or dnf). Install Python 3 manually.')
        process.exit(1)
      }
    } else {
      installSpinner.fail(`Automatic Python installation is not supported on ${platform}. Install Python 3 from https://python.org`)
      process.exit(1)
    }
    installSpinner.succeed('Python 3 installed')
  } catch (error: any) {
    installSpinner.fail('Failed to install Python 3')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupBackendVenv() {
  const backendDir = ensureBackendProject()
  const venvPath = path.join(backendDir, 'venv')

  if (fs.existsSync(venvPath)) {
    log.success('Virtual environment already exists')
    log.step(`Path: ${venvPath}`)
    return
  }

  const hasPython = await commandExists('python3')
  if (!hasPython) {
    log.error('Python 3 is required but not found. Run "blacksmith setup:backend python" first.')
    process.exit(1)
  }

  const venvSpinner = spinner('Creating Python virtual environment...')
  try {
    await exec('python3', ['-m', 'venv', 'venv'], { cwd: backendDir, silent: true })
    venvSpinner.succeed('Virtual environment created')
    log.step(`Path: ${venvPath}`)
  } catch (error: any) {
    venvSpinner.fail('Failed to create virtual environment')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupBackendDeps() {
  const backendDir = ensureBackendProject()
  const venvPath = path.join(backendDir, 'venv')
  const requirementsPath = path.join(backendDir, 'requirements.txt')

  if (!fs.existsSync(venvPath)) {
    log.error('Virtual environment not found. Run "blacksmith setup:backend venv" first.')
    process.exit(1)
  }

  if (!fs.existsSync(requirementsPath)) {
    log.error('requirements.txt not found in backend directory.')
    process.exit(1)
  }

  const pipSpinner = spinner('Installing Python dependencies...')
  try {
    await execPip(['install', '-r', 'requirements.txt'], backendDir, true)
    pipSpinner.succeed('Python dependencies installed')
  } catch (error: any) {
    pipSpinner.fail('Failed to install Python dependencies')
    log.error(error.message)
    process.exit(1)
  }

  // Run migrations
  const migrateSpinner = spinner('Running database migrations...')
  try {
    await execPython(['manage.py', 'migrate'], backendDir, true)
    migrateSpinner.succeed('Database migrated')
  } catch (error: any) {
    migrateSpinner.fail('Failed to run migrations')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupBackend() {
  log.info('Setting up backend project...')
  log.blank()

  await setupBackendPython()
  log.blank()

  await setupBackendVenv()
  log.blank()

  await setupBackendDeps()
  log.blank()

  log.success('Backend setup complete! Run "blacksmith dev" to start the server.')
}
