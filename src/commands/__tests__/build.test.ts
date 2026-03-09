import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies
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
}))

const mockFindProjectRoot = vi.fn()
const mockGetBackendDir = vi.fn()
const mockGetFrontendDir = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  getBackendDir: (...args: any[]) => mockGetBackendDir(...args),
  getFrontendDir: (...args: any[]) => mockGetFrontendDir(...args),
}))

const mockExec = vi.fn()
const mockExecPython = vi.fn()
vi.mock('../../utils/exec.js', () => ({
  exec: (...args: any[]) => mockExec(...args),
  execPython: (...args: any[]) => mockExecPython(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { build } from '../build.js'
import { log } from '../../utils/logger.js'

describe('build', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build frontend and collect static files', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockExec.mockResolvedValue({})
    mockExecPython.mockResolvedValue({})

    await build()

    expect(mockExec).toHaveBeenCalledWith('npm', ['run', 'build'], {
      cwd: '/project/frontend',
      silent: true,
    })
    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'collectstatic', '--noinput'],
      '/project/backend',
      true
    )
    expect(log.success).toHaveBeenCalledWith('Production build complete!')
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when frontend build fails', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockExec.mockRejectedValue(new Error('Build failed'))

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when collectstatic fails', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockExec.mockResolvedValue({})
    mockExecPython.mockRejectedValue(new Error('collectstatic failed'))

    await expect(build()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
