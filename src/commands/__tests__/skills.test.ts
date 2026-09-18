import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  getBackendFramework: vi.fn(() => 'django'),
  findProjectRoot: vi.fn(),
  loadConfig: vi.fn(),
  getProjectType: vi.fn(() => 'fullstack'),
  hasBackend: vi.fn(() => true),
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
      includeChakraUiSkill: true,
      projectType: 'fullstack',
      backendFramework: 'django',
    })
    expect(log.success).toHaveBeenCalled()
  })

  it('should respect chakraUiSkill option', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.loadConfig.mockReturnValue({ name: 'my-project' })
    aiMocks.setupAiDev.mockResolvedValue(undefined)

    await setupSkills({ chakraUiSkill: false })

    expect(aiMocks.setupAiDev).toHaveBeenCalledWith(
      expect.objectContaining({
        includeChakraUiSkill: false,
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

  it('lists the Express backend skills on an Express project', () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendFramework.mockReturnValue('express')

    listSkills()

    const listed = (log.step as any).mock.calls.map((c: any[]) => c[0]).join('\n')
    expect(listed).toContain('express/SKILL.md')
    expect(listed).toContain('express-prisma/SKILL.md')
    expect(listed).toContain('express-openapi/SKILL.md')
    // Django conventions would be actively misleading here
    expect(listed).not.toContain('django/SKILL.md')
    expect(listed).not.toContain('backend-modularization/SKILL.md')

    pathMocks.getBackendFramework.mockReturnValue('django')
  })

  it('omits backend skills entirely on a frontend-only project', () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.hasBackend.mockReturnValue(false)

    listSkills()

    const listed = (log.step as any).mock.calls.map((c: any[]) => c[0]).join('\n')
    expect(listed).not.toContain('django/SKILL.md')
    expect(listed).not.toContain('express/SKILL.md')
    expect(listed).toContain('react/SKILL.md')

    pathMocks.hasBackend.mockReturnValue(true)
  })
})
