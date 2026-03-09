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
const mockGetFrontendDir = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  getFrontendDir: (...args: any[]) => mockGetFrontendDir(...args),
}))

const mockExec = vi.fn()
vi.mock('../../utils/exec.js', () => ({
  exec: (...args: any[]) => mockExec(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { frontend } from '../frontend.js'
import { log } from '../../utils/logger.js'

describe('frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run npm command in frontend directory', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockExec.mockResolvedValue({})

    await frontend(['install', 'axios'])

    expect(mockExec).toHaveBeenCalledWith('npm', ['install', 'axios'], {
      cwd: '/project/frontend',
    })
  })

  it('should exit with error when no args provided', async () => {
    mockFindProjectRoot.mockReturnValue('/project')

    await expect(frontend([])).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Please provide an npm command.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(frontend(['install'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when npm command fails', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockExec.mockRejectedValue(new Error('npm failed'))

    await expect(frontend(['run', 'bad'])).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
