import { findProjectRoot, getBackendDir, getBackendFramework, hasBackend } from '../utils/paths.js'
import type { BackendFramework } from '../utils/paths.js'
import { BACKEND_TOOLCHAINS } from '../utils/backend-toolchains.js'
import type { BackendToolchain } from '../utils/backend-toolchains.js'
import { RUNTIMES } from '../utils/runtimes.js'
import { ensurePython, ensureVenv } from '../utils/python-setup.js'
import { ensureEnvFile } from '../utils/env-file.js'
import { healBackendGitignore } from '../utils/gitignore.js'
import { runStep } from '../utils/steps.js'
import { log } from '../utils/logger.js'

interface BackendProject {
  dir: string
  framework: BackendFramework
  toolchain: BackendToolchain
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
  return { dir: getBackendDir(root), framework, toolchain: BACKEND_TOOLCHAINS[framework] }
}

/**
 * Stop a Python-only subcommand from running against a backend on another
 * runtime. Without this the venv step would silently create a `venv/`
 * directory inside a Node project.
 */
function rejectUnlessPython(project: BackendProject, command: string): void {
  if (project.toolchain.runtime === 'python') return
  log.error(`"${command}" applies to Python backends. This project uses ${project.toolchain.label}.`)
  log.step(`Run "blacksmith setup:backend" to set up the ${project.toolchain.label} backend instead.`)
  process.exit(1)
}

export async function setupBackendPython() {
  // Installing Python needs no project — this is the one backend subcommand a
  // user can run on a bare machine before `init`. Only reject when there IS a
  // project and it runs on something else.
  const project = findBackendProject()
  if (project) rejectUnlessPython(project, 'setup:backend python')

  await ensurePython()
}

export async function setupBackendVenv() {
  const project = ensureBackendProject()
  rejectUnlessPython(project, 'setup:backend venv')

  healBackendGitignore(project.dir, project.framework)
  await ensureVenv(project.dir)
}

/** Install the backend's dependencies and apply its committed migrations. */
export async function setupBackendDeps() {
  const project = ensureBackendProject()
  const runtime = RUNTIMES[project.toolchain.runtime]

  healBackendGitignore(project.dir, project.framework)

  const notReady = runtime.notReady(project.dir)
  if (notReady) {
    log.error(notReady)
    process.exit(1)
  }

  // Settings read the environment, and .env is gitignored — restore it for a
  // cloned checkout rather than silently falling back to the defaults.
  if (ensureEnvFile(project.dir)) {
    log.step('Created backend/.env from .env.example')
  }

  await runStep(runtime.installDependencies, project.dir)
  await runStep(project.toolchain.migrate, project.dir)
}

export async function setupBackend() {
  log.info('Setting up backend project...')
  log.blank()

  const project = ensureBackendProject()

  healBackendGitignore(project.dir, project.framework)
  await RUNTIMES[project.toolchain.runtime].prepare(project.dir)
  log.blank()

  await setupBackendDeps()
  log.blank()

  log.success('Backend setup complete! Run "blacksmith dev" to start the server.')
}
