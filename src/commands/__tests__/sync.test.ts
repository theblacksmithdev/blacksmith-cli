import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

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

import { sync } from '../sync.js'
import { log } from '../../utils/logger.js'

describe('sync', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should generate schema offline and run openapi-ts', async () => {
    const frontendDir = path.join(tmpDir, 'frontend')
    fs.mkdirSync(frontendDir, { recursive: true })

    // Create a mock openapi-ts config
    const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
    fs.writeFileSync(configPath, "export default { input: { path: 'http://localhost:8000/api/schema/' } }")

    mockFindProjectRoot.mockReturnValue(tmpDir)
    mockGetBackendDir.mockReturnValue(path.join(tmpDir, 'backend'))
    mockGetFrontendDir.mockReturnValue(frontendDir)
    mockExecPython.mockResolvedValue({})
    mockExec.mockResolvedValue({})

    await sync()

    // Verify schema generation command
    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'spectacular', '--file', path.join(frontendDir, '_schema.yml')],
      path.join(tmpDir, 'backend'),
      true
    )

    // Verify openapi-ts was run
    expect(mockExec).toHaveBeenCalledWith(
      process.execPath,
      [path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')],
      { cwd: frontendDir, silent: true }
    )

    // Verify config was restored (not modified)
    const restoredConfig = fs.readFileSync(configPath, 'utf-8')
    expect(restoredConfig).toContain('http://localhost:8000/api/schema/')
  })

  it('should restore config even when openapi-ts fails', async () => {
    const frontendDir = path.join(tmpDir, 'frontend')
    fs.mkdirSync(frontendDir, { recursive: true })

    const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
    const originalConfig = "export default { input: { path: 'http://localhost:8000/api/schema/' } }"
    fs.writeFileSync(configPath, originalConfig)

    mockFindProjectRoot.mockReturnValue(tmpDir)
    mockGetBackendDir.mockReturnValue(path.join(tmpDir, 'backend'))
    mockGetFrontendDir.mockReturnValue(frontendDir)
    mockExecPython.mockResolvedValue({})
    mockExec.mockRejectedValue(new Error('openapi-ts failed'))

    await expect(sync()).rejects.toThrow('process.exit called')

    // Config should be restored even on failure
    const restoredConfig = fs.readFileSync(configPath, 'utf-8')
    expect(restoredConfig).toBe(originalConfig)
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(sync()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalled()
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
