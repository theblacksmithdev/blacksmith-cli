import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
  getFrontendDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { sync } from '../sync.js'
import { log } from '../../utils/logger.js'

describe('sync', () => {
  const getTmpDir = useTmpDir()

  it('should generate schema offline and run openapi-ts', async () => {
    const frontendDir = path.join(getTmpDir(), 'frontend')
    fs.mkdirSync(frontendDir, { recursive: true })

    const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
    fs.writeFileSync(configPath, "export default { input: { path: 'http://localhost:8000/api/schema/' } }")

    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendDir.mockReturnValue(path.join(getTmpDir(), 'backend'))
    pathMocks.getFrontendDir.mockReturnValue(frontendDir)
    execMocks.execPython.mockResolvedValue({})
    execMocks.exec.mockResolvedValue({})

    await sync()

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'spectacular', '--file', path.join(frontendDir, '_schema.yml')],
      path.join(getTmpDir(), 'backend'),
      true
    )

    expect(execMocks.exec).toHaveBeenCalledWith(
      process.execPath,
      [path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')],
      { cwd: frontendDir, silent: true }
    )

    const restoredConfig = fs.readFileSync(configPath, 'utf-8')
    expect(restoredConfig).toContain('http://localhost:8000/api/schema/')
  })

  it('should restore config even when openapi-ts fails', async () => {
    const frontendDir = path.join(getTmpDir(), 'frontend')
    fs.mkdirSync(frontendDir, { recursive: true })

    const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
    const originalConfig = "export default { input: { path: 'http://localhost:8000/api/schema/' } }"
    fs.writeFileSync(configPath, originalConfig)

    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendDir.mockReturnValue(path.join(getTmpDir(), 'backend'))
    pathMocks.getFrontendDir.mockReturnValue(frontendDir)
    execMocks.execPython.mockResolvedValue({})
    execMocks.exec.mockRejectedValue(new Error('openapi-ts failed'))

    await expect(sync()).rejects.toThrow('process.exit called')

    const restoredConfig = fs.readFileSync(configPath, 'utf-8')
    expect(restoredConfig).toBe(originalConfig)
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(sync()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalled()
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
