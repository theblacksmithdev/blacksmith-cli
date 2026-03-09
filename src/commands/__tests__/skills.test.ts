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
const mockLoadConfig = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  loadConfig: (...args: any[]) => mockLoadConfig(...args),
}))

const mockSetupAiDev = vi.fn()
vi.mock('../ai-setup.js', () => ({
  setupAiDev: (...args: any[]) => mockSetupAiDev(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { setupSkills, listSkills } from '../skills.js'
import { log } from '../../utils/logger.js'

describe('setupSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call setupAiDev with correct parameters', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockLoadConfig.mockReturnValue({ name: 'my-project' })
    mockSetupAiDev.mockResolvedValue(undefined)

    await setupSkills({})

    expect(mockSetupAiDev).toHaveBeenCalledWith({
      projectDir: '/project',
      projectName: 'my-project',
      includeBlacksmithUiSkill: true,
    })
    expect(log.success).toHaveBeenCalled()
  })

  it('should respect blacksmithUiSkill option', async () => {
    mockFindProjectRoot.mockReturnValue('/project')
    mockLoadConfig.mockReturnValue({ name: 'my-project' })
    mockSetupAiDev.mockResolvedValue(undefined)

    await setupSkills({ blacksmithUiSkill: false })

    expect(mockSetupAiDev).toHaveBeenCalledWith(
      expect.objectContaining({
        includeBlacksmithUiSkill: false,
      })
    )
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setupSkills({})).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('listSkills', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should list skills and show setup status', () => {
    mockFindProjectRoot.mockReturnValue(tmpDir)

    // Create CLAUDE.md and skills directory
    fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# AI Skills')
    fs.mkdirSync(path.join(tmpDir, '.claude', 'skills'), { recursive: true })

    listSkills()

    expect(log.info).toHaveBeenCalledWith('Inline skills (in CLAUDE.md):')
    expect(log.info).toHaveBeenCalledWith('File-based skills (in .claude/skills/):')
    expect(log.success).toHaveBeenCalledWith(
      'AI skills are set up. Run "blacksmith setup:ai" to regenerate.'
    )
  })

  it('should show setup instructions when not configured', () => {
    mockFindProjectRoot.mockReturnValue(tmpDir)

    listSkills()

    expect(log.info).toHaveBeenCalledWith(
      'Run "blacksmith setup:ai" to generate AI skills.'
    )
  })

  it('should exit when not in a project', () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    expect(() => listSkills()).toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
