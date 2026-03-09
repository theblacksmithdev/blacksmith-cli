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

const mockFindProjectRoot = vi.fn()
const mockGetBackendDir = vi.fn()
const mockGetFrontendDir = vi.fn()
const mockGetTemplatesDir = vi.fn()
vi.mock('../../utils/paths.js', () => ({
  findProjectRoot: (...args: any[]) => mockFindProjectRoot(...args),
  getBackendDir: (...args: any[]) => mockGetBackendDir(...args),
  getFrontendDir: (...args: any[]) => mockGetFrontendDir(...args),
  getTemplatesDir: (...args: any[]) => mockGetTemplatesDir(...args),
}))

const mockRenderDirectory = vi.fn()
const mockAppendAfterMarker = vi.fn()
const mockInsertBeforeMarker = vi.fn()
vi.mock('../../utils/template.js', () => ({
  renderDirectory: (...args: any[]) => mockRenderDirectory(...args),
  appendAfterMarker: (...args: any[]) => mockAppendAfterMarker(...args),
  insertBeforeMarker: (...args: any[]) => mockInsertBeforeMarker(...args),
}))

const mockExec = vi.fn()
const mockExecPython = vi.fn()
vi.mock('../../utils/exec.js', () => ({
  exec: (...args: any[]) => mockExec(...args),
  execPython: (...args: any[]) => mockExecPython(...args),
}))

const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called')
}) as any)

import { makeResource } from '../make-resource.js'
import { log } from '../../utils/logger.js'

describe('makeResource', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-test-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('should create a resource with correct name variants', async () => {
    mockFindProjectRoot.mockReturnValue(tmpDir)
    mockGetBackendDir.mockReturnValue(path.join(tmpDir, 'backend'))
    mockGetFrontendDir.mockReturnValue(path.join(tmpDir, 'frontend'))
    mockGetTemplatesDir.mockReturnValue('/templates')
    mockExecPython.mockResolvedValue({})
    mockExec.mockResolvedValue({})

    await makeResource('BlogPost')

    // Verify backend template rendering
    expect(mockRenderDirectory).toHaveBeenCalledWith(
      '/templates/resource/backend',
      path.join(tmpDir, 'backend', 'apps', 'blog_posts'),
      expect.objectContaining({
        Name: 'BlogPost',
        Names: 'BlogPosts',
        snake: 'blog_post',
        snakes: 'blog_posts',
        kebab: 'blog-post',
        kebabs: 'blog-posts',
      })
    )

    // Verify app registered in settings
    expect(mockAppendAfterMarker).toHaveBeenCalledWith(
      path.join(tmpDir, 'backend', 'config', 'settings', 'base.py'),
      '# blacksmith:apps',
      "    'apps.blog_posts',"
    )

    // Verify URLs registered
    expect(mockInsertBeforeMarker).toHaveBeenCalledWith(
      path.join(tmpDir, 'backend', 'config', 'urls.py'),
      '# blacksmith:urls',
      "    path('api/blog_posts/', include('apps.blog_posts.urls')),"
    )

    // Verify migrations ran
    expect(mockExecPython).toHaveBeenCalledWith(
      ['manage.py', 'makemigrations', 'blog_posts'],
      path.join(tmpDir, 'backend'),
      true
    )

    expect(log.success).toHaveBeenCalledWith('Resource "BlogPost" created successfully!')
  })

  it('should exit when not in a project', async () => {
    mockFindProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when backend app already exists', async () => {
    const backendAppDir = path.join(tmpDir, 'backend', 'apps', 'posts')
    fs.mkdirSync(backendAppDir, { recursive: true })

    mockFindProjectRoot.mockReturnValue(tmpDir)
    mockGetBackendDir.mockReturnValue(path.join(tmpDir, 'backend'))
    mockGetFrontendDir.mockReturnValue(path.join(tmpDir, 'frontend'))
    mockGetTemplatesDir.mockReturnValue('/templates')

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Backend app "posts" already exists.')
  })

  it('should exit when frontend page already exists', async () => {
    const frontendPageDir = path.join(tmpDir, 'frontend', 'src', 'pages', 'posts')
    fs.mkdirSync(frontendPageDir, { recursive: true })

    mockFindProjectRoot.mockReturnValue(tmpDir)
    mockGetBackendDir.mockReturnValue(path.join(tmpDir, 'backend'))
    mockGetFrontendDir.mockReturnValue(path.join(tmpDir, 'frontend'))
    mockGetTemplatesDir.mockReturnValue('/templates')

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Frontend page "posts" already exists.')
  })
})
