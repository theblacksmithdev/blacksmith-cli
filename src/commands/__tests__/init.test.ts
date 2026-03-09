import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

vi.mock('../../utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    blank: vi.fn(),
  },
  spinner: vi.fn(() => ({
    succeed: vi.fn(),
    fail: vi.fn(),
    warn: vi.fn(),
  })),
  printNextSteps: vi.fn(),
  promptText: vi.fn(),
  promptYesNo: vi.fn(),
  promptSelect: vi.fn(),
  printConfig: vi.fn(),
}))

const mockGetTemplatesDir = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  getTemplatesDir: (...args: any[]) => mockGetTemplatesDir(...args),
}))

const mockRenderDirectory = vi.fn()
vi.mock('../../utils/template.js', () => ({
  renderDirectory: (...args: any[]) => mockRenderDirectory(...args),
}))

const mockExec = vi.fn()
const mockExecPython = vi.fn()
const mockExecPip = vi.fn()
const mockCommandExists = vi.fn()
vi.mock('../../utils/exec.js', () => ({
  exec: (...args: any[]) => mockExec(...args),
  execPython: (...args: any[]) => mockExecPython(...args),
  execPip: (...args: any[]) => mockExecPip(...args),
  commandExists: (...args: any[]) => mockCommandExists(...args),
}))

vi.mock('../ai-setup.js', () => ({
  setupAiDev: vi.fn(),
}))

// Mock child_process.spawn for the Django server
vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    pid: 12345,
    unref: vi.fn(),
  })),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { init } from '../init.js'
import { log } from '../../utils/logger.js'

describe('init', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    origCwd = process.cwd()
    process.chdir(tmpDir)
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should create project directory and config file', async () => {
    mockGetTemplatesDir.mockReturnValue('/templates')
    mockCommandExists.mockResolvedValue(true)
    mockExec.mockResolvedValue({})
    mockExecPython.mockResolvedValue({})
    mockExecPip.mockResolvedValue({})

    // Mock renderDirectory to create the .env.example file it expects
    mockRenderDirectory.mockImplementation((src: string, dest: string) => {
      fs.mkdirSync(dest, { recursive: true })
      if (src.includes('backend')) {
        fs.writeFileSync(path.join(dest, '.env.example'), 'SECRET_KEY=test')
      }
    })

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
    mockCommandExists.mockResolvedValue(true)

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
    mockCommandExists.mockImplementation(async (cmd: string) => {
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
    mockCommandExists.mockResolvedValue(true)

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
    mockGetTemplatesDir.mockReturnValue('/templates')
    mockCommandExists.mockResolvedValue(true)
    mockExec.mockResolvedValue({})
    mockExecPython.mockResolvedValue({})
    mockExecPip.mockResolvedValue({})

    mockRenderDirectory.mockImplementation((src: string, dest: string) => {
      fs.mkdirSync(dest, { recursive: true })
      if (src.includes('backend')) {
        fs.writeFileSync(path.join(dest, '.env.example'), 'SECRET_KEY=test')
      }
    })

    await init('my-app', {
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'blue',
      ai: false,
    })

    // Backend template rendered
    const calls = mockRenderDirectory.mock.calls
    const backendCall = calls.find((c: any[]) => c[0] === '/templates/backend')
    expect(backendCall).toBeDefined()
    expect(backendCall![2]).toMatchObject({
      projectName: 'my-app',
      backendPort: 8000,
      frontendPort: 5173,
      themePreset: 'blue',
    })

    // Frontend template rendered
    const frontendCall = calls.find((c: any[]) => c[0] === '/templates/frontend')
    expect(frontendCall).toBeDefined()
    expect(frontendCall![2]).toMatchObject({ projectName: 'my-app' })
  })

  it('should install Python dependencies and run migrations', async () => {
    mockGetTemplatesDir.mockReturnValue('/templates')
    mockCommandExists.mockResolvedValue(true)
    mockExec.mockResolvedValue({})
    mockExecPython.mockResolvedValue({})
    mockExecPip.mockResolvedValue({})

    mockRenderDirectory.mockImplementation((src: string, dest: string) => {
      fs.mkdirSync(dest, { recursive: true })
      if (src.includes('backend')) {
        fs.writeFileSync(path.join(dest, '.env.example'), 'SECRET_KEY=test')
      }
    })

    await init('my-app', {
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    // Venv created — use fs.realpathSync to handle macOS /private/var symlink
    const realTmpDir = fs.realpathSync(tmpDir)
    const backendDir = path.join(realTmpDir, 'my-app', 'backend')

    expect(mockExec).toHaveBeenCalledWith(
      'python3',
      ['-m', 'venv', 'venv'],
      { cwd: backendDir, silent: true }
    )

    // Pip install
    expect(mockExecPip).toHaveBeenCalledWith(
      ['install', '-r', 'requirements.txt'],
      backendDir,
      true
    )

    // Migrations
    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'makemigrations', 'users'],
      backendDir,
      true
    )
    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'migrate'],
      backendDir,
      true
    )
  })
})
