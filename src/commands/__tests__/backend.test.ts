import { describe, it, expect, vi } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  execPython: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { backend } from '../backend.js'
import { log } from '../../utils/logger.js'

describe('backend', () => {
  it('should run Django management command with arguments', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    execMocks.execPython.mockResolvedValue({})

    await backend(['createsuperuser'])

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'createsuperuser'],
      '/project/backend'
    )
  })

  it('should pass multiple arguments through', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    execMocks.execPython.mockResolvedValue({})

    await backend(['migrate', '--run-syncdb'])

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'migrate', '--run-syncdb'],
      '/project/backend'
    )
  })

  it('should exit with error when no args provided', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')

    await expect(backend([])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Please provide a Django management command.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(backend(['migrate'])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalled()
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when Python command fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    execMocks.execPython.mockRejectedValue(new Error('Command failed'))

    await expect(backend(['bad-command'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
