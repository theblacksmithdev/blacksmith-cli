import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createLoggerMock, useTmpDir } from '../../__tests__/helpers.js'
import { mockExit } from '../../__tests__/setup.js'

vi.mock('../../utils/logger.js', () => createLoggerMock())

const pathMocks = vi.hoisted(() => ({
  findProjectRoot: vi.fn(),
  getBackendDir: vi.fn(),
  getFrontendDir: vi.fn(),
  getTemplatesDir: vi.fn(),
}))
vi.mock('../../utils/paths.js', () => pathMocks)

const templateMocks = vi.hoisted(() => ({
  renderDirectory: vi.fn(),
  appendAfterMarker: vi.fn(),
  insertBeforeMarker: vi.fn(),
}))
vi.mock('../../utils/template.js', () => templateMocks)

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
}))
vi.mock('../../utils/exec.js', () => execMocks)

import { makeResource } from '../make-resource.js'
import { log } from '../../utils/logger.js'

describe('makeResource', () => {
  const getTmpDir = useTmpDir()

  it('should create a resource with correct name variants', async () => {
    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendDir.mockReturnValue(path.join(getTmpDir(), 'backend'))
    pathMocks.getFrontendDir.mockReturnValue(path.join(getTmpDir(), 'frontend'))
    pathMocks.getTemplatesDir.mockReturnValue('/templates')
    execMocks.execPython.mockResolvedValue({})
    execMocks.exec.mockResolvedValue({})

    await makeResource('BlogPost')

    expect(templateMocks.renderDirectory).toHaveBeenCalledWith(
      '/templates/resource/backend',
      path.join(getTmpDir(), 'backend', 'apps', 'blog_posts'),
      expect.objectContaining({
        Name: 'BlogPost',
        Names: 'BlogPosts',
        snake: 'blog_post',
        snakes: 'blog_posts',
        kebab: 'blog-post',
        kebabs: 'blog-posts',
      })
    )

    expect(templateMocks.appendAfterMarker).toHaveBeenCalledWith(
      path.join(getTmpDir(), 'backend', 'config', 'settings', 'base.py'),
      '# blacksmith:apps',
      "    'apps.blog_posts',"
    )

    expect(templateMocks.insertBeforeMarker).toHaveBeenCalledWith(
      path.join(getTmpDir(), 'backend', 'config', 'urls.py'),
      '# blacksmith:urls',
      "    path('api/blog_posts/', include('apps.blog_posts.urls')),"
    )

    expect(templateMocks.renderDirectory).toHaveBeenCalledWith(
      '/templates/resource/api-hooks',
      path.join(getTmpDir(), 'frontend', 'src', 'api', 'hooks', 'blog-posts'),
      expect.objectContaining({
        Name: 'BlogPost',
        Names: 'BlogPosts',
        kebabs: 'blog-posts',
      })
    )

    expect(templateMocks.renderDirectory).toHaveBeenCalledWith(
      '/templates/resource/pages',
      path.join(getTmpDir(), 'frontend', 'src', 'pages', 'blog-posts'),
      expect.objectContaining({
        Name: 'BlogPost',
        Names: 'BlogPosts',
        kebabs: 'blog-posts',
      })
    )

    expect(execMocks.execPython).toHaveBeenCalledWith(
      ['manage.py', 'makemigrations', 'blog_posts'],
      path.join(getTmpDir(), 'backend'),
      true
    )

    expect(log.success).toHaveBeenCalledWith('Resource "BlogPost" created successfully!')
  })

  it('should exit when not in a project', async () => {
    pathMocks.findProjectRoot.mockImplementation(() => {
      throw new Error()
    })

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should exit when backend app already exists', async () => {
    const backendAppDir = path.join(getTmpDir(), 'backend', 'apps', 'posts')
    fs.mkdirSync(backendAppDir, { recursive: true })

    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendDir.mockReturnValue(path.join(getTmpDir(), 'backend'))
    pathMocks.getFrontendDir.mockReturnValue(path.join(getTmpDir(), 'frontend'))
    pathMocks.getTemplatesDir.mockReturnValue('/templates')

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Backend app "posts" already exists.')
  })

  it('should exit when frontend page already exists', async () => {
    const frontendPageDir = path.join(getTmpDir(), 'frontend', 'src', 'pages', 'posts')
    fs.mkdirSync(frontendPageDir, { recursive: true })

    pathMocks.findProjectRoot.mockReturnValue(getTmpDir())
    pathMocks.getBackendDir.mockReturnValue(path.join(getTmpDir(), 'backend'))
    pathMocks.getFrontendDir.mockReturnValue(path.join(getTmpDir(), 'frontend'))
    pathMocks.getTemplatesDir.mockReturnValue('/templates')

    await expect(makeResource('Post')).rejects.toThrow('process.exit called')
    expect(log.error).toHaveBeenCalledWith('Frontend page "posts" already exists.')
  })
})
