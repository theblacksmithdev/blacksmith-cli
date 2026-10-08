import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { useTmpDir } from './helpers.js'
import { renderDirectory, renderTemplateFile } from '../utils/template.js'
import { generateNames } from '../utils/names.js'

const TEMPLATES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates'
)

const PROJECT_CONTEXT = {
  projectName: 'my-app',
  backendPort: 8000,
  frontendPort: 5173,
  themePreset: 'default',
  projectType: 'fullstack',
  needsBackend: true,
  needsFrontend: true,
  backendFramework: 'django',
  isDjango: true,
  isExpress: false,
}

const EXPRESS_CONTEXT = {
  ...PROJECT_CONTEXT,
  backendFramework: 'express',
  isDjango: false,
  isExpress: true,
}

const FASTAPI_CONTEXT = {
  ...PROJECT_CONTEXT,
  backendFramework: 'fastapi',
  isDjango: false,
  isExpress: false,
}

const RESOURCE_CONTEXT = { ...generateNames('product'), projectName: 'my-app' }

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else out.push(full)
  }
  return out
}

/**
 * Every template must render to final output: no leftover Handlebars
 * expressions, and no leakage of the brace-escaping sentinels that
 * renderTemplate uses internally for JSX and Python f-strings.
 */
describe.each([
  ['backend/django', path.join('backend', 'django'), PROJECT_CONTEXT],
  ['backend/express', path.join('backend', 'express'), EXPRESS_CONTEXT],
  ['backend/fastapi', path.join('backend', 'fastapi'), FASTAPI_CONTEXT],
  ['frontend', 'frontend', PROJECT_CONTEXT],
  ['resource/backend/django', path.join('resource', 'backend', 'django'), RESOURCE_CONTEXT],
  ['resource/backend/express', path.join('resource', 'backend', 'express'), RESOURCE_CONTEXT],
  ['resource/pages', path.join('resource', 'pages'), RESOURCE_CONTEXT],
  ['resource/api-hooks', path.join('resource', 'api-hooks'), RESOURCE_CONTEXT],
  ['resource/frontend', path.join('resource', 'frontend'), RESOURCE_CONTEXT],
])('%s templates', (_label, relDir, context) => {
  const getTmpDir = useTmpDir()

  it('render without leftover Handlebars or escape sentinels', () => {
    const dest = path.join(getTmpDir(), 'out')
    renderDirectory(path.join(TEMPLATES_DIR, relDir), dest, context)

    const offenders: string[] = []
    for (const file of walkFiles(dest)) {
      const content = fs.readFileSync(file, 'utf-8')
      const rel = path.relative(dest, file)
      // `\{{ base: 1 }}` is Handlebars' escape for a literal JSX object prop,
      // so bare `{{` is legitimate in output. Only an unresolved *expression*
      // (`{{projectName}}`, `{{Name}}`) means a template variable went missing.
      const unresolved = content.match(/\{\{\s*[#/]?[a-zA-Z_][\w.]*\s*\}\}/g)
      if (unresolved) offenders.push(`${rel}: unrendered ${unresolved[0]}`)
      if (content.includes('BLACKSMITH_OB') || content.includes('BLACKSMITH_CB')) {
        offenders.push(`${rel}: leaked brace sentinel`)
      }
      if (rel.includes('{{') || rel.includes('}}')) {
        offenders.push(`${rel}: unrendered name`)
      }
    }

    expect(offenders).toEqual([])
  })

  it('produce no .hbs files', () => {
    const dest = path.join(getTmpDir(), 'out')
    renderDirectory(path.join(TEMPLATES_DIR, relDir), dest, context)

    expect(walkFiles(dest).filter((f) => f.endsWith('.hbs'))).toEqual([])
  })
})

/**
 * hey-api derives its exported names from the OpenAPI operationId by
 * camelCasing it: `blog_posts_list` becomes `blogPostsList`. The hook
 * templates must interpolate the camelCase plural to match.
 *
 * Single-word resources hide any mistake here, because their snake_case and
 * camelCase plurals are identical — so this asserts on a multi-word name.
 */
describe('generated API hooks match hey-api naming', () => {
  const getTmpDir = useTmpDir()

  const MULTI_WORD = { ...generateNames('BlogPost'), projectName: 'my-app' }

  function renderHooks() {
    const dest = path.join(getTmpDir(), 'hooks')
    renderDirectory(path.join(TEMPLATES_DIR, 'resource', 'api-hooks'), dest, MULTI_WORD)
    return walkFiles(dest)
      .map((f) => fs.readFileSync(f, 'utf-8'))
      .join('\n')
  }

  it('imports camelCase query and mutation helpers', () => {
    const hooks = renderHooks()

    for (const name of [
      'blogPostsListOptions',
      'blogPostsRetrieveOptions',
      'blogPostsCreateMutation',
      'blogPostsUpdateMutation',
      'blogPostsDestroyMutation',
      'blogPostsListQueryKey',
      'blogPostsRetrieveQueryKey',
    ]) {
      expect(hooks, name).toContain(name)
    }
  })

  it('never emits a snake_case identifier', () => {
    // `blog_postsListOptions` does not exist in the generated client, so this
    // would be an import of a missing member and the frontend would not build.
    expect(renderHooks()).not.toMatch(/blog_posts[A-Z]/)
  })
})

describe('generated test files', () => {
  const getTmpDir = useTmpDir()

  it('gives the backend a pytest config, test settings and conftest', () => {
    const dest = path.join(getTmpDir(), 'backend')
    renderDirectory(path.join(TEMPLATES_DIR, 'backend', 'django'), dest, PROJECT_CONTEXT)

    expect(fs.existsSync(path.join(dest, 'pytest.ini'))).toBe(true)
    expect(fs.existsSync(path.join(dest, 'conftest.py'))).toBe(true)
    expect(fs.existsSync(path.join(dest, 'config', 'settings', 'test.py'))).toBe(true)
    expect(fs.existsSync(path.join(dest, 'apps', 'users', 'tests.py'))).toBe(true)
  })

  it('gives the Express backend a vitest config, setup and specs', () => {
    const dest = path.join(getTmpDir(), 'backend-express')
    renderDirectory(path.join(TEMPLATES_DIR, 'backend', 'express'), dest, EXPRESS_CONTEXT)

    expect(fs.existsSync(path.join(dest, 'vitest.config.ts'))).toBe(true)
    expect(fs.existsSync(path.join(dest, 'src', '__tests__', 'setup.ts'))).toBe(true)
    expect(fs.existsSync(path.join(dest, 'prisma', 'schema.prisma'))).toBe(true)
    expect(
      fs.existsSync(path.join(dest, 'src', 'modules', 'auth', '__tests__', 'auth.spec.ts'))
    ).toBe(true)

    const specs = walkFiles(dest).filter((f) => /\.spec\.ts$/.test(f))
    expect(specs.length).toBeGreaterThan(0)
  })

  it('gives the FastAPI backend pytest tests that exercise the API', () => {
    const dest = path.join(getTmpDir(), 'backend-fastapi')
    renderDirectory(path.join(TEMPLATES_DIR, 'backend', 'fastapi'), dest, FASTAPI_CONTEXT)

    const testFile = path.join(dest, 'tests', 'test_auth.py')
    expect(fs.existsSync(testFile)).toBe(true)

    // A real API exercise through TestClient, not an empty placeholder — so
    // `blacksmith test` has something to run and to fail on.
    const tests = fs.readFileSync(testFile, 'utf-8')
    expect(tests).toContain('from fastapi.testclient import TestClient')
    expect(tests).toContain('def test_register_login_and_me')
    expect(tests).toContain('def test_login_rejects_wrong_password')
    expect(tests).toContain('assert register.status_code == 201')
    expect(tests).toContain('assert bad.status_code == 401')

    // All tests share one session-scoped sqlite database, so each test must
    // register its own email — a reused one would make the second test's setup
    // registration a silent duplicate-email 400 no-op.
    const emails = [...tests.matchAll(/"email": "([^"]+)"/g)].map((m) => m[1])
    expect(new Set(emails).size).toBeGreaterThanOrEqual(2)

    // And each test asserts its own registration succeeded, so a broken
    // register endpoint fails the test instead of passing for the wrong reason.
    const registerAsserts = tests.match(/assert register\.status_code == 201/g) ?? []
    expect(registerAsserts.length).toBeGreaterThanOrEqual(2)
  })

  it('gives the FastAPI backend a conftest so bare pytest finds the app package', () => {
    const dest = path.join(getTmpDir(), 'backend-fastapi-conftest')
    renderDirectory(path.join(TEMPLATES_DIR, 'backend', 'fastapi'), dest, FASTAPI_CONTEXT)

    // CI runs plain `pytest` (no `python -m`), which does not put the backend
    // directory on sys.path by itself — the root conftest.py is what makes
    // `import app` resolve, exactly as it does for the Django backend.
    const conftestFile = path.join(dest, 'conftest.py')
    expect(fs.existsSync(conftestFile)).toBe(true)
    const conftest = fs.readFileSync(conftestFile, 'utf-8')
    expect(conftest).toContain('import os')
    expect(conftest).toContain('os.environ["DATABASE_URL"]')
    expect(conftest).toContain('os.environ["SECRET_KEY"]')

    // The env setup must live in one place, loaded before any test module, so
    // test files stay free of import-order tricks.
    const tests = fs.readFileSync(path.join(dest, 'tests', 'test_auth.py'), 'utf-8')
    expect(tests).not.toContain('os.environ')
  })

  it('keeps the markers make:resource writes into', () => {
    const dest = path.join(getTmpDir(), 'backend-express')
    renderDirectory(path.join(TEMPLATES_DIR, 'backend', 'express'), dest, EXPRESS_CONTEXT)

    const schema = fs.readFileSync(path.join(dest, 'prisma', 'schema.prisma'), 'utf-8')
    expect(schema).toContain('// blacksmith:models')

    const router = fs.readFileSync(path.join(dest, 'src', 'modules', 'index.ts'), 'utf-8')
    expect(router).toContain('// blacksmith:import')
    expect(router).toContain('// blacksmith:routes')
  })

  it('ships frontend specs so a fresh project has tests to run', () => {
    const dest = path.join(getTmpDir(), 'frontend')
    renderDirectory(path.join(TEMPLATES_DIR, 'frontend'), dest, PROJECT_CONTEXT)

    const specs = walkFiles(dest).filter((f) => /\.spec\.tsx?$/.test(f))
    expect(specs.length).toBeGreaterThan(0)
  })

  it('renders the Python f-string helper in resource tests correctly', () => {
    const dest = path.join(getTmpDir(), 'resource')
    renderDirectory(path.join(TEMPLATES_DIR, 'resource', 'backend', 'django'), dest, RESOURCE_CONTEXT)

    const tests = fs.readFileSync(path.join(dest, 'tests.py'), 'utf-8')
    expect(tests).toContain("return f'/api/products/{ product.id }/'")
  })

  it('renders the Express resource module with substituted names', () => {
    const dest = path.join(getTmpDir(), 'module')
    renderDirectory(
      path.join(TEMPLATES_DIR, 'resource', 'backend', 'express'),
      dest,
      RESOURCE_CONTEXT
    )

    for (const file of [
      'products.schemas.ts',
      'products.service.ts',
      'products.controller.ts',
      'products.routes.ts',
      path.join('__tests__', 'products.spec.ts'),
    ]) {
      expect(fs.existsSync(path.join(dest, file)), file).toBe(true)
    }

    const routes = fs.readFileSync(path.join(dest, 'products.routes.ts'), 'utf-8')
    // Operation ids must match what drf-spectacular emits, or the generated
    // React hooks come out under different names.
    expect(routes).toContain("operationId: 'products_list'")
    expect(routes).toContain("operationId: 'products_partial_update'")
    expect(routes).toContain("const DETAIL_PATH = '/api/products/{id}/'")
    expect(routes).toContain('export const productsRouter')
  })

  it('renders the Prisma model for a resource', () => {
    const model = renderTemplateFile(
      path.join(TEMPLATES_DIR, 'resource', 'backend', 'express.prisma.hbs'),
      RESOURCE_CONTEXT
    )

    expect(model).toContain('model Product {')
    expect(model).toContain('@@map("products")')
    expect(model).toContain('created_by    User')
    expect(model).not.toMatch(/\{\{/)
  })

  it('renders resource frontend specs with substituted names', () => {
    const dest = path.join(getTmpDir(), 'pages')
    renderDirectory(path.join(TEMPLATES_DIR, 'resource', 'pages'), dest, RESOURCE_CONTEXT)

    const card = path.join(dest, 'components', '__tests__', 'product-card.spec.tsx')
    expect(fs.existsSync(card)).toBe(true)
    expect(fs.readFileSync(card, 'utf-8')).toContain('<ProductCard product={item} />')
  })
})
