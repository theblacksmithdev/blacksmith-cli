import path from 'node:path'
import type { FrontendFramework } from './paths.js'
import type { NameVariants } from './names.js'
import { renderDirectory, insertBeforeMarker } from './template.js'
import { resourceFrontendTemplateDir } from './scaffold.js'
import { FRONTEND_TOOLCHAINS } from './frontend-toolchains.js'
import { log, spinner } from './logger.js'

export interface ResourceFrontendArgs {
  frontendDir: string
  framework: FrontendFramework
  templatesDir: string
  names: NameVariants
  context: Record<string, unknown>
}

/** The resource's page directory; an existing one is refused. */
export function resourcePageDir(frontendDir: string, names: NameVariants): string {
  return path.join(frontendDir, 'src', 'pages', names.kebabs)
}

/**
 * Scaffold the frontend half of a resource: its query and mutation code, its
 * pages, and its path and routes, registered at the router's markers.
 */
export function generateFrontendResource({ frontendDir, framework, templatesDir, names, context }: ResourceFrontendArgs) {
  const { apiDir, apiLabel, routesFile } = FRONTEND_TOOLCHAINS[framework].resource
  const templateDir = path.join(templatesDir, resourceFrontendTemplateDir(framework))

  // 1. Query and mutation code
  const apiPath = path.join(apiDir, names.kebabs)
  const apiSpinner = spinner(`Creating ${apiLabel}: ${apiPath}/`)
  try {
    renderDirectory(path.join(templateDir, 'api'), path.join(frontendDir, 'src', apiPath), context)
    apiSpinner.succeed(`Created src/${apiPath}/`)
  } catch (error: any) {
    apiSpinner.fail(`Failed to create ${apiLabel}`)
    log.error(error.message)
    process.exit(1)
  }

  // 2. Pages
  const pageSpinner = spinner(`Creating frontend page: pages/${names.kebabs}/`)
  try {
    renderDirectory(path.join(templateDir, 'pages'), resourcePageDir(frontendDir, names), context)
    pageSpinner.succeed(`Created src/pages/${names.kebabs}/`)
  } catch (error: any) {
    pageSpinner.fail('Failed to create frontend page')
    log.error(error.message)
    process.exit(1)
  }

  // 3. Register the path in the paths enum
  const pathSpinner = spinner('Registering route path...')
  try {
    insertBeforeMarker(
      path.join(frontendDir, 'src', 'router', 'paths.ts'),
      '// blacksmith:path',
      `  ${names.Names} = '/${names.kebabs}',`
    )
    pathSpinner.succeed('Registered route path')
  } catch {
    pathSpinner.warn('Could not auto-register path. Add it manually to src/router/paths.ts')
  }

  // 4. Register the routes in the router
  const routeSpinner = spinner('Registering frontend routes...')
  try {
    const routesPath = path.join(frontendDir, 'src', routesFile)
    insertBeforeMarker(routesPath, '// blacksmith:import', `import { ${names.names}Routes } from '@/pages/${names.kebabs}'`)
    insertBeforeMarker(routesPath, '// blacksmith:routes', `  ...${names.names}Routes,`)
    routeSpinner.succeed('Registered frontend routes')
  } catch {
    routeSpinner.warn(`Could not auto-register routes. Add them manually to src/${routesFile}`)
  }
}
