import path from 'node:path'
import fs from 'node:fs'
import { findProjectRoot, getBackendDir, getFrontendDir, getTemplatesDir } from '../utils/paths.js'
import { generateNames } from '../utils/names.js'
import { renderDirectory, appendAfterMarker, insertBeforeMarker } from '../utils/template.js'
import { exec, execPython } from '../utils/exec.js'
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
  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)
  const templatesDir = getTemplatesDir()

  const backendAppDir = path.join(backendDir, 'apps', names.snakes)

  // Check if backend resource already exists
  if (fs.existsSync(backendAppDir)) {
    log.error(`Backend app "${names.snakes}" already exists.`)
    process.exit(1)
  }

  const frontendPageDir = path.join(frontendDir, 'src', 'pages', names.kebabs)

  if (fs.existsSync(frontendPageDir)) {
    log.error(`Frontend page "${names.kebabs}" already exists.`)
    process.exit(1)
  }

  const context = { ...names, projectName: name }

  // 1. Generate backend app
  const backendSpinner = spinner(`Creating backend app: apps/${names.snakes}/`)
  try {
    renderDirectory(
      path.join(templatesDir, 'resource', 'backend'),
      backendAppDir,
      context
    )
    backendSpinner.succeed(`Created backend/apps/${names.snakes}/`)
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

  // 5. Sync OpenAPI (generate schema offline, no running Django needed)
  const syncSpinner = spinner('Syncing OpenAPI schema...')
  try {
    const schemaPath = path.join(frontendDir, '_schema.yml')
    await execPython(['manage.py', 'spectacular', '--file', schemaPath], backendDir, true)

    const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
    const configBackup = fs.readFileSync(configPath, 'utf-8')
    const configWithFile = configBackup.replace(
      /path:\s*['"]http[^'"]+['"]/,
      `path: './_schema.yml'`
    )
    fs.writeFileSync(configPath, configWithFile, 'utf-8')

    try {
      await exec(process.execPath, [path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')], {
        cwd: frontendDir,
        silent: true,
      })
    } finally {
      fs.writeFileSync(configPath, configBackup, 'utf-8')
      if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath)
    }

    syncSpinner.succeed('Frontend types and hooks regenerated')
  } catch {
    syncSpinner.warn('Could not sync OpenAPI. Run "blacksmith sync" manually.')
  }

  // 6. Generate frontend page
  const frontendSpinner = spinner(`Creating frontend page: pages/${names.kebabs}/`)
  try {
    renderDirectory(
      path.join(templatesDir, 'resource', 'pages'),
      frontendPageDir,
      context
    )
    frontendSpinner.succeed(`Created frontend/src/pages/${names.kebabs}/`)
  } catch (error: any) {
    frontendSpinner.fail('Failed to create frontend page')
    log.error(error.message)
    process.exit(1)
  }

  // 7. Register routes in frontend router
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
    routeSpinner.warn('Could not auto-register routes. Add them manually to frontend/src/router/routes.tsx')
  }

  // 8. Print summary
  log.blank()
  log.success(`Resource "${names.Name}" created successfully!`)
  log.blank()
}
