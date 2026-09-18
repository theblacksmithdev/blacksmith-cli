import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { exec, execPython } from '../utils/exec.js'
import { log } from '../utils/logger.js'

export interface TestOptions {
  backend?: boolean
  frontend?: boolean
  coverage?: boolean
  watch?: boolean
}

/**
 * Run pytest through the project's virtual environment.
 *
 * pytest lives in venv/bin, but invoking it as `python -m pytest` also puts the
 * backend directory on sys.path, which is what lets `conftest.py` and the
 * `apps.*` imports resolve the same way they do under manage.py.
 */
async function runBackendTests(backendDir: string, options: TestOptions): Promise<boolean> {
  if (!fs.existsSync(path.join(backendDir, 'venv'))) {
    log.error('Virtual environment not found. Run "blacksmith setup:backend" first.')
    return false
  }

  const args = ['-m', 'pytest']
  if (options.coverage) {
    args.push('--cov', '--cov-report=term-missing')
  }

  log.info('Running backend tests (pytest)...')
  try {
    await execPython(args, backendDir)
    return true
  } catch {
    return false
  }
}

/**
 * Run the Express backend's vitest suite.
 *
 * Its globalSetup rebuilds the SQLite test database from the Prisma schema,
 * so no migration step is needed here.
 */
async function runExpressBackendTests(
  backendDir: string,
  options: TestOptions
): Promise<boolean> {
  if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
    log.error('Dependencies not installed. Run "blacksmith setup:backend" first.')
    return false
  }

  log.info('Running backend tests (vitest)...')
  try {
    await exec('npm', ['run', npmTestScript(options)], { cwd: backendDir })
    return true
  } catch {
    return false
  }
}

/** The package.json script matching the requested test mode. */
function npmTestScript(options: TestOptions): string {
  if (options.watch) return 'test:watch'
  if (options.coverage) return 'test:coverage'
  return 'test'
}

async function runFrontendTests(frontendDir: string, options: TestOptions): Promise<boolean> {
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    log.error('Dependencies not installed. Run "blacksmith setup:frontend" first.')
    return false
  }

  log.info('Running frontend tests (vitest)...')
  try {
    await exec('npm', ['run', npmTestScript(options)], { cwd: frontendDir })
    return true
  } catch {
    return false
  }
}

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
    const ok = getBackendFramework(root) === 'express'
      ? await runExpressBackendTests(backendDir, options)
      : await runBackendTests(backendDir, options)
    if (!ok) failed.push('backend')
    log.blank()
  }

  if (runFrontend) {
    const ok = await runFrontendTests(getFrontendDir(root), options)
    if (!ok) failed.push('frontend')
    log.blank()
  }

  if (failed.length > 0) {
    log.error(`Tests failed: ${failed.join(', ')}`)
    process.exit(1)
  }

  log.success('All tests passed.')
}
