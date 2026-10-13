/**
 * End-to-end proof that Vue is a first-class frontend: these tests drive the
 * real `init`, `make:resource`, `setup:ai`, `sync`, and `eject` code against the
 * real templates, stubbing only process execution (venv, pip, npm) so nothing
 * actually installs or runs.
 *
 * The real Vue build (vue-tsc, Vitest, ESLint) of the generated project is
 * exercised by hand and in the generated project's own CI; this file asserts
 * the CLI hangs together around it.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createLoggerMock } from './helpers.js'

vi.mock('../utils/logger.js', () => createLoggerMock())

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execPython: vi.fn(),
  execPip: vi.fn(),
  execSilent: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../utils/exec.js', () => execMocks)

import { init } from '../commands/init.js'
import { makeResource } from '../commands/make-resource.js'
import { setupSkills } from '../commands/skills.js'
import { sync } from '../commands/sync.js'
import { eject } from '../commands/eject.js'
import { log } from '../utils/logger.js'

describe('Vue support end to end', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-vue-e2e-'))
    origCwd = process.cwd()
    process.chdir(tmpDir)

    execMocks.commandExists.mockResolvedValue(true)
    execMocks.exec.mockResolvedValue({})
    execMocks.execPython.mockResolvedValue({})
    execMocks.execPip.mockResolvedValue({})
    execMocks.execSilent.mockResolvedValue('v22.12.0\n')
  })

  afterEach(() => {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  /** Run the real `init` for a fullstack FastAPI + Vue project in the temp dir. */
  async function scaffold(type: 'fullstack' | 'frontend' = 'fullstack') {
    await init('my-app', {
      type,
      backend: 'fastapi',
      frontend: 'vue',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const projectRoot = path.join(fs.realpathSync(tmpDir), 'my-app')
    return {
      projectRoot,
      frontendDir: type === 'fullstack' ? path.join(projectRoot, 'frontend') : projectRoot,
    }
  }

  const read = (...parts: string[]) => fs.readFileSync(path.join(...parts), 'utf-8')

  it('scaffolds a Vue frontend from the shared and Vue templates', async () => {
    const { projectRoot, frontendDir } = await scaffold()

    const config = JSON.parse(read(projectRoot, 'blacksmith.config.json'))
    expect(config.frontend).toEqual({ port: 5173, framework: 'vue' })

    for (const file of [
      // Vue's own
      'vite.config.ts',
      'eslint.config.js',
      'src/main.ts',
      'src/App.vue',
      'src/plugins.ts',
      'src/router/routes.ts',
      'src/router/guards.ts',
      'src/features/auth/stores/auth-store.ts',
      'src/shared/composables/use-api-query.ts',
      'src/theme/main.css',
      // Shared with React
      'src/api/client.ts',
      'src/features/auth/adapter.ts',
      'src/router/paths.ts',
      'src/shared/utils/api-error.ts',
      'src/shared/utils/color-mode.ts',
    ]) {
      expect(fs.existsSync(path.join(frontendDir, file)), file).toBe(true)
    }

    // Nothing from the React tree leaks in
    expect(fs.existsSync(path.join(frontendDir, 'src', 'main.tsx'))).toBe(false)
    expect(fs.existsSync(path.join(frontendDir, 'src', 'theme', 'recipes.ts'))).toBe(false)
    expect(read(frontendDir, 'package.json')).not.toContain('react')

    // The shared files are pointed at the Vue entry and query plugin
    expect(read(frontendDir, 'index.html')).toContain('src="/src/main.ts"')
    expect(read(frontendDir, 'openapi-ts.config.ts')).toContain("name: '@tanstack/vue-query'")
    expect(read(frontendDir, 'src', 'theme', 'presets.ts')).toContain("PRESETS['default']")
  })

  it('make:resource adds composables and pages and registers the routes', async () => {
    const { projectRoot, frontendDir } = await scaffold()
    process.chdir(projectRoot)

    await makeResource('BlogPost')

    const api = path.join(frontendDir, 'src', 'api', 'composables', 'blog-posts')
    for (const file of ['index.ts', 'use-blog-posts-query.ts', 'use-blog-post-mutations.ts']) {
      expect(fs.existsSync(path.join(api, file)), file).toBe(true)
    }
    const pages = path.join(frontendDir, 'src', 'pages', 'blog-posts')
    for (const file of [
      'BlogPostsPage.vue',
      'BlogPostDetailPage.vue',
      'routes.ts',
      'schemas.ts',
      'components/BlogPostCard.vue',
      'components/BlogPostList.vue',
      'components/BlogPostForm.vue',
    ]) {
      expect(fs.existsSync(path.join(pages, file)), file).toBe(true)
    }
    expect(fs.existsSync(path.join(frontendDir, 'src', 'api', 'hooks', 'blog-posts'))).toBe(false)

    // Vue interpolations come through, with the names substituted inside them
    const card = read(pages, 'components', 'BlogPostCard.vue')
    expect(card).toContain('{{ blogPost.title }}')
    expect(card).toContain('import type { BlogPost } from \'@/api/generated\'')
    expect(read(pages, 'BlogPostsPage.vue')).toContain('New blog post')

    expect(read(frontendDir, 'src', 'router', 'paths.ts')).toContain("BlogPosts = '/blog-posts',")
    const routes = read(frontendDir, 'src', 'router', 'routes.ts')
    expect(routes).toContain("import { blogPostsRoutes } from '@/pages/blog-posts'")
    expect(routes).toContain('  ...blogPostsRoutes,')
  })

  it('writes the Vue skills, not the React ones', async () => {
    const { projectRoot } = await scaffold()
    process.chdir(projectRoot)

    await setupSkills({})

    const skills = fs.readdirSync(path.join(projectRoot, '.claude', 'skills'))
    expect(skills).toEqual(expect.arrayContaining(['vue', 'vue-query', 'nuxt-ui', 'nuxt-ui-forms', 'vue-auth', 'frontend-testing']))
    expect(skills).not.toContain('react')
    expect(skills).not.toContain('chakra-ui-react')

    const claudeMd = read(projectRoot, 'CLAUDE.md')
    expect(claudeMd).toContain('Use Nuxt UI v4 for ALL Interactive UI')
    expect(claudeMd).not.toContain('chakra')
  })

  it('leaves the UI kit skills out with --no-ui-skill', async () => {
    const { projectRoot } = await scaffold()
    process.chdir(projectRoot)

    await setupSkills({ uiSkill: false })

    const skills = fs.readdirSync(path.join(projectRoot, '.claude', 'skills'))
    expect(skills).not.toContain('nuxt-ui')
    expect(skills).toContain('vue')
  })

  it('names the Vue query module when syncing', async () => {
    const { projectRoot } = await scaffold()
    process.chdir(projectRoot)

    await sync()

    expect(log.step).toHaveBeenCalledWith(expect.stringContaining('@tanstack/vue-query.gen.ts'))
  })

  it('ejects to a plain FastAPI + Vue project', async () => {
    const { projectRoot } = await scaffold()
    process.chdir(projectRoot)

    await eject()

    expect(log.step).toHaveBeenCalledWith('Your project is now a standard FastAPI + Vue project.')
  })

  it('refuses a Node.js too old for the Vue toolchain, before writing anything', async () => {
    execMocks.execSilent.mockResolvedValue('v20.10.0\n')
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(scaffold()).rejects.toThrow('exit')

    expect(fs.existsSync(path.join(tmpDir, 'my-app'))).toBe(false)
    exit.mockRestore()
  })

  it('scaffolds a frontend-only Vue project at the root', async () => {
    const { projectRoot } = await scaffold('frontend')

    expect(fs.existsSync(path.join(projectRoot, 'src', 'App.vue'))).toBe(true)
    expect(fs.existsSync(path.join(projectRoot, '.gitignore'))).toBe(true)
    expect(JSON.parse(read(projectRoot, 'blacksmith.config.json')).frontend.framework).toBe('vue')
  })
})
