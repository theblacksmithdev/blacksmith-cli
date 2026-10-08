import { describe, it, expect, vi } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
  getFrontendDir: vi.fn(),
  hasBackend: vi.fn(() => true),
  hasFrontend: vi.fn(() => true),
  getBackendFramework: vi.fn(() => 'django'),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { build } from '../build.js'
import { log } from '../../utils/logger.js'

describe('build', () => {
  it('should build frontend and collect static files', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})

    await build()

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'build'], {
      cwd: '/project/frontend',
      silent: true,
    })
    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'collectstatic', '--noinput'],
      '/project/backend',
      true
    )
    expect(log.success).toHaveBeenCalledWith('Production build complete!')
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when frontend build fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    execMocks.exec.mockRejectedValue(new Error('Build failed'))

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when collectstatic fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockRejectedValue(new Error('collectstatic failed'))

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should compile an Express backend instead of collecting static files', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    pathMocks.getBackendFramework.mockReturnValue('express')
    execMocks.exec.mockResolvedValue({})

    await build()

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'build'], {
      cwd: '/project/backend',
      silent: true,
    })
    expect(execMocks.execPython).not.toHaveBeenCalled()
  })

  it('skips the backend step for a FastAPI project, which has nothing to build', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    pathMocks.getBackendFramework.mockReturnValue('fastapi')
    execMocks.exec.mockResolvedValue({})

    await build()

    // The frontend still builds; the backend runs neither npm nor manage.py
    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'build'], {
      cwd: '/project/frontend',
      silent: true,
    })
    expect(execMocks.execPython).not.toHaveBeenCalled()
    expect(log.step).toHaveBeenCalledWith(
      'FastAPI backend needs no build step — app/ runs from source.'
    )
    expect(log.success).toHaveBeenCalledWith('Production build complete!')
  })
})
