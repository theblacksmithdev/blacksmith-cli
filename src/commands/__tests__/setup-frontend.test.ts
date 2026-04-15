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
  getFrontendDir: vi.fn(),
  hasFrontend: vi.fn(() => true),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import {
  setupFrontend,
  setupFrontendNode,
  setupFrontendDeps,
} from '../setup-frontend.js'
import { log, spinner } from '../../utils/logger.js'

describe('setupFrontendNode', () => {
  it('should report success when Node.js and npm are already installed', async () => {
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({ stdout: 'v20.10.0' })

    await setupFrontendNode()

    expect(log.success).toHaveBeenCalledWith('Node.js and npm are already installed')
  })

  it('should attempt brew install on macOS when Node is missing', async () => {
    execMocks.commandExists
      .mockResolvedValueOnce(false) // node
      .mockResolvedValueOnce(false) // npm
      .mockResolvedValueOnce(true)  // brew

    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    execMocks.exec.mockResolvedValue({})

    await setupFrontendNode()

    expect(execMocks.exec).toHaveBeenCalledWith('brew', ['install', 'node'], { silent: false })

    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  it('should exit when no brew on macOS', async () => {
    execMocks.commandExists
      .mockResolvedValueOnce(false) // node
      .mockResolvedValueOnce(false) // npm
      .mockResolvedValueOnce(false) // brew

    const originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'darwin' })

    await expect(setupFrontendNode()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)

    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })
})

describe('setupFrontendDeps', () => {
  it('should install npm dependencies', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    fsMocks.existsSync.mockReturnValue(true)
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({})

    await setupFrontendDeps()

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['install'], {
      cwd: '/project/frontend',
      silent: true,
    })
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setupFrontendDeps()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when project has no frontend', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasFrontend.mockReturnValue(false)

    await expect(setupFrontendDeps()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith(
      'This is a backend-only project. No frontend to set up.'
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when package.json is missing', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    fsMocks.existsSync.mockReturnValue(false)

    await expect(setupFrontendDeps()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('package.json not found in frontend directory.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when Node.js is not installed', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    fsMocks.existsSync.mockReturnValue(true)
    execMocks.commandExists.mockResolvedValue(false)

    await expect(setupFrontendDeps()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when npm install fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    fsMocks.existsSync.mockReturnValue(true)
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockRejectedValue(new Error('npm install failed'))

    await expect(setupFrontendDeps()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('setupFrontend', () => {
  it('should run all setup steps in sequence', async () => {
    // Mock for setupFrontendNode - already installed
    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({ stdout: 'v20.10.0' })

    // Mock for setupFrontendDeps
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    fsMocks.existsSync.mockReturnValue(true)

    await setupFrontend()

    expect(log.success).toHaveBeenCalledWith(
      'Frontend setup complete! Run "blacksmith dev" to start the server.'
    )
  })
})
