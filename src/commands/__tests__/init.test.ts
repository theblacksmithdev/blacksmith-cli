import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  getBackendFramework: vi.fn(() => 'django'),
  getTemplatesDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const templateMocks = vi.hoisted(() => ({
  renderDirectory: vi.fn(),
  renderToFile: vi.fn(),
}))
vi.mock('../../utils/template.js', () => templateMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
  execPip: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

vi.mock('../ai-setup.js', () => ({
  setupAiDev: vi.fn(),
}))

vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    pid: 12345,
    unref: vi.fn(),
  })),
}))

import { init } from '../init.js'
import { log } from '../../utils/logger.js'

/** The real templates directory, so .gitignore generation runs against real files */
const REAL_TEMPLATES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'templates'
)

describe('init', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    origCwd = process.cwd()
    process.chdir(tmpDir)
  })

  afterEach(() => {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  /** Helper: set up mocks for a successful init run */
  function setupSuccessfulInit() {
    pathMocks.getTemplatesDir.mockReturnValue('/templates')
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})
    execMocks.execPip.mockResolvedValue({})

    templateMocks.renderDirectory.mockImplementation((src: string, dest: string) => {
      fs.mkdirSync(dest, { recursive: true })
      if (src.includes('backend')) {
        fs.writeFileSync(path.join(dest, '.env.example'), 'SECRET_KEY=test')
      }
    })
  }

  it('should create project directory and config file', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const projectDir = path.join(tmpDir, 'my-app')
    expect(fs.existsSync(projectDir)).toBe(true)

    const config = JSON.parse(
      fs.readFileSync(path.join(projectDir, 'blacksmith.config.json'), 'utf-8')
    )
    expect(config.name).toBe('my-app')
    expect(config.backend.port).toBe(8000)
    expect(config.frontend.port).toBe(5173)
  })

  it('should write .gitignore files that ignore venv and node_modules', async () => {
    setupSuccessfulInit()
    pathMocks.getTemplatesDir.mockReturnValue(REAL_TEMPLATES_DIR)

    await init('my-app', {
      type: 'fullstack',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const projectDir = path.join(tmpDir, 'my-app')

    const root = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf-8')
    expect(root).toMatch(/^backend\/venv\/$/m)
    expect(root).toMatch(/^frontend\/node_modules\/$/m)

    const backend = fs.readFileSync(path.join(projectDir, 'backend', '.gitignore'), 'utf-8')
    expect(backend).toMatch(/^venv\/$/m)

    const frontend = fs.readFileSync(path.join(projectDir, 'frontend', '.gitignore'), 'utf-8')
    expect(frontend).toMatch(/^node_modules\/$/m)
  })

  it('should not write a root .gitignore for single-stack projects', async () => {
    setupSuccessfulInit()
    pathMocks.getTemplatesDir.mockReturnValue(REAL_TEMPLATES_DIR)

    await init('api-only', { type: 'backend', backendPort: '8000', ai: false })

    // The backend template renders into the project root, so its own .gitignore
    // lands there — the project-level one would shadow it.
    const projectDir = path.join(tmpDir, 'api-only')
    const content = fs.readFileSync(path.join(projectDir, '.gitignore'), 'utf-8')
    expect(content).toMatch(/^venv\/$/m)
    expect(content).not.toMatch(/^backend\/venv\/$/m)
  })

  it('should exit when project directory already exists', async () => {
    fs.mkdirSync(path.join(tmpDir, 'existing'))
    execMocks.commandExists.mockResolvedValue(true)

    await expect(
      init('existing', {
        type: 'fullstack',
        backendPort: '8000',
        frontendPort: '5173',
        themeColor: 'default',
        ai: false,
      })
    ).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith('Directory "existing" already exists.')
  })

  it('should exit when Python is not installed', async () => {
    execMocks.commandExists.mockImplementation(async (cmd: string) => {
      if (cmd === 'python3') return false
      return true
    })

    await expect(
      init('new-app', {
        type: 'fullstack',
        backendPort: '8000',
        frontendPort: '5173',
        themeColor: 'default',
        ai: false,
      })
    ).rejects.toThrow('process.exit called')

    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit with invalid port', async () => {
    execMocks.commandExists.mockResolvedValue(true)

    await expect(
      init('new-app', {
        type: 'fullstack',
        backendPort: '99999',
        frontendPort: '5173',
        themeColor: 'default',
        ai: false,
      })
    ).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith('Invalid backend port: 99999')
  })

  it('should render backend and frontend templates', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'blue',
      ai: false,
    })

    const calls = templateMocks.renderDirectory.mock.calls
    const backendCall = calls.find((c: any[]) => c[0] === '/templates/backend')
    expect(backendCall).toBeDefined()
    expect(backendCall![2]).toMatchObject({
      projectName: 'my-app',
      backendPort: 8000,
      frontendPort: 5173,
      themePreset: 'blue',
    })

    const frontendCall = calls.find((c: any[]) => c[0] === '/templates/frontend')
    expect(frontendCall).toBeDefined()
    expect(frontendCall![2]).toMatchObject({ projectName: 'my-app' })
  })

  it('should record the backend framework in the config', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backend: 'express',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const config = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'my-app', 'blacksmith.config.json'), 'utf-8')
    )
    expect(config.backend.framework).toBe('express')
  })

  it('should default the backend framework to django', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'backend', backendPort: '8000', ai: false })

    const config = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'my-app', 'blacksmith.config.json'), 'utf-8')
    )
    expect(config.backend.framework).toBe('django')
  })

  it('should exit on an unknown backend framework', async () => {
    execMocks.commandExists.mockResolvedValue(true)

    await expect(
      init('my-app', { type: 'backend', backend: 'fastify', backendPort: '8000', ai: false })
    ).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'Invalid backend framework: "fastify". Must be one of: django, express'
    )
  })

  it('should render the Express backend templates for an express project', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backend: 'express',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const calls = templateMocks.renderDirectory.mock.calls
    expect(calls.find((c: any[]) => c[0] === '/templates/backend-express')).toBeDefined()
    expect(calls.find((c: any[]) => c[0] === '/templates/backend')).toBeUndefined()
  })

  it('should not require Python for an Express backend', async () => {
    setupSuccessfulInit()
    execMocks.commandExists.mockImplementation(async (cmd: string) => cmd !== 'python3')

    await init('my-app', { type: 'backend', backend: 'express', backendPort: '8000', ai: false })

    expect(mockExit).not.toHaveBeenCalled()
  })

  it('should install npm dependencies and migrate with Prisma for an Express backend', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'backend', backend: 'express', backendPort: '8000', ai: false })

    const backendDir = path.join(fs.realpathSync(tmpDir), 'my-app')

    expect(execMocks.exec).toHaveBeenCalledWith(
      'npm',
      ['install'],
      { cwd: backendDir, silent: true }
    )
    expect(execMocks.exec).toHaveBeenCalledWith(
      'npx',
      ['prisma', 'generate'],
      { cwd: backendDir, silent: true }
    )
    expect(execMocks.exec).toHaveBeenCalledWith(
      'npx',
      ['prisma', 'migrate', 'dev', '--name', 'init', '--skip-seed'],
      { cwd: backendDir, silent: true }
    )
    // No Python toolchain is touched
    expect(execMocks.execPip).not.toHaveBeenCalled()
    expect(execMocks.execPython).not.toHaveBeenCalled()
  })

  it('should write an Express .gitignore that ignores node_modules and the database', async () => {
    setupSuccessfulInit()
    pathMocks.getTemplatesDir.mockReturnValue(REAL_TEMPLATES_DIR)

    await init('api-only', { type: 'backend', backend: 'express', backendPort: '8000', ai: false })

    const content = fs.readFileSync(
      path.join(tmpDir, 'api-only', '.gitignore'),
      'utf-8'
    )
    expect(content).toMatch(/^node_modules\/$/m)
    expect(content).toMatch(/^prisma\/\*\.db$/m)
    expect(content).not.toMatch(/^venv\/$/m)
  })

  it('should install Python dependencies and run migrations', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const realTmpDir = fs.realpathSync(tmpDir)
    const backendDir = path.join(realTmpDir, 'my-app', 'backend')

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

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'makemigrations', 'users'],
      backendDir,
      true
    )
    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'migrate'],
      backendDir,
      true
    )
  })
})
