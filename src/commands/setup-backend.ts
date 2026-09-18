import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot, getBackendDir, getBackendFramework, hasBackend } from '../utils/paths.js'
import type { BackendFramework } from '../utils/paths.js'
import { exec, execPip, execPython, execSilent, commandExists } from '../utils/exec.js'
import { ensureGitignore } from '../utils/gitignore.js'
import { log, spinner } from '../utils/logger.js'

interface BackendProject {
  dir: string
  framework: BackendFramework
  isExpress: boolean
}

function ensureBackendProject(): BackendProject {
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

  return describeBackend(root)
}

/** The backend project we are inside, or null when there is none. */
function findBackendProject(): BackendProject | null {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    return null
  }
  return hasBackend(root) ? describeBackend(root) : null
}

function describeBackend(root: string): BackendProject {
  const framework = getBackendFramework(root)
  return { dir: getBackendDir(root), framework, isExpress: framework === 'express' }
}

/**
 * Stop a Python-only subcommand from running against an Express backend.
 *
 * Without this the venv step would silently create a `venv/` directory inside
 * a Node project.
 */
function rejectOnExpress(project: BackendProject, command: string): void {
  if (!project.isExpress) return
  log.error(`"${command}" applies to Django backends. This project uses Express.`)
  log.step('Run "blacksmith setup:backend" to set up the Express backend instead.')
  process.exit(1)
}

export async function setupBackendPython() {
  // Installing Python needs no project — this is the one backend subcommand a
  // user can run on a bare machine before `init`. Only reject when there IS a
  // project and it is an Express one.
  const project = findBackendProject()
  if (project) rejectOnExpress(project, 'setup:backend python')

  const hasPython = await commandExists('python3')
  if (hasPython) {
    log.success('Python 3 is already installed')
    const version = await execSilent('python3', ['--version'])
    log.step(`Version: ${version.trim()}`)
  } else {
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

  // Ensure pip is available
  await ensurePip()
}

async function ensurePip() {
  const hasPip = await commandExists('pip3') || await commandExists('pip')
  if (hasPip) {
    return
  }

  log.info('pip is not installed. Attempting to install...')

  const platform = process.platform
  const pipSpinner = spinner('Installing pip...')

  try {
    // Try ensurepip first (works on most systems)
    try {
      await exec('python3', ['-m', 'ensurepip', '--upgrade'], { silent: true })
      pipSpinner.succeed('pip installed via ensurepip')
      return
    } catch {
      // ensurepip not available, fall back to package manager
    }

    if (platform === 'darwin') {
      const hasBrew = await commandExists('brew')
      if (hasBrew) {
        await exec('brew', ['install', 'python3'], { silent: false })
      }
    } else if (platform === 'linux') {
      const hasApt = await commandExists('apt-get')
      const hasDnf = await commandExists('dnf')
      if (hasApt) {
        await exec('sudo', ['apt-get', 'install', '-y', 'python3-pip'], { silent: false })
      } else if (hasDnf) {
        await exec('sudo', ['dnf', 'install', '-y', 'python3-pip'], { silent: false })
      } else {
        pipSpinner.fail('Could not install pip. Install it manually: python3 -m ensurepip or install python3-pip')
        process.exit(1)
      }
    } else {
      pipSpinner.fail('Could not install pip. Install it manually: python3 -m ensurepip')
      process.exit(1)
    }
    pipSpinner.succeed('pip installed')
  } catch (error: any) {
    pipSpinner.fail('Failed to install pip')
    log.error(error.message)
    process.exit(1)
  }
}

export async function setupBackendVenv() {
  const project = ensureBackendProject()
  rejectOnExpress(project, 'setup:backend venv')

  const backendDir = project.dir
  const venvPath = path.join(backendDir, 'venv')

  // venv/ must be ignored before the venv exists, otherwise it lands in git.
  // Projects generated before .gitignore shipped correctly are healed here.
  if (ensureGitignore(backendDir, 'backend')) {
    log.step('Added backend/.gitignore (ignores venv/)')
  }

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

  // Ensure venv has pip (some systems create venvs without it)
  const venvPipPath = path.join(venvPath, 'bin', 'pip')
  if (!fs.existsSync(venvPipPath)) {
    const pipSpinner = spinner('Installing pip in virtual environment...')
    try {
      const venvPython = path.join(venvPath, 'bin', 'python')
      await exec(venvPython, ['-m', 'ensurepip', '--upgrade'], { silent: true })
      pipSpinner.succeed('pip installed in virtual environment')
    } catch (error: any) {
      pipSpinner.fail('Failed to install pip in virtual environment')
      log.error(error.message)
      log.error('Try: python3 -m venv --clear venv')
      process.exit(1)
    }
  }
}

export async function setupBackendDeps() {
  const project = ensureBackendProject()
  if (project.isExpress) {
    await setupExpressDeps(project.dir)
    return
  }

  const backendDir = project.dir
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

/**
 * Install dependencies and bring the database up to date for an Express
 * backend — the counterpart to pip install + migrate.
 */
async function setupExpressDeps(backendDir: string) {
  if (!fs.existsSync(path.join(backendDir, 'package.json'))) {
    log.error('package.json not found in backend directory.')
    process.exit(1)
  }

  // node_modules/ must be ignored before npm install runs. Projects generated
  // before .gitignore shipped correctly are healed here.
  if (ensureGitignore(backendDir, 'backend-express')) {
    log.step('Added backend/.gitignore (ignores node_modules/)')
  }

  const npmSpinner = spinner('Installing backend dependencies...')
  try {
    await exec('npm', ['install'], { cwd: backendDir, silent: true })
    npmSpinner.succeed('Backend dependencies installed')
  } catch (error: any) {
    npmSpinner.fail('Failed to install backend dependencies')
    log.error(error.message)
    process.exit(1)
  }

  const prismaSpinner = spinner('Applying database migrations...')
  try {
    await exec('npx', ['prisma', 'generate'], { cwd: backendDir, silent: true })
    // `migrate deploy` applies committed migrations without prompting, which
    // is what a setup step on an existing project needs.
    await exec('npx', ['prisma', 'migrate', 'deploy'], { cwd: backendDir, silent: true })
    prismaSpinner.succeed('Database migrated')
  } catch (error: any) {
    prismaSpinner.fail('Failed to apply database migrations')
    log.error(error.message)
    process.exit(1)
  }
}

async function setupExpressBackend(backendDir: string) {
  const hasNode = await commandExists('node')
  const hasNpm = await commandExists('npm')
  if (!hasNode || !hasNpm) {
    log.error('Node.js and npm are required but not found. Install from https://nodejs.org')
    process.exit(1)
  }

  const nodeVersion = await execSilent('node', ['--version'])
  log.success('Node.js is installed')
  log.step(`Version: ${nodeVersion.trim()}`)
  log.blank()

  await setupExpressDeps(backendDir)
  log.blank()
}

export async function setupBackend() {
  log.info('Setting up backend project...')
  log.blank()

  const project = ensureBackendProject()

  if (project.isExpress) {
    await setupExpressBackend(project.dir)
    log.success('Backend setup complete! Run "blacksmith dev" to start the server.')
    return
  }

  await setupBackendPython()
  log.blank()

  await setupBackendVenv()
  log.blank()

  await setupBackendDeps()
  log.blank()

  log.success('Backend setup complete! Run "blacksmith dev" to start the server.')
}
