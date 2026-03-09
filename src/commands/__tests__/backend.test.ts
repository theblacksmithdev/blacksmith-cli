import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    blank: vi.fn(),
  },
}))

const mockFindProjectRoot = vi.fn()
const mockGetBackendDir = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  getBackendDir: (...args: any[]) => mockGetBackendDir(...args),
}))

const mockExecPython = vi.fn()
vi.mock('../../utils/exec.js', () => ({
  execPython: (...args: any[]) => mockExecPython(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { backend } from '../backend.js'
import { log } from '../../utils/logger.js'

describe('backend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run Django management command with arguments', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockExecPython.mockResolvedValue({})

    await backend(['createsuperuser'])

    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'createsuperuser'],
      '/project/backend'
    )
  })

  it('should pass multiple arguments through', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockExecPython.mockResolvedValue({})

    await backend(['migrate', '--run-syncdb'])

    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'migrate', '--run-syncdb'],
      '/project/backend'
    )
  })

  it('should exit with error when no args provided', async () => {
    mockFindProjectRoot.mockReturnValue('/project')

    await expect(backend([])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Please provide a Django management command.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(backend(['migrate'])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalled()
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when Python command fails', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockExecPython.mockRejectedValue(new Error('Command failed'))

    await expect(backend(['bad-command'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
