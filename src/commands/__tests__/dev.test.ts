import { describe, it, expect, vi } from 'vitest'
import net from 'node:net'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
  getFrontendDir: vi.fn(),
  loadConfig: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const concurrentlyMocks = vi.hoisted(() => ({
  default: vi.fn(),
}))
vi.mock('concurrently', () => concurrentlyMocks)

import { dev } from '../dev.js'
import { log } from '../../utils/logger.js'

describe('dev', () => {
  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(dev()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith(
      'Not inside a Blacksmith project. Run "blacksmith init <name>" first.'
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should start concurrent servers with correct config', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.getBackendDir.mockReturnValue('/project/backend')
    pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
    pathMocks.loadConfig.mockReturnValue({
      name: 'test',
      backend: { port: 8000 },
      frontend: { port: 5173 },
    })
    concurrentlyMocks.default.mockReturnValue({
      result: Promise.resolve(),
    })

    await dev()

    expect(concurrentlyMocks.default).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'django', cwd: '/project/backend' }),
        expect.objectContaining({ name: 'vite', cwd: '/project/frontend' }),
        expect.objectContaining({ name: 'sync' }),
      ]),
      expect.objectContaining({
        prefix: 'name',
        killOthers: ['failure'],
      })
    )
  })

  it('should find alternative port when configured port is in use', async () => {
    const server = net.createServer()
    await new Promise<void>((resolve) => server.listen(8000, resolve))

    try {
      pathMocks.findProjectRoot.mockReturnValue('/project')
      pathMocks.getBackendDir.mockReturnValue('/project/backend')
      pathMocks.getFrontendDir.mockReturnValue('/project/frontend')
      pathMocks.loadConfig.mockReturnValue({
        name: 'test',
        backend: { port: 8000 },
        frontend: { port: 5173 },
      })
      concurrentlyMocks.default.mockReturnValue({
        result: Promise.resolve(),
      })

      await dev()

      expect(log.step).toHaveBeenCalledWith(
        expect.stringContaining('Backend port 8000 in use')
      )

      const djangoCmd = concurrentlyMocks.default.mock.calls[0][0].find(
        (c: any) => c.name === 'django'
      )
      expect(djangoCmd.command).not.toContain(':8000')
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })
})
