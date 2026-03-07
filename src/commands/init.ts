import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { renderDirectory } from '../utils/template.js'
import { exec, execPython, execPip, commandExists } from '../utils/exec.js'
import { getTemplatesDir } from '../utils/paths.js'
import { log, spinner, printNextSteps } from '../utils/logger.js'

export async function init(name: string) {
  const projectDir = path.resolve(process.cwd(), name)
  const backendDir = path.join(projectDir, 'backend')
  const frontendDir = path.join(projectDir, 'frontend')
  const templatesDir = getTemplatesDir()

  // Validate
  if (fs.existsSync(projectDir)) {
    log.error(`Directory "${name}" already exists.`)
    process.exit(1)
  }

  // Check prerequisites
  const checkSpinner = spinner('Checking prerequisites...')
  const hasPython = await commandExists('python3')
  const hasNode = await commandExists('node')
  const hasNpm = await commandExists('npm')

  if (!hasPython) {
    checkSpinner.fail('Python 3 is required but not found. Install it from https://python.org')
    process.exit(1)
  }

  if (!hasNode || !hasNpm) {
    checkSpinner.fail('Node.js and npm are required but not found. Install from https://nodejs.org')
    process.exit(1)
  }

  checkSpinner.succeed('Prerequisites OK (Python 3, Node.js, npm)')

  const context = {
    projectName: name,
  }

  // 1. Create project directory and config
  fs.mkdirSync(projectDir, { recursive: true })
  fs.writeFileSync(
    path.join(projectDir, 'blacksmith.config.json'),
    JSON.stringify(
      {
        name,
        version: '0.1.0',
        backend: { port: 8000 },
        frontend: { port: 5173 },
      },
      null,
      2
    )
  )

  // 2. Generate backend
  const backendSpinner = spinner('Generating Django backend...')
  try {
    renderDirectory(
      path.join(templatesDir, 'backend'),
      backendDir,
      context
    )

    // Copy .env.example to .env for development
    fs.copyFileSync(
      path.join(backendDir, '.env.example'),
      path.join(backendDir, '.env')
    )

    backendSpinner.succeed('Django backend generated')
  } catch (error: any) {
    backendSpinner.fail('Failed to generate backend')
    log.error(error.message)
    process.exit(1)
  }

  // 3. Create Python virtual environment
  const venvSpinner = spinner('Creating Python virtual environment...')
  try {
    await exec('python3', ['-m', 'venv', 'venv'], { cwd: backendDir, silent: true })
    venvSpinner.succeed('Virtual environment created')
  } catch (error: any) {
    venvSpinner.fail('Failed to create virtual environment')
    log.error(error.message)
    process.exit(1)
  }

  // 4. Install Python dependencies
  const pipSpinner = spinner('Installing Python dependencies...')
  try {
    await execPip(
      ['install', '-r', 'requirements.txt'],
      backendDir,
      true
    )
    pipSpinner.succeed('Python dependencies installed')
  } catch (error: any) {
    pipSpinner.fail('Failed to install Python dependencies')
    log.error(error.message)
    process.exit(1)
  }

  // 5. Run Django migrations
  const migrateSpinner = spinner('Running initial migrations...')
  try {
    await execPython(['manage.py', 'makemigrations', 'users'], backendDir, true)
    await execPython(['manage.py', 'migrate'], backendDir, true)
    migrateSpinner.succeed('Database migrated')
  } catch (error: any) {
    migrateSpinner.fail('Failed to run migrations')
    log.error(error.message)
    process.exit(1)
  }

  // 6. Generate frontend
  const frontendSpinner = spinner('Generating React frontend...')
  try {
    renderDirectory(
      path.join(templatesDir, 'frontend'),
      frontendDir,
      context
    )
    frontendSpinner.succeed('React frontend generated')
  } catch (error: any) {
    frontendSpinner.fail('Failed to generate frontend')
    log.error(error.message)
    process.exit(1)
  }

  // 7. Install Node dependencies
  const npmSpinner = spinner('Installing Node.js dependencies...')
  try {
    await exec('npm', ['install'], { cwd: frontendDir, silent: true })
    npmSpinner.succeed('Node.js dependencies installed')
  } catch (error: any) {
    npmSpinner.fail('Failed to install Node.js dependencies')
    log.error(error.message)
    process.exit(1)
  }

  // 8. First OpenAPI sync (start Django temporarily)
  const syncSpinner = spinner('Running initial OpenAPI sync...')
  try {
    // Start Django in background
    const djangoProcess = spawn(
      './venv/bin/python',
      ['manage.py', 'runserver', '0.0.0.0:8000', '--noreload'],
      {
        cwd: backendDir,
        stdio: 'ignore',
        detached: true,
      }
    )
    djangoProcess.unref()

    // Wait for Django to start
    await new Promise((resolve) => setTimeout(resolve, 4000))

    try {
      await exec('npx', ['openapi-ts'], { cwd: frontendDir, silent: true })
      syncSpinner.succeed('OpenAPI types synced')
    } catch {
      syncSpinner.warn('OpenAPI sync skipped (run "blacksmith sync" after starting Django)')
    }

    // Stop Django
    try {
      if (djangoProcess.pid) {
        process.kill(-djangoProcess.pid)
      }
    } catch {
      // Process may have already exited
    }
  } catch {
    syncSpinner.warn('OpenAPI sync skipped (run "blacksmith sync" after starting Django)')
  }

  // 9. Ensure generated API stub exists (openapi-ts may have cleared the directory)
  const generatedDir = path.join(frontendDir, 'src', 'api', 'generated')
  const stubFile = path.join(generatedDir, 'client.gen.ts')
  if (!fs.existsSync(stubFile)) {
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true })
    }
    fs.writeFileSync(
      stubFile,
      [
        '/**',
        ' * Auto-generated API Client',
        ' *',
        ' * This is a stub file that allows the app to boot before',
        ' * the first OpenAPI sync. Run `blacksmith sync` or `blacksmith dev`',
        ' * to generate the real client from your Django API schema.',
        ' *',
        ' * Generated by Blacksmith. This file will be overwritten by openapi-ts.',
        ' */',
        '',
        "import { createClient } from '@hey-api/client-fetch'",
        '',
        'export const client = createClient()',
        '',
      ].join('\n'),
      'utf-8'
    )
  }

  // 10. Print success
  printNextSteps(name)
}
