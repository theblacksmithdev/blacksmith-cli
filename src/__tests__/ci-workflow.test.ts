import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { useTmpDir } from './helpers.js'
import { backendTemplateDir, ensureCiWorkflow, projectLayout } from '../utils/scaffold.js'
import type { BackendFramework, ProjectType } from '../utils/paths.js'

function render(dir: string, type: ProjectType, framework: BackendFramework = 'django') {
  ensureCiWorkflow(dir, { projectName: 'my-app', ...projectLayout(type, framework) })
  return fs.readFileSync(path.join(dir, '.github', 'workflows', 'ci.yml'), 'utf-8')
}

describe('CI workflow template', () => {
  const getTmpDir = useTmpDir()

  it('emits a literal GitHub expression for the concurrency group', () => {
    const yaml = render(getTmpDir(), 'fullstack')
    expect(yaml).toContain('group: ci-${{ github.ref }}')
  })

  it('leaves no unrendered Handlebars behind', () => {
    for (const type of ['fullstack', 'backend', 'frontend'] as ProjectType[]) {
      const dir = path.join(getTmpDir(), type)
      fs.mkdirSync(dir, { recursive: true })
      const yaml = render(dir, type)
      // `${{ ... }}` is a GitHub Actions expression and must survive; only a
      // bare `{{ ... }}` means a Handlebars variable was left unrendered.
      expect(yaml, type).not.toMatch(/(?<!\$)\{\{\s*[#/]?[a-zA-Z_][\w.]*\s*\}\}/)
      expect(yaml, type).not.toContain('BLACKSMITH_')
    }
  })

  it('runs both suites for a fullstack project, in the right directories', () => {
    const yaml = render(getTmpDir(), 'fullstack')
    expect(yaml).toContain('working-directory: backend')
    expect(yaml).toContain('working-directory: frontend')
    expect(yaml).toContain('run: pytest --cov --cov-report=term-missing')
    expect(yaml).toContain('run: npm run test')
    // The generated client is git-ignored, so CI must rebuild it
    expect(yaml).toContain('manage.py spectacular')
  })

  it('omits the frontend job for a backend-only project', () => {
    const yaml = render(getTmpDir(), 'backend')
    expect(yaml).toContain('backend:')
    expect(yaml).not.toContain('frontend:')
    expect(yaml).toContain('working-directory: .')
  })

  it('omits the backend job and the schema step for a frontend-only project', () => {
    const yaml = render(getTmpDir(), 'frontend')
    expect(yaml).toContain('frontend:')
    expect(yaml).not.toContain('pytest')
    expect(yaml).not.toContain('manage.py spectacular')
  })

  it('never overwrites an existing workflow', () => {
    const dir = getTmpDir()
    render(dir, 'fullstack')
    const dest = path.join(dir, '.github', 'workflows', 'ci.yml')
    fs.writeFileSync(dest, '# hand written\n')

    expect(ensureCiWorkflow(dir, { projectName: 'x', ...projectLayout('fullstack') })).toBe(false)
    expect(fs.readFileSync(dest, 'utf-8')).toBe('# hand written\n')
  })
})

describe('projectLayout', () => {
  it('defaults to Django so existing callers are unchanged', () => {
    const layout = projectLayout('fullstack')

    expect(layout.backendFramework).toBe('django')
    expect(layout.isDjango).toBe(true)
    expect(layout.isExpress).toBe(false)
  })

  it('flags an Express backend for templates to branch on', () => {
    const layout = projectLayout('fullstack', 'express')

    expect(layout.isExpress).toBe(true)
    expect(layout.isDjango).toBe(false)
  })
})

describe('backendTemplateDir', () => {
  it('keeps the original directory name for Django', () => {
    expect(backendTemplateDir('django')).toBe('backend')
  })

  it('resolves Express to its own template directory', () => {
    expect(backendTemplateDir('express')).toBe('backend-express')
  })
})

describe('CI workflow for an Express backend', () => {
  const getTmpDir = useTmpDir()

  function renderIn(type: ProjectType) {
    const dir = path.join(getTmpDir(), type)
    fs.mkdirSync(dir, { recursive: true })
    return render(dir, type, 'express')
  }

  it('leaves no unrendered Handlebars behind', () => {
    for (const type of ['fullstack', 'backend', 'frontend'] as ProjectType[]) {
      const yaml = renderIn(type)
      expect(yaml, type).not.toMatch(/(?<!\$)\{\{\s*[#/]?[a-zA-Z_][\w.]*\s*\}\}/)
      expect(yaml, type).not.toContain('BLACKSMITH_')
    }
  })

  it('runs the Node toolchain for the backend, never Python', () => {
    const yaml = renderIn('backend')

    expect(yaml).toContain('name: Backend (vitest)')
    expect(yaml).toContain('npx prisma generate')
    expect(yaml).toContain('run: npm run test')
    expect(yaml).not.toContain('setup-python')
    expect(yaml).not.toContain('pytest')
    expect(yaml).not.toContain('requirements.txt')
    expect(yaml).not.toContain('manage.py')
  })

  it('exports the schema with the Express generator on a fullstack project', () => {
    const yaml = renderIn('fullstack')

    expect(yaml).toContain('npm run openapi -- ../frontend/_schema.json')
    expect(yaml).toContain('npx openapi-ts --input _schema.json')
    // The JSON schema name and the Django YAML one must not be mixed up
    expect(yaml).not.toContain('_schema.yml')
    expect(yaml).not.toContain('spectacular')
  })

  it('caches both lockfiles in the fullstack frontend job', () => {
    const yaml = renderIn('fullstack')

    expect(yaml).toContain('backend/package-lock.json')
    expect(yaml).toContain('frontend/package-lock.json')
  })

  it('omits the backend job entirely for a frontend-only project', () => {
    const yaml = renderIn('frontend')

    expect(yaml).not.toContain('Backend (vitest)')
    expect(yaml).toContain('Frontend (vitest)')
    expect(yaml).not.toContain('prisma')
  })
})

describe('CI workflow schema filenames', () => {
  const getTmpDir = useTmpDir()

  // The exported filename comes from one helper, so the workflow and the
  // `sync` command cannot drift apart.
  it('uses the YAML name for Django and the JSON name for Express', () => {
    const django = path.join(getTmpDir(), 'dj')
    const express = path.join(getTmpDir(), 'ex')
    fs.mkdirSync(django, { recursive: true })
    fs.mkdirSync(express, { recursive: true })

    expect(render(django, 'fullstack', 'django')).toContain('_schema.yml')
    expect(render(express, 'fullstack', 'express')).toContain('_schema.json')
  })
})

/**
 * The workflow is assembled from Handlebars blocks, so a misplaced newline or
 * a wrongly indented branch produces a file that reads fine but does not
 * parse. String assertions cannot catch that; parsing can.
 */
describe('generated CI workflow is valid YAML', () => {
  const getTmpDir = useTmpDir()

  const combinations: Array<[ProjectType, BackendFramework, string[]]> = [
    ['fullstack', 'django', ['backend', 'frontend']],
    ['fullstack', 'express', ['backend', 'frontend']],
    ['backend', 'django', ['backend']],
    ['backend', 'express', ['backend']],
    ['frontend', 'django', ['frontend']],
    ['frontend', 'express', ['frontend']],
  ]

  it.each(combinations)('parses for %s / %s', (type, framework, expectedJobs) => {
    const dir = path.join(getTmpDir(), `${type}-${framework}`)
    fs.mkdirSync(dir, { recursive: true })

    const doc = YAML.parse(render(dir, type, framework))

    expect(Object.keys(doc.jobs)).toEqual(expectedJobs)
    // Every job must have real steps — an empty list means a branch collapsed
    for (const job of expectedJobs) {
      expect(doc.jobs[job].steps.length, job).toBeGreaterThan(2)
    }
  })

  it('keeps the GitHub expression in the concurrency group intact', () => {
    const doc = YAML.parse(render(getTmpDir(), 'fullstack', 'express'))

    expect(doc.concurrency.group).toBe('ci-${{ github.ref }}')
  })
})
