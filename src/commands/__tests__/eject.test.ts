import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

import { eject } from '../eject.js'
import { log } from '../../utils/logger.js'

describe('eject', () => {
  const getTmpDir = useTmpDir()

  it('should remove blacksmith.config.json when it exists', async () => {
    const configPath = path.join(getTmpDir(), 'blacksmith.config.json')
    fs.writeFileSync(configPath, '{}')
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    await eject()

    expect(fs.existsSync(configPath)).toBe(false)
    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should succeed even when config does not exist', async () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    await eject()

    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should exit with error when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error('Not inside a Blacksmith project')
    })

    await expect(eject()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Not inside a Blacksmith project.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
