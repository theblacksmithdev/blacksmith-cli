import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock logger to suppress output
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

// Mock paths to use our temp directory
const mockFindProjectRoot = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
}))

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { eject } from '../eject.js'
import { log } from '../../utils/logger.js'

describe('eject', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should remove blacksmith.config.json when it exists', async () => {
    const configPath = path.join(tmpDir, 'blacksmith.config.json')
    fs.writeFileSync(configPath, '{}')
    mockFindProjectRoot.mockReturnValue(tmpDir)

    await eject()

    expect(fs.existsSync(configPath)).toBe(false)
    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should succeed even when config does not exist', async () => {
    mockFindProjectRoot.mockReturnValue(tmpDir)

    await eject()

    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should exit with error when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error('Not inside a Blacksmith project')
    })

    await expect(eject()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Not inside a Blacksmith project.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
