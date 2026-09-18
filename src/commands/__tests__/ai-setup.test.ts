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
      includeChakraUiSkill: true,
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
      includeChakraUiSkill: true,
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

  it('should include Chakra UI skills when enabled', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeChakraUiSkill: true,
    })

    const skillsDir = path.join(getTmpDir(), '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).toContain('chakra-ui-react')
  })

  it('should exclude Chakra UI skills when disabled', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeChakraUiSkill: false,
    })

    const skillsDir = path.join(getTmpDir(), '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).not.toContain('chakra-ui-react')
    expect(entries).not.toContain('chakra-ui-forms')
    expect(entries).not.toContain('chakra-ui-auth')
  })

  it('should clean existing skill directories on regeneration', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeChakraUiSkill: true,
    })

    const rogueDir = path.join(getTmpDir(), '.claude', 'skills', 'old-skill')
    fs.mkdirSync(rogueDir, { recursive: true })
    fs.writeFileSync(path.join(rogueDir, 'SKILL.md'), 'old')

    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeChakraUiSkill: true,
    })

    expect(fs.existsSync(rogueDir)).toBe(false)
  })

  it('should reference skills directory in CLAUDE.md', async () => {
    await setupAiDev({
      projectDir: getTmpDir(),
      projectName: 'test-project',
      includeChakraUiSkill: true,
    })

    const content = fs.readFileSync(path.join(getTmpDir(), 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('.claude/skills/')
    expect(content).toContain('AI Skills')
  })

  describe('backend framework selection', () => {
    async function skillIds(backendFramework: 'django' | 'express') {
      await setupAiDev({
        projectDir: getTmpDir(),
        projectName: 'test-project',
        includeChakraUiSkill: true,
        backendFramework,
      })
      return fs.readdirSync(path.join(getTmpDir(), '.claude', 'skills'))
    }

    it('writes the Express skills and none of the Django ones', async () => {
      const ids = await skillIds('express')

      expect(ids).toContain('express')
      expect(ids).toContain('express-prisma')
      expect(ids).toContain('express-openapi')
      // Django conventions in an Express project are worse than no guidance
      expect(ids).not.toContain('django')
      expect(ids).not.toContain('django-rest-advanced')
      expect(ids).not.toContain('backend-modularization')
    })

    it('still writes the Django skills by default', async () => {
      const ids = await skillIds('django')

      expect(ids).toContain('django')
      expect(ids).toContain('backend-modularization')
      expect(ids).not.toContain('express')
    })

    it('describes the Express layout in the project overview, not the Django one', async () => {
      await setupAiDev({
        projectDir: getTmpDir(),
        projectName: 'test-project',
        includeChakraUiSkill: true,
        backendFramework: 'express',
      })

      const overview = fs.readFileSync(
        path.join(getTmpDir(), '.claude', 'skills', 'project-overview', 'SKILL.md'),
        'utf-8'
      )
      expect(overview).toContain('Express backend + React frontend')
      expect(overview).toContain('prisma/')
      expect(overview).not.toContain('Python virtual environment')
      expect(overview).not.toContain('manage.py')
    })

    it('describes Express commands in the CLI skill', async () => {
      await setupAiDev({
        projectDir: getTmpDir(),
        projectName: 'test-project',
        includeChakraUiSkill: true,
        backendFramework: 'express',
      })

      const cli = fs.readFileSync(
        path.join(getTmpDir(), '.claude', 'skills', 'blacksmith-cli', 'SKILL.md'),
        'utf-8'
      )
      expect(cli).toContain('"framework": "express"')
      expect(cli).toContain('prisma migrate dev')
      expect(cli).not.toContain('makemigrations')
    })
  })
})
