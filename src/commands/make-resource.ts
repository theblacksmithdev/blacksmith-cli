import path from 'node:path'
import fs from 'node:fs'
import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, getTemplatesDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { generateNames } from '../utils/names.js'
import { renderDirectory, insertBeforeMarker } from '../utils/template.js'
import { RESOURCE_BACKENDS } from '../utils/resource-backends.js'
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
    const frontendDir = getFrontendDir(root)
    const frontendPageDir = path.join(frontendDir, 'src', 'pages', names.kebabs)
    if (fs.existsSync(frontendPageDir)) {
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
    const frontendDir = getFrontendDir(root)

    // 6. Generate API hooks
    const apiHooksDir = path.join(frontendDir, 'src', 'api', 'hooks', names.kebabs)
    const apiHooksSpinner = spinner(`Creating API hooks: api/hooks/${names.kebabs}/`)
    try {
      renderDirectory(
        path.join(templatesDir, 'resource', 'api-hooks'),
        apiHooksDir,
        context
      )
      apiHooksSpinner.succeed(`Created src/api/hooks/${names.kebabs}/`)
    } catch (error: any) {
      apiHooksSpinner.fail('Failed to create API hooks')
      log.error(error.message)
      process.exit(1)
    }

    // 7. Generate frontend page
    const frontendPageDir = path.join(frontendDir, 'src', 'pages', names.kebabs)
    const frontendSpinner = spinner(`Creating frontend page: pages/${names.kebabs}/`)
    try {
      renderDirectory(
        path.join(templatesDir, 'resource', 'pages'),
        frontendPageDir,
        context
      )
      frontendSpinner.succeed(`Created src/pages/${names.kebabs}/`)
    } catch (error: any) {
      frontendSpinner.fail('Failed to create frontend page')
      log.error(error.message)
      process.exit(1)
    }

    // 8. Register path in paths enum
    const pathSpinner = spinner('Registering route path...')
    try {
      const pathsFile = path.join(frontendDir, 'src', 'router', 'paths.ts')
      insertBeforeMarker(
        pathsFile,
        '// blacksmith:path',
        `  ${names.Names} = '/${names.kebabs}',`
      )
      pathSpinner.succeed('Registered route path')
    } catch {
      pathSpinner.warn('Could not auto-register path. Add it manually to src/router/paths.ts')
    }

    // 9. Register routes in frontend router
    const routeSpinner = spinner('Registering frontend routes...')
    try {
      const routesPath = path.join(frontendDir, 'src', 'router', 'routes.tsx')
      insertBeforeMarker(
        routesPath,
        '// blacksmith:import',
        `import { ${names.names}Routes } from '@/pages/${names.kebabs}'`
      )
      insertBeforeMarker(
        routesPath,
        '// blacksmith:routes',
        `  ...${names.names}Routes,`
      )
      routeSpinner.succeed('Registered frontend routes')
    } catch {
      routeSpinner.warn('Could not auto-register routes. Add them manually to src/router/routes.tsx')
    }
  }

  // 10. Print summary
  log.blank()
  log.success(`Resource "${names.Name}" created successfully!`)
  log.blank()
}
