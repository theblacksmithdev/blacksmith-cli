import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const fsMocks = vi.hoisted(() => ({ existsSync: vi.fn(() => true) }))
vi.mock('node:fs', () => ({ default: fsMocks, existsSync: fsMocks.existsSync }))

const pathMocks = vi.hoisted(() => ({
  getBackendFramework: vi.fn(() => 'django'),
  findProjectRoot: vi.fn(() => '/project'),
  getBackendDir: vi.fn(() => '/project/backend'),
  getFrontendDir: vi.fn(() => '/project/frontend'),
  hasBackend: vi.fn(() => true),
  hasFrontend: vi.fn(() => true),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { test as runTests } from '../test.js'
import { log } from '../../utils/logger.js'

describe('blacksmith test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fsMocks.existsSync.mockReturnValue(true)
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasBackend.mockReturnValue(true)
    pathMocks.hasFrontend.mockReturnValue(true)
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})
  })

  it('runs both suites by default on a fullstack project', async () => {
    await runTests({})

    expect(execMocks.execPython).toHaveBeenCalledWith(['-m', 'pytest'], '/project/backend')
    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test'], {
      cwd: '/project/frontend',
    })
    expect(log.success).toHaveBeenCalledWith('All tests passed.')
  })

  it('runs only the backend with --backend', async () => {
    await runTests({ backend: true })

    expect(execMocks.execPython).toHaveBeenCalled()
    expect(execMocks.exec).not.toHaveBeenCalled()
  })

  it('runs only the frontend with --frontend', async () => {
    await runTests({ frontend: true })

    expect(execMocks.execPython).not.toHaveBeenCalled()
    expect(execMocks.exec).toHaveBeenCalled()
  })

  it('skips the backend on a frontend-only project', async () => {
    pathMocks.hasBackend.mockReturnValue(false)

    await runTests({})

    expect(execMocks.execPython).not.toHaveBeenCalled()
    expect(execMocks.exec).toHaveBeenCalled()
  })

  it('passes coverage flags through to pytest', async () => {
    await runTests({ backend: true, coverage: true })

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['-m', 'pytest', '--cov', '--cov-report=term-missing'],
      '/project/backend'
    )
  })

  it('uses the coverage script for the frontend', async () => {
    await runTests({ frontend: true, coverage: true })

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test:coverage'], {
      cwd: '/project/frontend',
    })
  })

  it('uses the watch script for the frontend', async () => {
    await runTests({ frontend: true, watch: true })

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test:watch'], {
      cwd: '/project/frontend',
    })
  })

  it('refuses to watch both suites at once', async () => {
    await expect(runTests({ watch: true })).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      '--watch runs a single suite. Add --frontend (or --backend) to choose one.'
    )
  })

  it('exits non-zero when a suite fails', async () => {
    execMocks.execPython.mockRejectedValue(new Error('pytest failed'))

    await expect(runTests({})).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith('Tests failed: backend')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('reports both suites when both fail', async () => {
    execMocks.execPython.mockRejectedValue(new Error('pytest failed'))
    execMocks.exec.mockRejectedValue(new Error('vitest failed'))

    await expect(runTests({})).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith('Tests failed: backend, frontend')
  })

  it('tells the user to run setup when the venv is missing', async () => {
    fsMocks.existsSync.mockReturnValue(false)

    await expect(runTests({ backend: true })).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'Virtual environment not found. Run "blacksmith setup:backend" first.'
    )
  })

  it('tells the user to run setup when node_modules is missing', async () => {
    fsMocks.existsSync.mockReturnValue(false)

    await expect(runTests({ frontend: true })).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'Dependencies not installed. Run "blacksmith setup:frontend" first.'
    )
  })

  it('errors when --backend is used on a frontend-only project', async () => {
    pathMocks.hasBackend.mockReturnValue(false)

    await expect(runTests({ backend: true })).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'This is a frontend-only project. There is no backend to test.'
    )
  })

  it('errors outside a Blacksmith project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error('not found')
    })

    await expect(runTests({})).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'Not inside a Blacksmith project. Run "blacksmith init <name>" first.'
    )
  })

  it('runs vitest for an Express backend, not pytest', async () => {
    pathMocks.getBackendFramework.mockReturnValue('express')
    pathMocks.hasFrontend.mockReturnValue(false)

    await runTests({})

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test'], {
      cwd: '/project/backend',
    })
    expect(execMocks.execPython).not.toHaveBeenCalled()
  })

  it('passes coverage through to the Express backend script', async () => {
    pathMocks.getBackendFramework.mockReturnValue('express')
    pathMocks.hasFrontend.mockReturnValue(false)

    await runTests({ coverage: true })

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test:coverage'], {
      cwd: '/project/backend',
    })
  })

  it('tells the user to run setup when the Express backend has no node_modules', async () => {
    pathMocks.getBackendFramework.mockReturnValue('express')
    pathMocks.hasFrontend.mockReturnValue(false)
    fsMocks.existsSync.mockReturnValue(false)

    await expect(runTests({})).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledWith(
      'Dependencies not installed. Run "blacksmith setup:backend" first.'
    )
  })
})
