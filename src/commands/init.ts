import path from 'node:path'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { renderDirectory } from '../utils/template.js'
import { ensureEnvFile } from '../utils/env-file.js'
import { ensureGitignore } from '../utils/gitignore.js'
import type { GitignoreKind } from '../utils/gitignore.js'
import { backendTemplateDir, ensureCiWorkflow, projectLayout } from '../utils/scaffold.js'
import { syncFrontendClient } from '../utils/openapi.js'
import { exec, execPython, execPip, commandExists } from '../utils/exec.js'
import { getTemplatesDir } from '../utils/paths.js'
import type { BackendFramework, ProjectType } from '../utils/paths.js'
import { log, spinner, printNextSteps, promptText, promptYesNo, promptSelect, printConfig } from '../utils/logger.js'
import { setupAiDev } from './ai-setup.js'

function parsePort(value: string, label: string): number {
  const port = parseInt(value, 10)
  if (isNaN(port) || port < 1 || port > 65535) {
    log.error(`Invalid ${label} port: ${value}`)
    process.exit(1)
  }
  return port
}

const THEME_PRESETS = ['default', 'blue', 'green', 'violet', 'red', 'neutral']
const PROJECT_TYPES: ProjectType[] = ['fullstack', 'backend', 'frontend']
const BACKEND_FRAMEWORKS: BackendFramework[] = ['django', 'express']

interface InitOptions {
  type?: string
  backend?: string
  ai?: boolean
  chakraUiSkill?: boolean
  backendPort?: string
  frontendPort?: string
  themeColor?: string
}

