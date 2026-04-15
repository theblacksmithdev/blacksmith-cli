import { describe, it, expect, vi } from 'vitest'
import { createLoggerMock } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  hasBackend: vi.fn(),
  hasFrontend: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const backendMocks = vi.hoisted(() => ({
  setupBackend: vi.fn(),
}))
vi.mock('../setup-backend.js', () => backendMocks)

const frontendMocks = vi.hoisted(() => ({
  setupFrontend: vi.fn(),
}))
vi.mock('../setup-frontend.js', () => frontendMocks)

import { setup } from '../setup.js'
import { log } from '../../utils/logger.js'

describe('setup', () => {
  it('should run both backend and frontend setup for fullstack projects', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasBackend.mockReturnValue(true)
    pathMocks.hasFrontend.mockReturnValue(true)
    backendMocks.setupBackend.mockResolvedValue(undefined)
    frontendMocks.setupFrontend.mockResolvedValue(undefined)

    await setup()

    expect(backendMocks.setupBackend).toHaveBeenCalled()
    expect(frontendMocks.setupFrontend).toHaveBeenCalled()
    expect(log.success).toHaveBeenCalledWith(
      'Project setup complete! Run "blacksmith dev" to start developing.'
    )
  })

  it('should only run backend setup for backend-only projects', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasBackend.mockReturnValue(true)
    pathMocks.hasFrontend.mockReturnValue(false)
    backendMocks.setupBackend.mockResolvedValue(undefined)

    await setup()

    expect(backendMocks.setupBackend).toHaveBeenCalled()
    expect(frontendMocks.setupFrontend).not.toHaveBeenCalled()
  })

  it('should only run frontend setup for frontend-only projects', async () => {
    pathMocks.findProjectRoot.mockReturnValue('/project')
    pathMocks.hasBackend.mockReturnValue(false)
    pathMocks.hasFrontend.mockReturnValue(true)
    frontendMocks.setupFrontend.mockResolvedValue(undefined)

    await setup()

    expect(backendMocks.setupBackend).not.toHaveBeenCalled()
    expect(frontendMocks.setupFrontend).toHaveBeenCalled()
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(setup()).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
