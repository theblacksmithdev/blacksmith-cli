import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  getBackendFramework: vi.fn(() => 'django'),
  findProjectRoot: vi.fn(),
  loadConfig: vi.fn(() => ({ type: 'fullstack' })),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

import { eject } from '../eject.js'
import { log } from '../../utils/logger.js'

describe('eject', () => {
  const getTmpDir = useTmpDir()

  it('should remove blacksmith.config.json when it exists', async () => {
    const configPath = path.join(getTmpDir(), 'blacksmith.config.json')
    fs.writeFileSync(configPath, '{}')
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    await eject()

    expect(fs.existsSync(configPath)).toBe(false)
    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should succeed even when config does not exist', async () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    await eject()

    expect(log.success).toHaveBeenCalledWith('Blacksmith has been ejected.')
  })

  it('should exit with error when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error('Not inside a Blacksmith project')
    })

    await expect(eject()).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Not inside a Blacksmith project.')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('names FastAPI and its uvicorn start command on a FastAPI project', async () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendFramework.mockReturnValue('fastapi')

    await eject()

    const steps = (log.step as any).mock.calls.map((c: any[]) => c[0]).join('\n')
    expect(steps).toContain('FastAPI + React project')
    expect(steps).toContain('./venv/bin/uvicorn app.main:app')
    // A FastAPI project has no manage.py — never suggest the Django command
    expect(steps).not.toContain('manage.py runserver')

    pathMocks.getBackendFramework.mockReturnValue('django')
  })

  it('keeps Django instructions on a Django project', async () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())

    await eject()

    const steps = (log.step as any).mock.calls.map((c: any[]) => c[0]).join('\n')
    expect(steps).toContain('Django + React project')
    expect(steps).toContain('./venv/bin/python manage.py runserver')
    expect(steps).not.toContain('uvicorn')
  })
})
