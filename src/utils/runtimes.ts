import fs from 'node:fs'
import path from 'node:path'
import { exec, execPip, execSilent, commandExists } from './exec.js'
import { log } from './logger.js'
import type { Step } from './steps.js'
import { CREATE_VENV, ensurePython, ensureVenv } from './python-setup.js'
import { runNpmTests, runPytest } from './test-runners.js'
import type { TestOptions } from './test-runners.js'

/** The language toolchain a backend runs on. The frontend always runs on Node. */
export type Runtime = 'python' | 'node'

export interface RuntimeSupport {
  /** Shown in "Prerequisites OK (...)". */
  label: string
  /** Executables that must be on PATH. */
  commands: string[]
  /** Shown when one of them is missing. */
  missing: string
  /** The directory dependencies are installed into, which must be gitignored. */
  dependencyDir: string
  /** Every step that takes a freshly rendered backend to installed dependencies. */
  install: Step[]
  /** Install the dependencies of an existing checkout. */
  installDependencies: Step
  /** Why the backend cannot have its dependencies installed yet, or null when it can. */
  notReady(backendDir: string): string | null
  /** Install or verify the runtime itself, for `setup:backend`. */
  prepare(backendDir: string): Promise<void>
  runTests(backendDir: string, options: TestOptions): Promise<boolean>
}

const PYTHON_DEPENDENCIES: Step = {
  pending: 'Installing Python dependencies...',
  done: 'Python dependencies installed',
  failed: 'Failed to install Python dependencies',
  run: (dir) => execPip(['install', '-r', 'requirements.txt'], dir, true),
}

const NODE_DEPENDENCIES: Step = {
  pending: 'Installing backend dependencies...',
  done: 'Backend dependencies installed',
  failed: 'Failed to install backend dependencies',
  run: (dir) => exec('npm', ['install'], { cwd: dir, silent: true }),
}

export const RUNTIMES: Record<Runtime, RuntimeSupport> = {
  python: {
    label: 'Python 3',
    commands: ['python3'],
    missing: 'Python 3 is required but not found. Install it from https://python.org',
    dependencyDir: 'venv',
    install: [CREATE_VENV, PYTHON_DEPENDENCIES],
    installDependencies: PYTHON_DEPENDENCIES,
    notReady: (dir) => {
      if (!fs.existsSync(path.join(dir, 'venv'))) {
        return 'Virtual environment not found. Run "blacksmith setup:backend venv" first.'
      }
      if (!fs.existsSync(path.join(dir, 'requirements.txt'))) {
        return 'requirements.txt not found in backend directory.'
      }
      return null
    },
    prepare: async (dir) => {
      await ensurePython()
      log.blank()
      await ensureVenv(dir)
    },
    runTests: runPytest,
  },
  node: {
    label: 'Node.js, npm',
    commands: ['node', 'npm'],
    missing: 'Node.js and npm are required but not found. Install from https://nodejs.org',
    dependencyDir: 'node_modules',
    install: [NODE_DEPENDENCIES],
    installDependencies: NODE_DEPENDENCIES,
    notReady: (dir) =>
      fs.existsSync(path.join(dir, 'package.json'))
        ? null
        : 'package.json not found in backend directory.',
    prepare: async () => {
      const missing = await findMissingRuntime(['node'])
      if (missing) {
        log.error(missing.missing)
        process.exit(1)
      }
      const nodeVersion = await execSilent('node', ['--version'])
      log.success('Node.js is installed')
      log.step(`Version: ${nodeVersion.trim()}`)
    },
    runTests: (dir, options) => runNpmTests(dir, options, 'backend'),
  },
}

/** The first runtime whose executables are not all on PATH, or null. */
export async function findMissingRuntime(runtimes: Runtime[]): Promise<RuntimeSupport | null> {
  for (const runtime of runtimes) {
    const support = RUNTIMES[runtime]
    for (const command of support.commands) {
      if (!(await commandExists(command))) return support
    }
  }
  return null
}

/**
 * The runtimes a new project needs: the backend's, plus Node for a frontend.
 * A Node backend with a frontend needs Node once.
 */
export function requiredRuntimes(backendRuntime: Runtime | null, needsFrontend: boolean): Runtime[] {
  const runtimes = new Set<Runtime>()
  if (backendRuntime) runtimes.add(backendRuntime)
  if (needsFrontend) runtimes.add('node')
  return [...runtimes]
}
