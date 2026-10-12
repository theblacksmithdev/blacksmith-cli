import path from 'node:path'
import fs from 'node:fs'
import type { BackendFramework } from './paths.js'
import type { NameVariants } from './names.js'
import { renderDirectory, renderTemplateFile, appendAfterMarker, insertBeforeMarker } from './template.js'
import { exec, execGradle, execPython } from './exec.js'
import { alembicAutogenerate, alembicUpgrade } from './alembic.js'
import { resourcePrismaTemplate, resourceTemplateDir } from './scaffold.js'
import { FLYWAY_MIGRATIONS_DIR, nextFlywayVersion, springResourceDir, springResourcePackage } from './spring.js'
import { log, spinner } from './logger.js'

export interface ResourceBackendArgs {
  backendDir: string
  /** Where the resource's backend code lands (`ResourceBackend.dir`). */
  resourceDir: string
  templatesDir: string
  names: NameVariants
  context: Record<string, unknown>
}

/** How `make:resource` generates the backend half of a resource, per framework. */
export interface ResourceBackend {
  /** The directory that holds the resource's code; an existing one is refused. */
  dir(backendDir: string, names: NameVariants): string
  /** The error printed when that directory already exists. */
  existsMessage(names: NameVariants): string
  generate(args: ResourceBackendArgs): Promise<void>
}

/**
 * Scaffold a Django resource: an app, registered in INSTALLED_APPS and the URL
 * conf, and the migration that creates its table.
 */
async function generateDjangoResource({
  backendDir,
  resourceDir,
  templatesDir,
  names,
  context,
}: ResourceBackendArgs) {
  // 1. Generate backend app
  const backendSpinner = spinner(`Creating backend app: apps/${names.snakes}/`)
  try {
    renderDirectory(
      path.join(templatesDir, resourceTemplateDir('django')),
      resourceDir,
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

/**
 * Scaffold an Express resource: a module directory, a Prisma model, a mounted
 * router, and the migration that creates the table.
 */
async function generateExpressResource({
  backendDir,
  resourceDir,
  templatesDir,
  names,
  context,
}: ResourceBackendArgs) {
  // 1. Module (schemas, service, controller, routes, tests)
  const moduleSpinner = spinner(`Creating backend module: src/modules/${names.kebabs}/`)
  try {
    renderDirectory(
      path.join(templatesDir, resourceTemplateDir('express')),
      resourceDir,
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
      path.join(templatesDir, resourcePrismaTemplate()),
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

/**
 * Scaffold a FastAPI resource: a package under `app/` (model, schemas,
 * service, router) and its test module, a mounted router, and an Alembic
 * migration that creates the table.
 */
async function generateFastapiResource({
  backendDir,
  templatesDir,
  names,
  context,
}: ResourceBackendArgs) {
  // Projects scaffolded before resources shipped create tables with
  // create_all and have no migrations to add this one to. Stop before
  // writing anything rather than leave a half-wired resource behind.
  if (!fs.existsSync(path.join(backendDir, 'alembic.ini'))) {
    log.error('This FastAPI backend has no Alembic migrations, which make:resource needs.')
    log.step('Copy alembic.ini and migrations/ from a project created with "blacksmith init --backend fastapi".')
    process.exit(1)
  }

  // 1. Package and tests. The template tree mirrors the backend root, so
  // `app/<resource>/` and `tests/test_<resource>.py` land in one pass.
  const packageSpinner = spinner(`Creating backend package: app/${names.snakes}/`)
  try {
    renderDirectory(
      path.join(templatesDir, resourceTemplateDir('fastapi')),
      backendDir,
      context
    )
    packageSpinner.succeed(`Created app/${names.snakes}/ and tests/test_${names.snakes}.py`)
  } catch (error: any) {
    packageSpinner.fail('Failed to create backend package')
    log.error(error.message)
    process.exit(1)
  }

  // 2. Mount the router
  const routeSpinner = spinner('Registering API routes...')
  try {
    const mainPath = path.join(backendDir, 'app', 'main.py')
    insertBeforeMarker(
      mainPath,
      '# blacksmith:import',
      `from app.${names.snakes}.router import router as ${names.snakes}_router`
    )
    insertBeforeMarker(
      mainPath,
      '# blacksmith:routers',
      `app.include_router(${names.snakes}_router, prefix="/api/${names.snakes}", tags=["${names.snakes}"])`
    )
    routeSpinner.succeed(`Registered /api/${names.snakes}/`)
  } catch (error: any) {
    routeSpinner.fail('Failed to register API routes')
    log.error(error.message)
    process.exit(1)
  }

  // 3. Migrate: autogenerate sees the new model through the mounted router
  const migrateSpinner = spinner('Running migrations...')
  try {
    await alembicAutogenerate(backendDir, `add ${names.snakes}`)
    await alembicUpgrade(backendDir)
    migrateSpinner.succeed('Migrations complete')
  } catch (error: any) {
    migrateSpinner.fail('Migration failed')
    log.error(error.message)
    process.exit(1)
  }
}

/**
 * Scaffold a Spring Boot resource: a package under `app` (entity, repository,
 * request and response records, service, controller), its API test, and the
 * Flyway migration that creates the table. Spring finds the controller by
 * component scanning, so nothing needs registering, and Flyway applies the
 * migration when the application next starts.
 */
async function generateSpringResource({ backendDir, templatesDir, names, context }: ResourceBackendArgs) {
  const javaPackage = springResourcePackage(names)
  const migrationVersion = nextFlywayVersion(backendDir)

  // 1. Package, test and migration. The template tree mirrors the backend root.
  const packageSpinner = spinner(`Creating backend package: app.${javaPackage}`)
  try {
    renderDirectory(
      path.join(templatesDir, resourceTemplateDir('spring')),
      backendDir,
      { ...context, javaPackage, migrationVersion }
    )
    packageSpinner.succeed(`Created app.${javaPackage}, its test, and migration V${migrationVersion} in ${FLYWAY_MIGRATIONS_DIR}`)
  } catch (error: any) {
    packageSpinner.fail('Failed to create backend package')
    log.error(error.message)
    process.exit(1)
  }

  // 2. Compile, so a name that clashes with Java or Spring fails here, not at the next start
  const compileSpinner = spinner('Compiling...')
  try {
    await execGradle(['classes', '--console=plain'], backendDir, true)
    compileSpinner.succeed('Compiled')
  } catch (error: any) {
    compileSpinner.fail('Compilation failed')
    log.error(error.message)
    process.exit(1)
  }
}

export const RESOURCE_BACKENDS: Record<BackendFramework, ResourceBackend> = {
  django: {
    dir: (backendDir, names) => path.join(backendDir, 'apps', names.snakes),
    existsMessage: (names) => `Backend app "${names.snakes}" already exists.`,
    generate: generateDjangoResource,
  },
  express: {
    dir: (backendDir, names) => path.join(backendDir, 'src', 'modules', names.kebabs),
    existsMessage: (names) => `Backend module "${names.kebabs}" already exists.`,
    generate: generateExpressResource,
  },
  fastapi: {
    dir: (backendDir, names) => path.join(backendDir, 'app', names.snakes),
    existsMessage: (names) => `Backend package "app/${names.snakes}" already exists.`,
    generate: generateFastapiResource,
  },
  spring: {
    dir: springResourceDir,
    existsMessage: (names) => `Backend package "app.${springResourcePackage(names)}" already exists.`,
    generate: generateSpringResource,
  },
}
