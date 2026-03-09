import { describe, it, expect, vi } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getFrontendDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { frontend } from '../frontend.js'
import { log } from '../../utils/logger.js'

describe('frontend', () => {
  it('should run npm command in frontend directory', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    execMocks.exec.mockResolvedValue({})

    await frontend(['install', 'axios'])

    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['install', 'axios'], {
      cwd: '/project/frontend',
    })
  })

  it('should exit with error when no args provided', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')

    await expect(frontend([])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Please provide an npm command.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(frontend(['install'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when npm command fails', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    execMocks.exec.mockRejectedValue(new Error('npm failed'))

    await expect(frontend(['run', 'bad'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
