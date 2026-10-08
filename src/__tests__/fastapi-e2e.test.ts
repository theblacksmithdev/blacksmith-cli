/**
 * End-to-end proof that FastAPI is a first-class backend, not a decorative
 * option: these tests drive the real `init`, `dev`, `test`, and CI generation
 * code against the real templates, stubbing only process execution (venv,
 * pip, pytest, npm) so nothing actually installs or runs.
 *
 * Every stage goes through the CLI's real code paths — the real
 * `projectLayout`, the real Handlebars templates on disk, the real config
 * file on disk. If FastAPI support were removed from the CLI (the template
 * tree deleted, the framework option dropped, or any dispatch branch
 * collapsed into the Django or Express path), these tests fail: they are the
 * regression proof the earlier FastAPI tickets exist to pass.
 *
 * The per-command unit suites (`init.test.ts`, `dev.test.ts`, `test.test.ts`,
 * `ci-workflow.test.ts`) mock the plumbing and assert each branch in
 * isolation; this file asserts the whole chain hangs together.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import YAML from 'yaml'
import { createLoggerMock } from './helpers.js'

vi.mock('../utils/logger.js', () => createLoggerMock())

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
  execPip: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../utils/exec.js', () => execMocks)

const concurrentlyMocks = vi.hoisted(() => ({ default: vi.fn() }))
vi.mock('concurrently', () => concurrentlyMocks)

import { init } from '../commands/init.js'
import { dev } from '../commands/dev.js'
import { test as runTests } from '../commands/test.js'
import { log } from '../utils/logger.js'

describe('FastAPI support end to end', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-fastapi-e2e-'))
    origCwd = process.cwd()
    process.chdir(tmpDir)

    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})
    execMocks.execPip.mockResolvedValue({})
    concurrentlyMocks.default.mockReturnValue({ result: Promise.resolve() })
  })

  afterEach(() => {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  /**
   * Run the real `init` for a fullstack FastAPI project in the temp dir and
   * return the directories the real project layout produces.
   */
  async function scaffold() {
    await init('my-app', {
      type: 'fullstack',
      backend: 'fastapi',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const projectRoot = path.join(fs.realpathSync(tmpDir), 'my-app')
    return {
      projectRoot,
      backendDir: path.join(projectRoot, 'backend'),
      frontendDir: path.join(projectRoot, 'frontend'),
    }
  }

  it('scaffolds a runnable FastAPI project from the real templates', async () => {
    const { projectRoot, backendDir, frontendDir } = await scaffold()

    // The config records the framework every later command dispatches on
    const config = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'blacksmith.config.json'), 'utf-8')
    )
    expect(config.backend.framework).toBe('fastapi')

    // The real template tree landed on disk, not a mocked stand-in
    expect(fs.existsSync(path.join(backendDir, 'app', 'main.py'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, 'app', 'routers', 'auth.py'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, 'scripts.py'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, 'tests', 'test_auth.py'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, 'conftest.py'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, 'requirements.txt'))).toBe(true)
    expect(fs.existsSync(path.join(backendDir, '.env'))).toBe(true)

    // main.py is a real FastAPI app serving the same schema/docs URLs as the
    // Django and Express backends, so sync and the frontend client work as-is
    const main = fs.readFileSync(path.join(backendDir, 'app', 'main.py'), 'utf-8')
    expect(main).toContain('from fastapi import FastAPI')
    expect(main).toContain('openapi_url="/api/schema/"')
    expect(main).toContain('app.include_router(auth.router, prefix="/api/auth", tags=["auth"])')

    // The generated tests exercise the API, so `blacksmith test` has a real
    // suite to run against the generated app
    const tests = fs.readFileSync(path.join(backendDir, 'tests', 'test_auth.py'), 'utf-8')
    expect(tests).toContain('from fastapi.testclient import TestClient')

    // Nothing Django-shaped leaks into a FastAPI tree
    expect(fs.existsSync(path.join(backendDir, 'manage.py'))).toBe(false)

    // Install path: venv + pip + scripts.py init-db, never manage.py migrations
    expect(execMocks.exec).toHaveBeenCalledWith(
      'python3',
      ['-m', 'venv', 'venv'],
      { cwd: backendDir, silent: true }
    )
    expect(execMocks.execPip).toHaveBeenCalledWith(
      ['install', '-r', 'requirements.txt'],
      backendDir,
      true
    )
    expect(execMocks.execPython).toHaveBeenCalledWith(['scripts.py', 'init-db'], backendDir, true)
    expect(execMocks.execPython).not.toHaveBeenCalledWith(
      ['manage.py', 'makemigrations', 'users'],
      backendDir,
      true
    )
    expect(execMocks.execPython).not.toHaveBeenCalledWith(
      ['manage.py', 'migrate'],
      backendDir,
      true
    )

    // Fullstack scaffold runs the first OpenAPI sync through scripts.py
    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['scripts.py', 'export-openapi', path.join(frontendDir, '_schema.json')],
      backendDir,
      true
    )

    // And the CI workflow was generated at scaffold time
    expect(fs.existsSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'))).toBe(true)
  })

  it('dev starts the scaffolded FastAPI backend with uvicorn', async () => {
    const { projectRoot, backendDir } = await scaffold()
    process.chdir(projectRoot)

    await dev()

    const commands = concurrentlyMocks.default.mock.calls.at(-1)![0]
    const backendCmd = commands.find((c: any) => c.name === 'fastapi')
    expect(backendCmd).toBeDefined()
    expect(backendCmd.cwd).toBe(backendDir)
    expect(backendCmd.command).toContain('uvicorn')
    expect(backendCmd.command).toContain('app.main:app')

    // Port 8000 may be taken on the machine running the tests, so read the
    // port findAvailablePort actually resolved back out of the command
    const portMatch = backendCmd.command.match(/--port (\d+)/)
    expect(portMatch).not.toBeNull()

    // The framework choice is exclusive: no Django or Express process starts
    expect(commands.find((c: any) => c.name === 'django')).toBeUndefined()
    expect(commands.find((c: any) => c.name === 'express')).toBeUndefined()

    // The startup output names FastAPI, not Django
    expect(log.step).toHaveBeenCalledWith(expect.stringContaining('FastAPI'))

    // The OpenAPI sync watcher watches Python files and ignores the venv
    const watcher = commands.find((c: any) => c.name === 'sync')
    expect(watcher.command).toContain('.py')
    expect(watcher.command).toContain('venv/')
    expect(watcher.command).toContain('__pycache__')
  })

  it('test runs pytest for the scaffolded FastAPI backend', async () => {
    const { projectRoot, backendDir, frontendDir } = await scaffold()
    // The venv and node_modules only exist after setup has run; the generated
    // project itself ships with neither.
    fs.mkdirSync(path.join(backendDir, 'venv'))
    fs.mkdirSync(path.join(frontendDir, 'node_modules'))
    process.chdir(projectRoot)

    await runTests({})

    // The FastAPI backend runs its pytest suite through the project venv
    expect(execMocks.execPython).toHaveBeenCalledWith(['-m', 'pytest'], backendDir)
    // The frontend side is untouched by the backend framework choice
    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test'], { cwd: frontendDir })
    expect(log.success).toHaveBeenCalledWith('All tests passed.')
  })

  it('generates CI that runs pytest and exports the schema with scripts.py', async () => {
    const { projectRoot } = await scaffold()

    const ci = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8')
    const doc = YAML.parse(ci)

    expect(Object.keys(doc.jobs)).toEqual(['backend', 'frontend'])

    // The backend job is the Python/pytest one: no Node toolchain, no Django
    const backendSteps = doc.jobs.backend.steps
    const backendRuns = backendSteps.map((s: any) => s.run ?? '').join('\n')
    expect(doc.jobs.backend.name).toBe('Backend (pytest)')
    expect(backendRuns).toContain('pip install -r requirements.txt')
    expect(backendRuns).toContain('pytest --cov --cov-report=term-missing')
    expect(backendRuns).not.toContain('manage.py')
    expect(JSON.stringify(backendSteps)).not.toContain('setup-node')
    expect(JSON.stringify(backendSteps)).not.toContain('prisma')

    // The fullstack frontend job rebuilds the client from the FastAPI schema
    const frontendRuns = doc.jobs.frontend.steps.map((s: any) => s.run ?? '').join('\n')
    expect(frontendRuns).toContain('python scripts.py export-openapi ../frontend/_schema.json')
    expect(frontendRuns).toContain('npx openapi-ts --input _schema.json')
    expect(frontendRuns).not.toContain('spectacular')
  })
})
