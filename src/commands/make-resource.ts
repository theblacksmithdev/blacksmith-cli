import path from 'node:path'
import fs from 'node:fs'
import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, getTemplatesDir, hasBackend, hasFrontend } from '../utils/paths.js'
import { generateNames } from '../utils/names.js'
import { renderDirectory, renderTemplateFile, appendAfterMarker, insertBeforeMarker } from '../utils/template.js'
import { exec, execPython } from '../utils/exec.js'
import { syncFrontendClient } from '../utils/openapi.js'
import { log, spinner } from '../utils/logger.js'

interface ExpressResourceArgs {
  backendDir: string
  moduleDir: string
  templatesDir: string
  names: ReturnType<typeof generateNames>
  context: Record<string, unknown>
}

/**
 * Scaffold an Express resource: a module directory, a Prisma model, a mounted
 * router, and the migration that creates the table.
 */
async function generateExpressResource({
  backendDir,
  moduleDir,
  templatesDir,
  names,
  context,
}: ExpressResourceArgs) {
  // 1. Module (schemas, service, controller, routes, tests)
  const moduleSpinner = spinner(`Creating backend module: src/modules/${names.kebabs}/`)
  try {
    renderDirectory(
      path.join(templatesDir, 'resource', 'backend-express'),
      moduleDir,
      context
    )
    moduleSpinner.succeed(`Created src/modules/${names.kebabs}/`)
  } catch (error: any) {
    moduleSpinner.fail('Failed to create backend module')
    log.error(error.message)
    process.exit(1)
  }

  // 2. Prisma model, plus the back-relation the User model needs for it
  const schemaSpinner = spinner('Adding the Prisma model...')
  try {
    const schemaPath = path.join(backendDir, 'prisma', 'schema.prisma')
    const model = renderTemplateFile(
      path.join(templatesDir, 'resource', 'backend-express.prisma.hbs'),
      context
    )
    appendAfterMarker(schemaPath, '// blacksmith:models', model.trimEnd())
    // Prisma requires both sides of a relation to be declared. snake_case to
    // match every other field in the schema, per the express-prisma skill.
    appendAfterMarker(
      schemaPath,
      '// blacksmith:user-relations',
      `  ${names.snakes} ${names.Name}[]`
    )
    schemaSpinner.succeed(`Added the ${names.Name} model to prisma/schema.prisma`)
  } catch (error: any) {
    schemaSpinner.fail('Failed to add the Prisma model')
    log.error(error.message)
    process.exit(1)
  }

  // 3. Mount the router
  const routeSpinner = spinner('Registering API routes...')
  try {
    const routerPath = path.join(backendDir, 'src', 'modules', 'index.ts')
    insertBeforeMarker(
      routerPath,
      '// blacksmith:import',
      `import { ${names.names}Router } from './${names.kebabs}/${names.kebabs}.routes.js'`
    )
    insertBeforeMarker(
      routerPath,
      '// blacksmith:routes',
      `apiRouter.use('/${names.snakes}', ${names.names}Router)`
    )
    routeSpinner.succeed(`Registered /api/${names.snakes}/`)
  } catch (error: any) {
    routeSpinner.fail('Failed to register API routes')
    log.error(error.message)
    process.exit(1)
  }

  // 4. Migrate (which also regenerates the Prisma client)
  const migrateSpinner = spinner('Running migrations...')
  try {
    await exec(
      'npx',
      ['prisma', 'migrate', 'dev', '--name', `add_${names.snakes}`, '--skip-seed'],
      { cwd: backendDir, silent: true }
    )
    migrateSpinner.succeed('Migrations complete')
  } catch (error: any) {
    migrateSpinner.fail('Migration failed')
    log.error(error.message)
    process.exit(1)
  }
}

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
  const isExpressBackend = projectHasBackend && getBackendFramework(root) === 'express'

  const context = { ...names, projectName: name }

  // Check if resources already exist
  /** Where a resource's backend code lives, per framework. */
  const backendResourceDir = projectHasBackend
    ? isExpressBackend
      ? path.join(getBackendDir(root), 'src', 'modules', names.kebabs)
      : path.join(getBackendDir(root), 'apps', names.snakes)
    : null

  if (backendResourceDir && fs.existsSync(backendResourceDir)) {
    log.error(
      isExpressBackend
        ? `Backend module "${names.kebabs}" already exists.`
        : `Backend app "${names.snakes}" already exists.`
    )
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
  if (projectHasBackend && backendResourceDir && isExpressBackend) {
    await generateExpressResource({
      backendDir: getBackendDir(root),
      moduleDir: backendResourceDir,
      templatesDir,
      names,
      context,
    })
  } else if (projectHasBackend) {
    const backendDir = getBackendDir(root)
    const backendAppDir = path.join(backendDir, 'apps', names.snakes)

    // 1. Generate backend app
    const backendSpinner = spinner(`Creating backend app: apps/${names.snakes}/`)
    try {
      renderDirectory(
        path.join(templatesDir, 'resource', 'backend'),
        backendAppDir,
        context
      )
      backendSpinner.succeed(`Created apps/${names.snakes}/`)
    } catch (error: any) {
      backendSpinner.fail('Failed to create backend app')
      log.error(error.message)
      process.exit(1)
    }

    // 2. Register app in settings
    const registerSpinner = spinner('Registering app in Django settings...')
    try {
      const settingsPath = path.join(backendDir, 'config', 'settings', 'base.py')
      appendAfterMarker(
        settingsPath,
        '# blacksmith:apps',
        `    'apps.${names.snakes}',`
      )
      registerSpinner.succeed('Registered in INSTALLED_APPS')
    } catch (error: any) {
      registerSpinner.fail('Failed to register app in settings')
      log.error(error.message)
      process.exit(1)
    }

    // 3. Register URLs
    const urlSpinner = spinner('Registering API URLs...')
    try {
      const urlsPath = path.join(backendDir, 'config', 'urls.py')
      insertBeforeMarker(
        urlsPath,
        '# blacksmith:urls',
        `    path('api/${names.snakes}/', include('apps.${names.snakes}.urls')),`
      )
      urlSpinner.succeed('Registered API URLs')
    } catch (error: any) {
      urlSpinner.fail('Failed to register URLs')
      log.error(error.message)
      process.exit(1)
    }

    // 4. Run migrations
    const migrateSpinner = spinner('Running migrations...')
    try {
      await execPython(['manage.py', 'makemigrations', names.snakes], backendDir, true)
      await execPython(['manage.py', 'migrate'], backendDir, true)
      migrateSpinner.succeed('Migrations complete')
    } catch (error: any) {
      migrateSpinner.fail('Migration failed')
      log.error(error.message)
      process.exit(1)
    }
  }

  // 5. Sync OpenAPI (only for fullstack projects)
  if (projectHasBackend && projectHasFrontend) {
    const backendDir = getBackendDir(root)
    const frontendDir = getFrontendDir(root)
    const syncSpinner = spinner('Syncing OpenAPI schema...')
    try {
      await syncFrontendClient(backendDir, frontendDir, isExpressBackend)
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
