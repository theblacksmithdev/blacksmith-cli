import { describe, it, expect, vi, beforeEach } from 'vitest'
import net from 'node:net'

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
const mockGetFrontendDir = vi.fn()
const mockLoadConfig = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  getBackendDir: (...args: any[]) => mockGetBackendDir(...args),
  getFrontendDir: (...args: any[]) => mockGetFrontendDir(...args),
  loadConfig: (...args: any[]) => mockLoadConfig(...args),
}))

const mockConcurrently = vi.fn()
vi.mock('concurrently', () => ({
  default: (...args: any[]) => mockConcurrently(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { dev } from '../dev.js'
import { log } from '../../utils/logger.js'

describe('dev', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(dev()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith(
      'Not inside a Blacksmith project. Run "blacksmith init <name>" first.'
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should start concurrent servers with correct config', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockGetBackendDir.mockReturnValue('/project/backend')
    mockGetFrontendDir.mockReturnValue('/project/frontend')
    mockLoadConfig.mockReturnValue({
      name: 'test',
      backend: { port: 8000 },
      frontend: { port: 5173 },
    })
    mockConcurrently.mockReturnValue({
      result: Promise.resolve(),
    })

    await dev()

    expect(mockConcurrently).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'django',
          cwd: '/project/backend',
        }),
        expect.objectContaining({
          name: 'vite',
          cwd: '/project/frontend',
        }),
        expect.objectContaining({
          name: 'sync',
        }),
      ]),
      expect.objectContaining({
        prefix: 'name',
        killOthers: ['failure'],
      })
    )
  })

  it('should find alternative port when configured port is in use', async () => {
    // Occupy a port
    const server = net.createServer()
    await new Promise<void>((resolve) => server.listen(8000, resolve))

    try {
      mockFindProjectRoot.mockReturnValue('/project')
      mockGetBackendDir.mockReturnValue('/project/backend')
      mockGetFrontendDir.mockReturnValue('/project/frontend')
      mockLoadConfig.mockReturnValue({
        name: 'test',
        backend: { port: 8000 },
        frontend: { port: 5173 },
      })
      mockConcurrently.mockReturnValue({
        result: Promise.resolve(),
      })

      await dev()

      // Should have logged that port was in use
      expect(log.step).toHaveBeenCalledWith(
        expect.stringContaining('Backend port 8000 in use')
      )

      // The concurrently command should use a different port
      const djangoCmd = mockConcurrently.mock.calls[0][0].find(
        (c: any) => c.name === 'django'
      )
      expect(djangoCmd.command).not.toContain(':8000')
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
})
