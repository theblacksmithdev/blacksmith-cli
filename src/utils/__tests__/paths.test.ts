import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { findProjectRoot, getBackendDir, getFrontendDir, loadConfig, dirExists, fileExists } from '../paths.js'

describe('findProjectRoot', () => {
  const getTmpDir = useTmpDir()

  it('should find the project root from a subdirectory', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), '{}')
    const subDir = path.join(getTmpDir(), 'a', 'b', 'c')
    fs.mkdirSync(subDir, { recursive: true })

    expect(findProjectRoot(subDir)).toBe(getTmpDir())
  })

  it('should find the project root from the root directory itself', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), '{}')

    expect(findProjectRoot(getTmpDir())).toBe(getTmpDir())
  })

  it('should throw when no config file is found', () => {
    expect(() => findProjectRoot(getTmpDir())).toThrow('Not inside a Blacksmith project')
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
  const getTmpDir = useTmpDir()

  it('should load and parse blacksmith.config.json', () => {
    const config = {
      name: 'test-project',
      version: '1.0.0',
      backend: { port: 8000 },
      frontend: { port: 5173 },
    }
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify(config))

    const result = loadConfig(getTmpDir())
    expect(result).toEqual(config)
  })
})

describe('dirExists', () => {
  const getTmpDir = useTmpDir()

  it('should return true for existing directories', () => {
    expect(dirExists(getTmpDir())).toBe(true)
  })

  it('should return false for non-existent paths', () => {
    expect(dirExists(path.join(getTmpDir(), 'nope'))).toBe(false)
  })

  it('should return false for files', () => {
    const filePath = path.join(getTmpDir(), 'file.txt')
    fs.writeFileSync(filePath, '')
    expect(dirExists(filePath)).toBe(false)
  })
})

describe('fileExists', () => {
  const getTmpDir = useTmpDir()

  it('should return true for existing files', () => {
    const filePath = path.join(getTmpDir(), 'file.txt')
    fs.writeFileSync(filePath, '')
    expect(fileExists(filePath)).toBe(true)
  })

  it('should return false for non-existent paths', () => {
    expect(fileExists(path.join(getTmpDir(), 'nope.txt'))).toBe(false)
  })

  it('should return false for directories', () => {
    expect(fileExists(getTmpDir())).toBe(false)
  })
})
