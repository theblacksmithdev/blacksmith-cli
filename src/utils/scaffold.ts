import fs from 'node:fs'
import path from 'node:path'
import { getTemplatesDir } from './paths.js'
import type { BackendFramework, ProjectType } from './paths.js'
import { renderToFile } from './template.js'
import { schemaFileName } from './openapi.js'

/**
 * Template context describing the shape of a project. Templates that differ
 * between fullstack and single-stack layouts (the CI workflow, for one) branch
 * on these rather than re-deriving the layout themselves.
 */
export function projectLayout(
  projectType: ProjectType,
  backendFramework: BackendFramework = 'django'
) {
  const isFullstack = projectType === 'fullstack'
  const needsBackend = isFullstack || projectType === 'backend'
  const needsFrontend = isFullstack || projectType === 'frontend'

  return {
    projectType,
    isFullstack,
    needsBackend,
    needsFrontend,
    backendFramework,
    isDjango: backendFramework === 'django',
    isExpress: backendFramework === 'express',
    // Filename the CI workflow exports the OpenAPI document to
    schemaFile: schemaFileName(backendFramework === 'express'),
    // Paths relative to the project root, as CI working directories
    backendPath: isFullstack ? 'backend' : '.',
    frontendPath: isFullstack ? 'frontend' : '.',
  }
}

/**
 * Directory under the templates root holding a backend framework's templates.
 *
 * Django keeps the original `backend/` name so existing template paths and
 * generated projects are untouched.
 */
export function backendTemplateDir(framework: BackendFramework): string {
  return framework === 'express' ? 'backend-express' : 'backend'
}

/**
 * Write the GitHub Actions CI workflow if the project does not have one.
 *
 * Never overwrites an existing workflow — once generated, it belongs to the
 * user. Returns true when a file was written.
 */
export function ensureCiWorkflow(
  projectDir: string,
  context: Record<string, unknown>
): boolean {
  const destPath = path.join(projectDir, '.github', 'workflows', 'ci.yml')
  if (fs.existsSync(destPath)) return false

  const srcPath = path.join(
    getTemplatesDir(),
    'project',
    '.github',
    'workflows',
    'ci.yml.hbs'
  )
  if (!fs.existsSync(srcPath)) return false

  renderToFile(srcPath, destPath, context)
  return true
}
