import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

import { setupAiDev } from '../ai-setup.js'

describe('setupAiDev', () => {
  const getTmpDir = useTmpDir()

  it('should create CLAUDE.md at project root', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const claudeMd = path.join(getTmpDir(), 'CLAUDE.md')
    expect(fs.existsSync(claudeMd)).toBe(true)

    const content = fs.readFileSync(claudeMd, 'utf-8')
    expect(content.length).toBeGreaterThan(0)
    expect(content).toContain('AI Skills')
  })

  it('should create .claude/skills directory with skill files', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const skillsDir = path.join(getTmpDir(), '.claude', 'skills')
    expect(fs.existsSync(skillsDir)).toBe(true)

    const entries = fs.readdirSync(skillsDir)
    expect(entries.length).toBeGreaterThan(0)

    for (const entry of entries) {
      const skillPath = path.join(skillsDir, entry, 'SKILL.md')
      expect(fs.existsSync(skillPath)).toBe(true)

      const content = fs.readFileSync(skillPath, 'utf-8')
      expect(content).toMatch(/^---\nname:/)
    }
  })

  it('should include blacksmith-ui skills when enabled', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const skillsDir = path.join(getTmpDir(), '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).toContain('blacksmith-ui-react')
  })

  it('should exclude blacksmith-ui skills when disabled', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: false,
    })

    const skillsDir = path.join(getTmpDir(), '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).not.toContain('blacksmith-ui-react')
    expect(entries).not.toContain('blacksmith-ui-forms')
    expect(entries).not.toContain('blacksmith-ui-auth')
  })

  it('should clean existing skill directories on regeneration', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const rogueDir = path.join(getTmpDir(), '.claude', 'skills', 'old-skill')
    fs.mkdirSync(rogueDir, { recursive: true })
    fs.writeFileSync(path.join(rogueDir, 'SKILL.md'), 'old')

    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    expect(fs.existsSync(rogueDir)).toBe(false)
  })

  it('should reference skills directory in CLAUDE.md', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const content = fs.readFileSync(path.join(getTmpDir(), 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('.claude/skills/')
    expect(content).toContain('AI Skills')
  })
})
