import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  getTemplatesDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const templateMocks = vi.hoisted(() => ({
  renderDirectory: vi.fn(),
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

  it('should exit when project directory already exists', async () => {
    fs.mkdirSync(path.join(tmpDir, 'existing'))
    execMocks.commandExists.mockResolvedValue(true)

    await expect(
      init('existing', {
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

  it('should install Python dependencies and run migrations', async () => {
    setupSuccessfulInit()

    await init('my-app', {
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
