import { describe, it, expect, vi } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn(() => true),
}))
vi.mock('node:fs', () => ({ default: fsMocks }))

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
  hasBackend: vi.fn(() => true),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPip: vi.fn(),
  execPython: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import {
  setupBackend,
  setupBackendPython,
  setupBackendVenv,
  setupBackendDeps,
} from '../setup-backend.js'
import { log, spinner } from '../../utils/logger.js'

describe('setupBackendPython', () => {
  it('should report success when Python is already installed', async () => {
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({ stdout: 'Python 3.12.0' })

    await setupBackendPython()

    expect(log.success).toHaveBeenCalledWith('Python 3 is already installed')
  })

  it('should attempt brew install on macOS when Python is missing', async () => {
    execMocks.commandExists
      .mockResolvedValueOnce(false) // python3
      .mockResolvedValueOnce(true)  // brew

    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    execMocks.exec.mockResolvedValue({})

    await setupBackendPython()

    expect(execMocks.exec).toHaveBeenCalledWith('brew', ['install', 'python3'], { silent: false })

    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  it('should exit when no brew on macOS', async () => {
    execMocks.commandExists
      .mockResolvedValueOnce(false) // python3
      .mockResolvedValueOnce(false) // brew

    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    await expect(setupBackendPython()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)

    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })
})

describe('setupBackendVenv', () => {
  it('should create a virtual environment', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(false) // venv doesn't exist
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({})

    await setupBackendVenv()

    expect(execMocks.exec).toHaveBeenCalledWith(
      'python3',
      ['-m', 'venv', 'venv'],
      { cwd: '/project/backend', silent: true }
    )
  })

  it('should skip when venv already exists', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(true)

    await setupBackendVenv()

    expect(log.success).toHaveBeenCalledWith('Virtual environment already exists')
    expect(execMocks.exec).not.toHaveBeenCalled()
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setupBackendVenv()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when project has no backend', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasBackend.mockReturnValue(false)

    await expect(setupBackendVenv()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('This is a frontend-only project. No backend to set up.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when Python is not installed', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(false)
    execMocks.commandExists.mockResolvedValue(false)

    await expect(setupBackendVenv()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when venv creation fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(false)
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockRejectedValue(new Error('venv failed'))

    await expect(setupBackendVenv()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('setupBackendDeps', () => {
  it('should install dependencies and run migrations', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(true) // venv and requirements.txt exist
    execMocks.execPip.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})

    await setupBackendDeps()

    expect(execMocks.execPip).toHaveBeenCalledWith(
      ['install', '-r', 'requirements.txt'],
      '/project/backend',
      true
    )
    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'migrate'],
      '/project/backend',
      true
    )
  })

  it('should exit when venv does not exist', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValueOnce(false) // venv missing

    await expect(setupBackendDeps()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith(
      'Virtual environment not found. Run "blacksmith setup:backend venv" first.'
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when requirements.txt is missing', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync
      .mockReturnValueOnce(true)  // venv exists
      .mockReturnValueOnce(false) // requirements.txt missing

    await expect(setupBackendDeps()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('requirements.txt not found in backend directory.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when pip install fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(true)
    execMocks.execPip.mockRejectedValue(new Error('pip failed'))

    await expect(setupBackendDeps()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when migrations fail', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(true)
    execMocks.execPip.mockResolvedValue({})
    execMocks.execPython.mockRejectedValue(new Error('migrate failed'))

    await expect(setupBackendDeps()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('setupBackend', () => {
  it('should run all setup steps in sequence', async () => {
    // Mock for setupBackendPython - python already installed
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({ stdout: 'Python 3.12.0' })

    // Mock for setupBackendVenv - venv already exists
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    fsMocks.existsSync.mockReturnValue(true)

    // Mock for setupBackendDeps
    execMocks.execPip.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})

    await setupBackend()

    expect(log.success).toHaveBeenCalledWith(
      'Backend setup complete! Run "blacksmith dev" to start the server.'
    )
  })
})