export async function init(name: string | undefined, options: InitOptions) {
  // Interactive prompts for values not provided via flags
  if (!name) {
    name = await promptText('Project name')
    if (!name) {
      log.error('Project name is required.')
      process.exit(1)
    }
  }

  // Project type prompt
  let projectType: ProjectType
  if (options.type && PROJECT_TYPES.includes(options.type as ProjectType)) {
    projectType = options.type as ProjectType
  } else if (options.type) {
    log.error(`Invalid project type: "${options.type}". Must be one of: fullstack, backend, frontend`)
    process.exit(1)
  } else {
    projectType = await promptSelect('Project type', PROJECT_TYPES, 'fullstack') as ProjectType
  }

  const needsBackend = projectType === 'fullstack' || projectType === 'backend'
  const needsFrontend = projectType === 'fullstack' || projectType === 'frontend'

  // A bad --backend value is an error even on a frontend-only project, where
  // the flag is otherwise ignored — silently accepting a typo helps nobody.
  if (options.backend && !BACKEND_FRAMEWORKS.includes(options.backend as BackendFramework)) {
    log.error(`Invalid backend framework: "${options.backend}". Must be one of: django, express`)
    process.exit(1)
  }

  // Backend framework prompt
  let backendFramework: BackendFramework = 'django'
  if (needsBackend) {
    if (options.backend) {
      backendFramework = options.backend as BackendFramework
    } else {
      const selected = await promptSelect('Backend framework', BACKEND_FRAMEWORKS, 'django')
      // The config must never record a framework the CLI cannot act on, so an
      // unrecognised answer falls back to the default rather than being stored.
      backendFramework = BACKEND_FRAMEWORKS.includes(selected as BackendFramework)
        ? (selected as BackendFramework)
        : 'django'
    }
  }
  const isExpressBackend = needsBackend && backendFramework === 'express'

  if (needsBackend && !options.backendPort) {
    options.backendPort = await promptText('Backend port', '8000')
  }

  if (needsFrontend && !options.frontendPort) {
    options.frontendPort = await promptText('Frontend port', '5173')
  }

  if (needsFrontend && !options.themeColor) {
    options.themeColor = await promptSelect('Theme preset', THEME_PRESETS, 'default')
  }

  if (options.ai === undefined) {
    options.ai = await promptYesNo('Set up AI coding support')
  }

  const backendPort = needsBackend ? parsePort(options.backendPort || '8000', 'backend') : undefined
  const frontendPort = needsFrontend ? parsePort(options.frontendPort || '5173', 'frontend') : undefined
  const themePreset = needsFrontend && options.themeColor && THEME_PRESETS.includes(options.themeColor)
    ? options.themeColor
    : 'default'

  const configDisplay: Record<string, string> = { 'Project': name, 'Type': projectType }
  if (needsBackend) {
    const label = backendFramework === 'express' ? 'Express' : 'Django'
    configDisplay['Backend'] = `${label} on :${backendPort}`
  }
  if (needsFrontend) configDisplay['Frontend'] = `React on :${frontendPort}`
  if (needsFrontend) configDisplay['Theme'] = themePreset
  configDisplay['AI support'] = options.ai ? 'Yes' : 'No'
  printConfig(configDisplay)

  const projectDir = path.resolve(process.cwd(), name)
  const backendDir = needsBackend
    ? (projectType === 'backend' ? projectDir : path.join(projectDir, 'backend'))
    : null
  const frontendDir = needsFrontend
    ? (projectType === 'frontend' ? projectDir : path.join(projectDir, 'frontend'))
    : null
  const templatesDir = getTemplatesDir()

  // Validate
  if (fs.existsSync(projectDir)) {
    log.error(`Directory "${name}" already exists.`)
    process.exit(1)
  }

  // Check prerequisites
  const checkSpinner = spinner('Checking prerequisites...')

  if (needsBackend && !isExpressBackend) {
    const hasPython = await commandExists('python3')
    if (!hasPython) {
      checkSpinner.fail('Python 3 is required but not found. Install it from https://python.org')
      process.exit(1)
    }
  }

  if (needsFrontend || isExpressBackend) {
    const hasNode = await commandExists('node')
    const hasNpm = await commandExists('npm')
    if (!hasNode || !hasNpm) {
      checkSpinner.fail('Node.js and npm are required but not found. Install from https://nodejs.org')
      process.exit(1)
    }
  }

  const prereqs = [
    needsBackend && !isExpressBackend ? 'Python 3' : null,
    needsFrontend || isExpressBackend ? 'Node.js, npm' : null,
  ].filter(Boolean).join(', ')
  checkSpinner.succeed(`Prerequisites OK (${prereqs})`)

  const context = {
    projectName: name,
    backendPort: backendPort || 8000,
    frontendPort: frontendPort || 5173,
    themePreset,
    ...projectLayout(projectType, backendFramework),
  }

  // 1. Create project directory and config
  fs.mkdirSync(projectDir, { recursive: true })

  const configObj: Record<string, unknown> = {
    name,
    version: '0.1.0',
    type: projectType,
  }
  if (needsBackend) configObj.backend = { port: backendPort, framework: backendFramework }
  if (needsFrontend) configObj.frontend = { port: frontendPort }

  fs.writeFileSync(
    path.join(projectDir, 'blacksmith.config.json'),
    JSON.stringify(configObj, null, 2)
  )

  // Fullstack projects get a root .gitignore; backend/frontend-only projects
  // get theirs from their own template, which renders straight into projectDir.
  if (projectType === 'fullstack') {
    ensureGitignore(projectDir, 'project')
  }

  // GitHub Actions workflow that runs the backend and frontend test suites
  ensureCiWorkflow(projectDir, context)

  // 2. Generate backend
  if (backendDir) {
    const frameworkLabel = isExpressBackend ? 'Express' : 'Django'
    const backendSpinner = spinner(`Generating ${frameworkLabel} backend...`)
    try {
      renderDirectory(
        path.join(templatesDir, backendTemplateDir(backendFramework)),
        backendDir,
        context
      )

      // Copy .env.example to .env for development
      ensureEnvFile(backendDir)

      // Safety net: the dependency directory (venv/ or node_modules/) must be
      // ignored before it is created
      ensureGitignore(backendDir, backendTemplateDir(backendFramework) as GitignoreKind)

      backendSpinner.succeed(`${frameworkLabel} backend generated`)
    } catch (error: any) {
      backendSpinner.fail('Failed to generate backend')
      log.error(error.message)
      process.exit(1)
    }

    if (isExpressBackend) {
      // 3. Install Node dependencies
      const npmSpinner = spinner('Installing backend dependencies...')
      try {
        await exec('npm', ['install'], { cwd: backendDir, silent: true })
        npmSpinner.succeed('Backend dependencies installed')
      } catch (error: any) {
        npmSpinner.fail('Failed to install backend dependencies')
        log.error(error.message)
        process.exit(1)
      }

      // 4. Generate the Prisma client and create the initial migration
      const prismaSpinner = spinner('Setting up the database...')
      try {
        await exec('npx', ['prisma', 'generate'], { cwd: backendDir, silent: true })
        await exec(
          'npx',
          ['prisma', 'migrate', 'dev', '--name', 'init', '--skip-seed'],
          { cwd: backendDir, silent: true }
        )
        prismaSpinner.succeed('Database migrated')
      } catch (error: any) {
        prismaSpinner.fail('Failed to set up the database')
        log.error(error.message)
        process.exit(1)
      }
    } else {
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
    }
  }

  // 6. Generate frontend
  if (frontendDir) {
    const frontendSpinner = spinner('Generating React frontend...')
    try {
      renderDirectory(
        path.join(templatesDir, 'frontend'),
        frontendDir,
        context
      )

      // Safety net: node_modules/ must be ignored before npm install runs
      ensureGitignore(frontendDir, 'frontend')

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
  }

  // 8. First OpenAPI sync (only for fullstack projects)
  if (backendDir && frontendDir) {
    const syncSpinner = spinner('Running initial OpenAPI sync...')
    if (isExpressBackend) {
      // The Express backend can export its schema without booting, so there is
      // no server to start, wait for, and kill here.
      try {
        await syncFrontendClient(backendDir, frontendDir, true)
        syncSpinner.succeed('OpenAPI types synced')
      } catch {
        syncSpinner.warn('OpenAPI sync skipped (run "blacksmith sync" to retry)')
      }
    } else {
      try {
        // Start Django in background
        const djangoProcess = spawn(
          './venv/bin/python',
          ['manage.py', 'runserver', `0.0.0.0:${backendPort}`, '--noreload'],
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
          await exec(process.execPath, [path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')], { cwd: frontendDir, silent: true })
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
  }

  // 10. AI development setup (opt-in)
  if (options.ai) {
    await setupAiDev({
      projectDir,
      projectName: name,
      includeChakraUiSkill: options.chakraUiSkill !== false,
      projectType,
      backendFramework,
    })
  }

  // 11. Print success
  printNextSteps(name, projectType, backendPort, frontendPort, backendFramework)
}
