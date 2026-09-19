import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { ensureEnvFile } from '../env-file.js'

describe('ensureEnvFile', () => {
  const getTmpDir = useTmpDir()

  /** A backend directory holding just the example file, as a clone does. */
  const clonedBackend = (contents = 'DATABASE_URL="file:./dev.db"\n') => {
    const dir = getTmpDir()
    fs.writeFileSync(path.join(dir, '.env.example'), contents)
    return dir
  }

  it('should write .env from .env.example when none exists', () => {
    const dir = clonedBackend()

    expect(ensureEnvFile(dir)).toBe(true)
    expect(fs.readFileSync(path.join(dir, '.env'), 'utf-8')).toBe(
      'DATABASE_URL="file:./dev.db"\n'
    )
  })

  it('should never overwrite an existing .env', () => {
    const dir = clonedBackend()
    const destPath = path.join(dir, '.env')
    fs.writeFileSync(destPath, 'DATABASE_URL="postgresql://localhost:5432/app"\n')

    expect(ensureEnvFile(dir)).toBe(false)
    expect(fs.readFileSync(destPath, 'utf-8')).toBe(
      'DATABASE_URL="postgresql://localhost:5432/app"\n'
    )
  })

  it('should do nothing when there is no .env.example to copy', () => {
    const dir = getTmpDir()

    expect(ensureEnvFile(dir)).toBe(false)
    expect(fs.existsSync(path.join(dir, '.env'))).toBe(false)
  })
})

describe('env templates', () => {
  /**
   * Prisma resolves env("DATABASE_URL") while parsing schema.prisma, so an
   * Express backend whose .env.example omits it fails setup with P1012 before
   * a single migration runs.
   */
  it('should define DATABASE_URL in the Express .env.example template', () => {
    const template = fs.readFileSync(
      path.join('src', 'templates', 'backend', 'express', '.env.example.hbs'),
      'utf-8'
    )

    expect(template).toMatch(/^DATABASE_URL=/m)
  })
})
