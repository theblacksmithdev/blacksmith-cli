/**
 * End-to-end proof that Spring Boot is a first-class backend: these tests drive
 * the real `init`, `make:resource`, `dev`, `test`, and CI generation code
 * against the real templates, stubbing only process execution (java, the
 * Gradle wrapper, npm) so nothing actually compiles or runs.
 *
 * The real Gradle build of the generated project is exercised by hand and in
 * the generated project's own CI; this file asserts the CLI hangs together
 * around it.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import YAML from 'yaml'
import { createLoggerMock } from './helpers.js'

vi.mock('../utils/logger.js', () => createLoggerMock())

const execMocks = vi.hoisted(() => ({
  exec: vi.fn(),
  execGradle: vi.fn(),
  execPython: vi.fn(),
  execPip: vi.fn(),
  execSilent: vi.fn(),
  commandExists: vi.fn(),
}))
vi.mock('../utils/exec.js', () => execMocks)

const concurrentlyMocks = vi.hoisted(() => ({ default: vi.fn() }))
vi.mock('concurrently', () => concurrentlyMocks)

import { init } from '../commands/init.js'
import { dev } from '../commands/dev.js'
import { test as runTests } from '../commands/test.js'
import { makeResource } from '../commands/make-resource.js'
import { log } from '../utils/logger.js'
import { JACOCO_XML_REPORT } from '../utils/jacoco.js'

describe('Spring Boot support end to end', () => {
  let tmpDir: string
  let origCwd: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blacksmith-spring-e2e-'))
    origCwd = process.cwd()
    process.chdir(tmpDir)

    execMocks.commandExists.mockResolvedValue(true)
    // `java -version` reports on stderr
    execMocks.exec.mockImplementation(async (command: string) =>
      command === 'java' ? { stderr: 'openjdk version "21.0.2" 2024-01-16' } : {}
    )
    execMocks.execGradle.mockResolvedValue({})
    execMocks.execSilent.mockResolvedValue('')
    concurrentlyMocks.default.mockReturnValue({ result: Promise.resolve() })
  })

  afterEach(() => {
    process.chdir(origCwd)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  /** Run the real `init` for a fullstack Spring project in the temp dir. */
  async function scaffold() {
    await init('my-app', {
      type: 'fullstack',
      backend: 'spring',
      backendPort: '8000',
      frontendPort: '5173',
      themeColor: 'default',
      ai: false,
    })

    const projectRoot = path.join(fs.realpathSync(tmpDir), 'my-app')
    return {
      projectRoot,
      backendDir: path.join(projectRoot, 'backend'),
      frontendDir: path.join(projectRoot, 'frontend'),
    }
  }

  it('scaffolds a Spring project from the real templates and compiles it', async () => {
    const { projectRoot, backendDir, frontendDir } = await scaffold()

    const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'blacksmith.config.json'), 'utf-8'))
    expect(config.backend.framework).toBe('spring')

    for (const file of [
      'gradlew',
      'build.gradle',
      'settings.gradle',
      '.env',
      'src/main/java/app/Application.java',
      'src/main/java/app/pagination/Pagination.java',
      'src/main/java/app/config/RequiredResponseFields.java',
      'src/main/resources/db/migration/V1__create_users.sql',
      'src/test/java/app/ApiTest.java',
    ]) {
      expect(fs.existsSync(path.join(backendDir, file)), file).toBe(true)
    }
    // The wrapper must stay executable through the copy
    expect(fs.statSync(path.join(backendDir, 'gradlew')).mode & 0o111).not.toBe(0)

    // Nothing from the other backends leaks in
    expect(fs.existsSync(path.join(backendDir, 'manage.py'))).toBe(false)
    expect(fs.existsSync(path.join(backendDir, 'requirements.txt'))).toBe(false)
    expect(fs.existsSync(path.join(backendDir, 'package.json'))).toBe(false)
    expect(execMocks.execPython).not.toHaveBeenCalled()

    // Install compiles through the wrapper; the first sync exports offline
    expect(execMocks.execGradle).toHaveBeenCalledWith(['classes', '--console=plain'], backendDir, true)
    expect(execMocks.execGradle).toHaveBeenCalledWith(
      ['exportOpenApi', `-Pout=${path.join(frontendDir, '_schema.json')}`, '--quiet', '--console=plain'],
      backendDir,
      true
    )
  })

  it('make:resource adds a package, test and the next Flyway migration', async () => {
    const { projectRoot, backendDir, frontendDir } = await scaffold()
    process.chdir(projectRoot)
    execMocks.execGradle.mockClear()

    await makeResource('BlogPost')

    const pkg = path.join(backendDir, 'src', 'main', 'java', 'app', 'blogposts')
    for (const file of [
      'BlogPost.java',
      'BlogPostRepository.java',
      'BlogPostService.java',
      'BlogPostController.java',
      'dto/BlogPostResponse.java',
      'dto/BlogPostRequest.java',
      'dto/PatchedBlogPostRequest.java',
      'dto/PaginatedBlogPostList.java',
    ]) {
      expect(fs.existsSync(path.join(pkg, file)), file).toBe(true)
    }
    expect(
      fs.existsSync(path.join(backendDir, 'src', 'test', 'java', 'app', 'blogposts', 'BlogPostApiTest.java'))
    ).toBe(true)

    // The migration follows V1 and creates the snake_case table
    const migration = path.join(backendDir, 'src', 'main', 'resources', 'db', 'migration', 'V2__create_blog_posts.sql')
    expect(fs.readFileSync(migration, 'utf-8')).toContain('CREATE TABLE blog_posts (')

    // The contract the frontend hooks are generated from
    const controller = fs.readFileSync(path.join(pkg, 'BlogPostController.java'), 'utf-8')
    expect(controller).toContain('package app.blogposts;')
    expect(controller).toContain('@RequestMapping("/api/blog_posts")')
    for (const op of ['list', 'create', 'retrieve', 'update', 'partial_update', 'destroy']) {
      expect(controller).toContain(`operationId = "blog_posts_${op}"`)
    }
    expect(fs.readFileSync(path.join(pkg, 'dto', 'BlogPostResponse.java'), 'utf-8')).toContain(
      '@Schema(name = "BlogPost")'
    )

    // Compiled, then the client rebuilt from the new schema
    expect(execMocks.execGradle.mock.calls.map((call) => call[0][0])).toEqual(['classes', 'exportOpenApi'])

    // And the frontend half is the one every backend gets
    expect(fs.existsSync(path.join(frontendDir, 'src', 'pages', 'blog-posts'))).toBe(true)
    expect(fs.existsSync(path.join(frontendDir, 'src', 'api', 'hooks', 'blog-posts'))).toBe(true)
  })

  it('a second resource gets the next migration version', async () => {
    const { projectRoot, backendDir } = await scaffold()
    process.chdir(projectRoot)

    await makeResource('Post')
    await makeResource('Comment')

    const migrations = fs.readdirSync(path.join(backendDir, 'src', 'main', 'resources', 'db', 'migration'))
    expect(migrations.sort()).toEqual(['V1__create_users.sql', 'V2__create_posts.sql', 'V3__create_comments.sql'])
  })

  it('dev runs bootRun beside a continuous compile', async () => {
    const { projectRoot, backendDir } = await scaffold()
    process.chdir(projectRoot)

    await dev()

    const commands = concurrentlyMocks.default.mock.calls.at(-1)![0]
    const spring = commands.find((c: any) => c.name === 'spring')
    const javac = commands.find((c: any) => c.name === 'javac')
    expect(spring.cwd).toBe(backendDir)
    expect(spring.command).toContain('./gradlew bootRun')
    expect(spring.env.SERVER_PORT).toMatch(/^\d+$/)
    expect(javac.command).toContain('--continuous classes')
    expect(commands.find((c: any) => c.name === 'django')).toBeUndefined()

    const watcher = commands.find((c: any) => c.name === 'sync')
    expect(watcher.command).toContain('.java')
  })

  it('test --coverage runs JaCoCo and reports the line coverage', async () => {
    const { projectRoot, backendDir, frontendDir } = await scaffold()
    fs.mkdirSync(path.join(frontendDir, 'node_modules'))
    process.chdir(projectRoot)
    // What jacocoTestReport would have written
    const report = path.join(backendDir, JACOCO_XML_REPORT)
    fs.mkdirSync(path.dirname(report), { recursive: true })
    fs.writeFileSync(report, '<report><counter type="LINE" missed="1" covered="3"/></report>')

    await runTests({ coverage: true })

    expect(execMocks.execGradle).toHaveBeenCalledWith(['test', 'jacocoTestReport'], backendDir)
    expect(log.info).toHaveBeenCalledWith(expect.stringContaining('Backend line coverage: 75.0%'))
    expect(execMocks.exec).toHaveBeenCalledWith('npm', ['run', 'test:coverage'], { cwd: frontendDir })
    expect(log.success).toHaveBeenCalledWith('All tests passed.')
  })

  it('generates CI that runs JUnit with JaCoCo and exports the schema with Gradle', async () => {
    const { projectRoot } = await scaffold()

    const doc = YAML.parse(fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8'))

    expect(doc.jobs.backend.name).toBe('Backend (JUnit)')
    const backendRuns = doc.jobs.backend.steps.map((s: any) => s.run ?? '').join('\n')
    expect(backendRuns).toContain('./gradlew test jacocoTestReport')
    expect(backendRuns).toContain('./gradlew bootJar')
    expect(JSON.stringify(doc.jobs.backend.steps)).toContain('actions/setup-java')

    const frontendRuns = doc.jobs.frontend.steps.map((s: any) => s.run ?? '').join('\n')
    expect(frontendRuns).toContain('./gradlew exportOpenApi -Pout=../frontend/_schema.json')
    expect(frontendRuns).toContain('npx openapi-ts --input _schema.json')
  })
})
