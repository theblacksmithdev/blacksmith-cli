import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { ensureGitignore } from '../gitignore.js'
import type { GitignoreKind } from '../gitignore.js'
import { getTemplatesDir } from '../paths.js'

describe('ensureGitignore', () => {
  const getTmpDir = useTmpDir()

  it('should write a .gitignore when none exists', () => {
    const dir = getTmpDir()

    expect(ensureGitignore(dir, 'backend/django')).toBe(true)
    expect(fs.existsSync(path.join(dir, '.gitignore'))).toBe(true)
  })

  it('should never overwrite an existing .gitignore', () => {
    const dir = getTmpDir()
    const destPath = path.join(dir, '.gitignore')
    fs.writeFileSync(destPath, '# hand written\n')

    expect(ensureGitignore(dir, 'backend/django')).toBe(false)
    expect(fs.readFileSync(destPath, 'utf-8')).toBe('# hand written\n')
  })

  it('should ignore venv/ in the backend .gitignore', () => {
    const dir = getTmpDir()
    ensureGitignore(dir, 'backend/django')

    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8')
    expect(content).toMatch(/^venv\/$/m)
    expect(content).toMatch(/^\.venv\/$/m)
  })

  it('should ignore node_modules/ and the Prisma database in the Express backend .gitignore', () => {
    const dir = getTmpDir()

    expect(ensureGitignore(dir, 'backend/express')).toBe(true)

    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8')
    expect(content).toMatch(/^node_modules\/$/m)
    expect(content).toMatch(/^dist\/$/m)
    // The dev and test SQLite files must never be committed
    expect(content).toMatch(/^prisma\/\*\.db$/m)
  })

  it('should ignore node_modules/ in the frontend .gitignore', () => {
    const dir = getTmpDir()
    ensureGitignore(dir, 'frontend')

    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8')
    expect(content).toMatch(/^node_modules\/$/m)
  })

  it('should ignore both venv/ and node_modules/ in the project .gitignore', () => {
    const dir = getTmpDir()
    ensureGitignore(dir, 'project')

    const content = fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8')
    expect(content).toMatch(/^backend\/venv\/$/m)
    expect(content).toMatch(/^frontend\/node_modules\/$/m)
  })

  it('should create the target directory when it is missing', () => {
    const dir = path.join(getTmpDir(), 'nested', 'backend')

    expect(ensureGitignore(dir, 'backend/django')).toBe(true)
    expect(fs.existsSync(path.join(dir, '.gitignore'))).toBe(true)
  })
})

describe('gitignore templates', () => {
  /**
   * npm strips files named `.gitignore` from published tarballs, so the CLI
   * would ship without them and generated projects would commit venv/ and
   * node_modules/. Templates must store them dot-less instead.
   */
  it('should not contain any literal .gitignore file', () => {
    const templatesDir = getTemplatesDir()
    const offenders: string[] = []

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name === '.gitignore') offenders.push(full)
      }
    }
    walk(templatesDir)

    expect(offenders).toEqual([])
  })

  it('should ship a gitignore template for every project kind', () => {
    const templatesDir = getTemplatesDir()
    // Typed as GitignoreKind[], so adding a kind without its template fails
    // to compile rather than silently skipping the check.
    const kinds: GitignoreKind[] = [
      'project',
      'frontend',
      'backend/django',
      'backend/express',
    ]

    for (const kind of kinds) {
      expect(fs.existsSync(path.join(templatesDir, kind, 'gitignore')), kind).toBe(true)
    }
  })
})
