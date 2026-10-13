import fs from 'node:fs'
import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, getFrontendFramework, getTemplatesDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { generateNames } from '../utils/names.js'
import { RESOURCE_BACKENDS } from '../utils/resource-backends.js'
import { generateFrontendResource, resourcePageDir } from '../utils/resource-frontend.js'
import { syncFrontendClient } from '../utils/openapi.js'
import { log, spinner } from '../utils/logger.js'

export async function makeResource(name: string) {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const names = generateNames(name)
  const templatesDir = getTemplatesDir()
  const projectHasBackend = hasBackend(root)
  const projectHasFrontend = hasFrontend(root)
  const backendFramework = projectHasBackend ? getBackendFramework(root) : 'django'
  const resourceBackend = RESOURCE_BACKENDS[backendFramework]

  const context = { ...names, projectName: name }

  // Check if resources already exist
  const backendResourceDir = projectHasBackend
    ? resourceBackend.dir(getBackendDir(root), names)
    : null

  if (backendResourceDir && fs.existsSync(backendResourceDir)) {
    log.error(resourceBackend.existsMessage(names))
    process.exit(1)
  }

  if (projectHasFrontend) {
    if (fs.existsSync(resourcePageDir(getFrontendDir(root), names))) {
      log.error(`Frontend page "${names.kebabs}" already exists.`)
      process.exit(1)
    }
  }

  // Backend resource generation
  if (backendResourceDir) {
    await resourceBackend.generate({
      backendDir: getBackendDir(root),
      resourceDir: backendResourceDir,
      templatesDir,
      names,
      context,
    })
  }

  // 5. Sync OpenAPI (only for fullstack projects)
  if (projectHasBackend && projectHasFrontend) {
    const backendDir = getBackendDir(root)
    const frontendDir = getFrontendDir(root)
    const syncSpinner = spinner('Syncing OpenAPI schema...')
    try {
      await syncFrontendClient(backendDir, frontendDir, backendFramework)
      syncSpinner.succeed('Frontend types and hooks regenerated')
    } catch {
      syncSpinner.warn('Could not sync OpenAPI. Run "blacksmith sync" manually.')
    }
  }

  // Frontend resource generation
  if (projectHasFrontend) {
    generateFrontendResource({
      frontendDir: getFrontendDir(root),
      framework: getFrontendFramework(root),
      templatesDir,
      names,
      context,
    })
  }

  // 10. Print summary
  log.blank()
  log.success(`Resource "${names.Name}" created successfully!`)
  log.blank()
}
