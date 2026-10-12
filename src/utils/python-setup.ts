import fs from 'node:fs'
import path from 'node:path'
import { exec, execSilent, commandExists } from './exec.js'
import { log, spinner } from './logger.js'
import type { Step } from './steps.js'
import { runStep } from './steps.js'

/** Create the backend's `venv/`. */
export const CREATE_VENV: Step = {
  pending: 'Creating Python virtual environment...',
  done: 'Virtual environment created',
  failed: 'Failed to create virtual environment',
  run: (dir) => exec('python3', ['-m', 'venv', 'venv'], { cwd: dir, silent: true }),
}

/** Make sure Python 3 and pip are installed, installing them where the platform allows. */
export async function ensurePython() {
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

/** Create the backend's venv if it is missing, and make sure it has pip. */
export async function ensureVenv(backendDir: string) {
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

  await runStep(CREATE_VENV, backendDir)
  log.step(`Path: ${venvPath}`)

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
