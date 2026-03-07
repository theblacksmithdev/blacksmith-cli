import { execa } from 'execa'
import { log } from './logger.js'

export interface ExecOptions {
  cwd?: string
  silent?: boolean
  env?: Record<string, string>
}

/**
 * Execute a shell command and return the result
 */
export async function exec(command: string, args: string[], options: ExecOptions = {}) {
  const { cwd, silent = false, env } = options

  try {
    const result = await execa(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: silent ? 'pipe' : 'inherit',
    })
    return result
  } catch (error: any) {
    if (!silent) {
      log.error(`Command failed: ${command} ${args.join(' ')}`)
      if (error.stderr) {
        log.error(error.stderr)
      }
    }
    throw error
  }
}

/**
 * Execute a shell command silently and return stdout
 */
export async function execSilent(command: string, args: string[], cwd?: string): Promise<string> {
  const result = await exec(command, args, { cwd, silent: true })
  return result.stdout
}

/**
 * Check if a command exists in PATH
 */
export async function commandExists(command: string): Promise<boolean> {
  try {
    await execa('which', [command], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

/**
 * Run a Python command using the project's virtual environment
 */
export async function execPython(args: string[], cwd: string, silent = false) {
  const venvPython = `${cwd}/venv/bin/python`
  return exec(venvPython, args, { cwd, silent })
}

/**
 * Run pip using the project's virtual environment
 */
export async function execPip(args: string[], cwd: string, silent = false) {
  const venvPip = `${cwd}/venv/bin/pip`
  return exec(venvPip, args, { cwd, silent })
}
