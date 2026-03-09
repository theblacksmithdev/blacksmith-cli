import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { findProjectRoot, getBackendDir, getFrontendDir, loadConfig, dirExists, fileExists } from '../paths.js'

describe('findProjectRoot', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should find the project root from a subdirectory', () => {
    fs.writeFileSync(path.join(tmpDir, 'blacksmith.config.json'), '{}')
    const subDir = path.join(tmpDir, 'a', 'b', 'c')
    fs.mkdirSync(subDir, { recursive: true })

    expect(findProjectRoot(subDir)).toBe(tmpDir)
  })

  it('should find the project root from the root directory itself', () => {
    fs.writeFileSync(path.join(tmpDir, 'blacksmith.config.json'), '{}')

    expect(findProjectRoot(tmpDir)).toBe(tmpDir)
  })

  it('should throw when no config file is found', () => {
    expect(() => findProjectRoot(tmpDir)).toThrow('Not inside a Blacksmith project')
  })
})

describe('getBackendDir', () => {
  it('should return backend path relative to project root', () => {
    const result = getBackendDir('/some/project')
    expect(result).toBe(path.join('/some/project', 'backend'))
  })
})

describe('getFrontendDir', () => {
  it('should return frontend path relative to project root', () => {
    const result = getFrontendDir('/some/project')
    expect(result).toBe(path.join('/some/project', 'frontend'))
  })
})

describe('loadConfig', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should load and parse blacksmith.config.json', () => {
    const config = {
      name: 'test-project',
      version: '1.0.0',
      backend: { port: 8000 },
      frontend: { port: 5173 },
    }
    fs.writeFileSync(path.join(tmpDir, 'blacksmith.config.json'), JSON.stringify(config))

    const result = loadConfig(tmpDir)
    expect(result).toEqual(config)
  })
})

describe('dirExists', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should return true for existing directories', () => {
    expect(dirExists(tmpDir)).toBe(true)
  })

  it('should return false for non-existent paths', () => {
    expect(dirExists(path.join(tmpDir, 'nope'))).toBe(false)
  })

  it('should return false for files', () => {
    const filePath = path.join(tmpDir, 'file.txt')
    fs.writeFileSync(filePath, '')
    expect(dirExists(filePath)).toBe(false)
  })
})

describe('fileExists', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should return true for existing files', () => {
    const filePath = path.join(tmpDir, 'file.txt')
    fs.writeFileSync(filePath, '')
    expect(fileExists(filePath)).toBe(true)
  })

  it('should return false for non-existent paths', () => {
    expect(fileExists(path.join(tmpDir, 'nope.txt'))).toBe(false)
  })

  it('should return false for directories', () => {
    expect(fileExists(tmpDir)).toBe(false)
  })
})
