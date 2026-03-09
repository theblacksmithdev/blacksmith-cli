import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  loadConfig: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const aiMocks = vi.hoisted(() => ({
  setupAiDev: vi.fn(),
}))
vi.mock('../ai-setup.js', () => aiMocks)

import { setupSkills, listSkills } from '../skills.js'
import { log } from '../../utils/logger.js'

describe('setupSkills', () => {
  it('should call setupAiDev with correct parameters', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.loadConfig.mockReturnValue({ name: 'my-project' })
    aiMocks.setupAiDev.mockResolvedValue(undefined)

    await setupSkills({})

    expect(aiMocks.setupAiDev).toHaveBeenCalledWith({
      projectDir: '/project',
      projectName: 'my-project',
      includeBlacksmithUiSkill: true,
    })
    expect(log.success).toHaveBeenCalled()
  })

  it('should respect blacksmithUiSkill option', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.loadConfig.mockReturnValue({ name: 'my-project' })
    aiMocks.setupAiDev.mockResolvedValue(undefined)

    await setupSkills({ blacksmithUiSkill: false })

    expect(aiMocks.setupAiDev).toHaveBeenCalledWith(
      expect.objectContaining({
        includeBlacksmithUiSkill: false,
      })
    )
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setupSkills({})).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('listSkills', () => {
  const getTmpDir = useTmpDir()

  it('should list skills and show setup status', () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    fs.writeFileSync(path.join(getTmpDir(), 'CLAUDE.md'), '# AI Skills')
    fs.mkdirSync(path.join(getTmpDir(), '.claude', 'skills'), { recursive: true })

    listSkills()

    expect(log.info).toHaveBeenCalledWith('Inline skills (in CLAUDE.md):')
    expect(log.info).toHaveBeenCalledWith('File-based skills (in .claude/skills/):')
    expect(log.success).toHaveBeenCalledWith(
      'AI skills are set up. Run "blacksmith setup:ai" to regenerate.'
    )
  })

  it('should show setup instructions when not configured', () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    listSkills()

    expect(log.info).toHaveBeenCalledWith(
      'Run "blacksmith setup:ai" to generate AI skills.'
    )
  })

  it('should exit when not in a project', () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    expect(() => listSkills()).toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
