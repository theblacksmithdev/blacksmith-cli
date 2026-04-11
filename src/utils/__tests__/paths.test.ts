import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTmpDir } from '../../__tests__/helpers.js'
import { findProjectRoot, getBackendDir, getFrontendDir, getProjectType, hasBackend, hasFrontend, loadConfig, dirExists, fileExists } from '../paths.js'

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

describe('getProjectType', () => {
  const getTmpDir = useTmpDir()

  it('should return "fullstack" when type is not set (backward compat)', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ name: 'test' }))
    expect(getProjectType(getTmpDir())).toBe('fullstack')
  })

  it('should return the configured type', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ name: 'test', type: 'backend' }))
    expect(getProjectType(getTmpDir())).toBe('backend')
  })
})

describe('hasBackend', () => {
  const getTmpDir = useTmpDir()

  it('should return true for fullstack projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'fullstack' }))
    expect(hasBackend(getTmpDir())).toBe(true)
  })

  it('should return true for backend projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'backend' }))
    expect(hasBackend(getTmpDir())).toBe(true)
  })

  it('should return false for frontend projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'frontend' }))
    expect(hasBackend(getTmpDir())).toBe(false)
  })
})

describe('hasFrontend', () => {
  const getTmpDir = useTmpDir()

  it('should return true for fullstack projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'fullstack' }))
    expect(hasFrontend(getTmpDir())).toBe(true)
  })

  it('should return true for frontend projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'frontend' }))
    expect(hasFrontend(getTmpDir())).toBe(true)
  })

  it('should return false for backend projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'backend' }))
    expect(hasFrontend(getTmpDir())).toBe(false)
  })
})

describe('getBackendDir', () => {
  const getTmpDir = useTmpDir()

  it('should return backend subdirectory for fullstack projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'fullstack' }))
    expect(getBackendDir(getTmpDir())).toBe(path.join(getTmpDir(), 'backend'))
  })

  it('should return project root for backend-only projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'backend' }))
    expect(getBackendDir(getTmpDir())).toBe(getTmpDir())
  })

  it('should throw for frontend-only projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'frontend' }))
    expect(() => getBackendDir(getTmpDir())).toThrow('frontend-only project')
  })
})

describe('getFrontendDir', () => {
  const getTmpDir = useTmpDir()

  it('should return frontend subdirectory for fullstack projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'fullstack' }))
    expect(getFrontendDir(getTmpDir())).toBe(path.join(getTmpDir(), 'frontend'))
  })

  it('should return project root for frontend-only projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'frontend' }))
    expect(getFrontendDir(getTmpDir())).toBe(getTmpDir())
  })

  it('should throw for backend-only projects', () => {
    fs.writeFileSync(path.join(getTmpDir(), 'blacksmith.config.json'), JSON.stringify({ type: 'backend' }))
    expect(() => getFrontendDir(getTmpDir())).toThrow('backend-only project')
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
