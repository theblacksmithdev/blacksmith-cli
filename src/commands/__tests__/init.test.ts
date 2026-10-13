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
  getFrontendFramework: vi.fn(() => 'react'),
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
  execGradle: vi.fn(),
  execPip: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

vi.mock('../ai-setup.js', () => ({
  setupAiDev: vi.fn(),
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
    const backendCall = calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'django'))
    expect(backendCall).toBeDefined()
    expect(backendCall![2]).toMatchObject({
      projectName: 'my-app',
      backendPort: 8000,
      frontendPort: 5173,
      themePreset: 'blue',
    })

    const commonCall = calls.find((c: any[]) => c[0] === path.join('/templates', 'frontend', 'common'))
    expect(commonCall).toBeDefined()
    const frontendCall = calls.find((c: any[]) => c[0] === path.join('/templates', 'frontend', 'react'))
    expect(frontendCall).toBeDefined()
    expect(frontendCall![2]).toMatchObject({ projectName: 'my-app' })
  })

  it('derives a domain-safe name for placeholder addresses', async () => {
    setupSuccessfulInit()

    await init('My_Cool App', {
      type: 'fullstack',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const frontendCall = templateMocks.renderDirectory.mock.calls.find(
      (c: any[]) => c[0] === path.join('/templates', 'frontend', 'react')
    )
    expect(frontendCall![2]).toMatchObject({ projectDomain: 'my-cool-app' })
  })

  it('syncs a Django fullstack project offline, without starting a server', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'fullstack', backend: 'django', backendPort: '8000', frontendPort: '5173', ai: false })

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'spectacular', '--file', expect.stringContaining('_schema.yml')],
      expect.any(String),
      true
    )
    expect(execMocks.execPython).not.toHaveBeenCalledWith(
      expect.arrayContaining(['runserver']),
      expect.anything(),
      expect.anything()
    )
  })

  it('checks Node once for an Express fullstack project, and never Python', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'fullstack', backend: 'express', backendPort: '8000', frontendPort: '5173', ai: false })

    const checked = execMocks.commandExists.mock.calls.map((c: any[]) => c[0])
    expect(checked).toEqual(['node', 'npm'])
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
      'Invalid backend framework: "fastify". Must be one of: django, express, fastapi, spring'
    )
  })

  describe('on a Spring Boot backend', () => {
    /** A JDK of `version` on PATH, and templates that ship the Gradle wrapper. */
    function setupSpringInit(version = '21.0.2') {
      setupSuccessfulInit()
      execMocks.execGradle.mockResolvedValue({})
      execMocks.exec.mockImplementation(async (command: string) =>
        command === 'java' ? { stderr: `openjdk version "${version}" 2024-01-16` } : {})
      templateMocks.renderDirectory.mockImplementation((src: string, dest: string) => {
        fs.mkdirSync(dest, { recursive: true })
        if (src.includes('spring')) fs.writeFileSync(path.join(dest, 'gradlew'), '#!/bin/sh\n')
      })
    }

    it('compiles through the Gradle wrapper and runs no migration step', async () => {
      setupSpringInit()

      await init('my-app', { type: 'backend', backend: 'spring', backendPort: '8000', ai: false })

      const backendDir = path.join(fs.realpathSync(tmpDir), 'my-app')
      expect(execMocks.execGradle).toHaveBeenCalledWith(['classes', '--console=plain'], backendDir, true)
      // The wrapper is made executable whatever the copied template kept
      expect(fs.statSync(path.join(backendDir, 'gradlew')).mode & 0o111).not.toBe(0)
      // Flyway migrates as the application starts; no Python or Node steps run
      expect(execMocks.execPython).not.toHaveBeenCalled()
      expect(execMocks.execPip).not.toHaveBeenCalled()
      expect(execMocks.exec).not.toHaveBeenCalledWith('npm', expect.anything(), expect.anything())
    })

    it('refuses a JDK older than 17', async () => {
      setupSpringInit('11.0.20')

      await expect(
        init('my-app', { type: 'backend', backend: 'spring', backendPort: '8000', ai: false })
      ).rejects.toThrow('process.exit called')
    })

    it('needs Java and Node, but never Python, for a fullstack project', async () => {
      setupSpringInit()

      await init('my-app', {
        type: 'fullstack', backend: 'spring', backendPort: '8000', frontendPort: '5173', ai: false,
      })

      const checked = execMocks.commandExists.mock.calls.map((c: any[]) => c[0])
      expect(checked).toEqual(['node', 'npm'])
      expect(execMocks.exec).toHaveBeenCalledWith('java', ['-version'], { silent: true })
    })
  })

  it('should record fastapi as the backend framework in the config', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'backend', backend: 'fastapi', backendPort: '8000', ai: false })

    const config = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'my-app', 'blacksmith.config.json'), 'utf-8')
    )
    expect(config.backend.framework).toBe('fastapi')
  })

  it('should render the FastAPI backend templates for a fastapi project', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'fullstack',
      backend: 'fastapi',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const calls = templateMocks.renderDirectory.mock.calls
    expect(calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'fastapi'))).toBeDefined()
    expect(calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'django'))).toBeUndefined()
    expect(calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'express'))).toBeUndefined()
  })

  it('should install Python dependencies and run Alembic migrations for a FastAPI backend', async () => {
    setupSuccessfulInit()

    await init('my-app', { type: 'backend', backend: 'fastapi', backendPort: '8000', ai: false })

    const realTmpDir = fs.realpathSync(tmpDir)
    const backendDir = path.join(realTmpDir, 'my-app')

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
      ['-m', 'alembic', 'upgrade', 'head'],
      backendDir,
      true
    )

    // No Node.js or Django steps are attempted
    expect(execMocks.exec).not.toHaveBeenCalledWith('npm', expect.anything(), expect.anything())
    expect(execMocks.exec).not.toHaveBeenCalledWith('npx', expect.anything(), expect.anything())
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
  })

  it('should require Python but not Node for a FastAPI backend', async () => {
    setupSuccessfulInit()
    execMocks.commandExists.mockImplementation(async (cmd: string) => cmd !== 'node' && cmd !== 'npm')

    await init('my-app', { type: 'backend', backend: 'fastapi', backendPort: '8000', ai: false })

    expect(mockExit).not.toHaveBeenCalled()
  })

  it('should write a FastAPI .gitignore that ignores venv and the database', async () => {
    setupSuccessfulInit()
    pathMocks.getTemplatesDir.mockReturnValue(REAL_TEMPLATES_DIR)

    await init('api-only', { type: 'backend', backend: 'fastapi', backendPort: '8000', ai: false })

    const content = fs.readFileSync(
      path.join(tmpDir, 'api-only', '.gitignore'),
      'utf-8'
    )
    expect(content).toMatch(/^venv\/$/m)
    expect(content).toMatch(/^db\.sqlite3$/m)
    expect(content).not.toMatch(/^node_modules\/$/m)
    expect(content).not.toMatch(/^backend\/venv\/$/m)
  })

  it('should ignore a fastapi backend choice on a frontend-only project', async () => {
    setupSuccessfulInit()

    await init('my-app', {
      type: 'frontend',
      backend: 'fastapi',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    expect(mockExit).not.toHaveBeenCalled()
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
    expect(calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'express'))).toBeDefined()
    expect(calls.find((c: any[]) => c[0] === path.join('/templates', 'backend', 'django'))).toBeUndefined()
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
