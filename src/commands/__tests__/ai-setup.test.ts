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

import { setupAiDev } from '../ai-setup.js'

describe('setupAiDev', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should create CLAUDE.md at project root', async () => {
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const claudeMd = path.join(tmpDir, 'CLAUDE.md')
    expect(fs.existsSync(claudeMd)).toBe(true)

    const content = fs.readFileSync(claudeMd, 'utf-8')
    expect(content.length).toBeGreaterThan(0)
    expect(content).toContain('AI Skills')
  })

  it('should create .claude/skills directory with skill files', async () => {
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const skillsDir = path.join(tmpDir, '.claude', 'skills')
    expect(fs.existsSync(skillsDir)).toBe(true)

    // Check that at least some skill directories were created
    const entries = fs.readdirSync(skillsDir)
    expect(entries.length).toBeGreaterThan(0)

    // Each entry should be a directory with a SKILL.md
    for (const entry of entries) {
      const skillPath = path.join(skillsDir, entry, 'SKILL.md')
      expect(fs.existsSync(skillPath)).toBe(true)

      // Should have frontmatter
      const content = fs.readFileSync(skillPath, 'utf-8')
      expect(content).toMatch(/^---\nname:/)
    }
  })

  it('should include blacksmith-ui skills when enabled', async () => {
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const skillsDir = path.join(tmpDir, '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).toContain('blacksmith-ui-react')
  })

  it('should exclude blacksmith-ui skills when disabled', async () => {
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: false,
    })

    const skillsDir = path.join(tmpDir, '.claude', 'skills')
    const entries = fs.readdirSync(skillsDir)
    expect(entries).not.toContain('blacksmith-ui-react')
    expect(entries).not.toContain('blacksmith-ui-forms')
    expect(entries).not.toContain('blacksmith-ui-auth')
  })

  it('should clean existing skill directories on regeneration', async () => {
    // First run
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    // Create a rogue file that should be cleaned
    const rogueDir = path.join(tmpDir, '.claude', 'skills', 'old-skill')
    fs.mkdirSync(rogueDir, { recursive: true })
    fs.writeFileSync(path.join(rogueDir, 'SKILL.md'), 'old')

    // Second run
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    expect(fs.existsSync(rogueDir)).toBe(false)
  })

  it('should reference skills directory in CLAUDE.md', async () => {
    await setupAiDev({
      projectDir: tmpDir,
      projectName: 'test-project',
      includeBlacksmithUiSkill: true,
    })

    const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')
    expect(content).toContain('.claude/skills/')
    expect(content).toContain('AI Skills')
  })
})
