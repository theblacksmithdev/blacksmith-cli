import fs from 'node:fs'
import path from 'node:path'
import { exec, execGradle, execPython } from './exec.js'
import { log } from './logger.js'

export interface TestOptions {
  backend?: boolean
  frontend?: boolean
  coverage?: boolean
  watch?: boolean
}

/**
 * Run a Python backend's pytest suite. Django and FastAPI share this runner.
 *
 * pytest lives in venv/bin, but invoking it as `python -m pytest` also puts the
 * backend directory on sys.path: for Django that is what lets `conftest.py`
 * and the `apps.*` imports resolve the same way they do under manage.py, and
 * for FastAPI it is what makes the `app.*` package importable. FastAPI's
 * generated tests point DATABASE_URL at a throwaway sqlite file and build it
 * by running the Alembic migrations, so — like Django's test settings —
 * no database setup is needed before pytest starts.
 */
export async function runPytest(backendDir: string, options: TestOptions): Promise<boolean> {
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
 * Run a Node package's vitest suite through its npm scripts: the frontend's,
 * or the Express backend's. Express's globalSetup rebuilds the SQLite test
 * database from the Prisma schema, so no migration step is needed first.
 */
export async function runNpmTests(
  dir: string,
  options: TestOptions,
  side: 'backend' | 'frontend'
): Promise<boolean> {
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    log.error(`Dependencies not installed. Run "blacksmith setup:${side}" first.`)
    return false
  }

  log.info(`Running ${side} tests (vitest)...`)
  try {
    await exec('npm', ['run', npmTestScript(options)], { cwd: dir })
    return true
  } catch {
    return false
  }
}

/**
 * Run a Spring backend's JUnit suite through the Gradle wrapper. The suite
 * builds an in-memory database from the Flyway migrations, so nothing needs
 * setting up first.
 */
export async function runGradleTests(backendDir: string, options: TestOptions): Promise<boolean> {
  if (options.coverage) {
    log.warn('--coverage is not set up for Spring backends yet; running the tests without it.')
  }

  log.info('Running backend tests (JUnit)...')
  try {
    await execGradle(options.watch ? ['test', '--continuous'] : ['test'], backendDir)
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
