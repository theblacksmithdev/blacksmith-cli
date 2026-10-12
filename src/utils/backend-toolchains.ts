import { exec, execPython } from './exec.js'
import { alembicUpgrade } from './alembic.js'
import type { BackendFramework } from './paths.js'
import type { Runtime } from './runtimes.js'
import type { Step } from './steps.js'

/**
 * Everything the CLI's commands need to know to drive one backend framework.
 * Commands look the framework up here; none of them branch on its name.
 */
export interface BackendToolchain {
  label: string
  runtime: Runtime
  /** `init`: create the first migration state of a freshly generated project. */
  initialMigration: Step
  /** `setup:backend deps`: apply the committed migrations of an existing checkout. */
  migrate: Step
  /** `dev`: the hot-reloading server on a port. */
  devServer(port: number): { command: string; env?: Record<string, string> }
  /** `eject`: how to start the server without Blacksmith. */
  startCommand: string
  /** `dev`: which file changes should re-sync the frontend client. */
  watch: { ext: string; ignoredPrefixes: string[]; ignoredFragments: string[] }
  /** The file the OpenAPI document is exported to. */
  schemaFile: string
  /** Write the OpenAPI document to a path without starting a server. */
  exportSchema(backendDir: string, schemaPath: string): Promise<unknown>
  /** `build`: the backend's production build, or null when there is nothing to build. */
  build: Step | null
  /** `build`: where the built backend is. */
  buildOutput: string
  /** Whether the backend serves ReDoc at /api/redoc/. */
  redoc: boolean
}

const PYTHON_WATCH = { ext: '.py', ignoredPrefixes: ['venv/'], ignoredFragments: ['__pycache__', '/migrations/'] }

export const BACKEND_TOOLCHAINS: Record<BackendFramework, BackendToolchain> = {
  django: {
    label: 'Django',
    runtime: 'python',
    initialMigration: {
      pending: 'Running initial migrations...',
      done: 'Database migrated',
      failed: 'Failed to run migrations',
      run: async (dir) => {
        await execPython(['manage.py', 'makemigrations', 'users'], dir, true)
        await execPython(['manage.py', 'migrate'], dir, true)
      },
    },
    migrate: {
      pending: 'Running database migrations...',
      done: 'Database migrated',
      failed: 'Failed to run migrations',
      run: (dir) => execPython(['manage.py', 'migrate'], dir, true),
    },
    devServer: (port) => ({ command: `./venv/bin/python manage.py runserver 0.0.0.0:${port}` }),
    startCommand: './venv/bin/python manage.py runserver',
    watch: PYTHON_WATCH,
    // drf-spectacular writes YAML
    schemaFile: '_schema.yml',
    exportSchema: (dir, schemaPath) =>
      execPython(['manage.py', 'spectacular', '--file', schemaPath], dir, true),
    build: {
      pending: 'Collecting static files...',
      done: 'Static files collected',
      failed: 'Failed to collect static files',
      run: (dir) => execPython(['manage.py', 'collectstatic', '--noinput'], dir, true),
    },
    buildOutput: 'Backend ready for deployment',
    redoc: true,
  },
  express: {
    label: 'Express',
    runtime: 'node',
    initialMigration: {
      pending: 'Setting up the database...',
      done: 'Database migrated',
      failed: 'Failed to set up the database',
      run: async (dir) => {
        await exec('npx', ['prisma', 'generate'], { cwd: dir, silent: true })
        await exec(
          'npx',
          ['prisma', 'migrate', 'dev', '--name', 'init', '--skip-seed'],
          { cwd: dir, silent: true }
        )
      },
    },
    migrate: {
      pending: 'Applying database migrations...',
      done: 'Database migrated',
      failed: 'Failed to apply database migrations',
      run: async (dir) => {
        await exec('npx', ['prisma', 'generate'], { cwd: dir, silent: true })
        // `migrate deploy` applies committed migrations without prompting, which
        // is what a setup step on an existing project needs.
        await exec('npx', ['prisma', 'migrate', 'deploy'], { cwd: dir, silent: true })
      },
    },
    // The generated server reads PORT, so a port collision resolved by `dev`
    // is respected without editing .env
    devServer: (port) => ({ command: 'npm run dev', env: { PORT: String(port) } }),
    startCommand: 'npm run dev',
    watch: {
      ext: '.ts',
      ignoredPrefixes: ['node_modules/', 'dist/', '.git/'],
      ignoredFragments: ['/node_modules/', '/dist/'],
    },
    schemaFile: '_schema.json',
    exportSchema: (dir, schemaPath) =>
      exec('npm', ['run', 'openapi', '--', schemaPath], { cwd: dir, silent: true }),
    build: {
      pending: 'Building backend...',
      done: 'Backend built → dist/',
      failed: 'Backend build failed',
      // The template's build script regenerates the Prisma client first, so
      // a clean checkout compiles without a separate setup step.
      run: (dir) => exec('npm', ['run', 'build'], { cwd: dir, silent: true }),
    },
    buildOutput: 'Backend output: dist/',
    redoc: false,
  },
  fastapi: {
    label: 'FastAPI',
    runtime: 'python',
    initialMigration: {
      pending: 'Running initial migrations...',
      done: 'Database migrated',
      failed: 'Failed to run migrations',
      run: alembicUpgrade,
    },
    migrate: {
      pending: 'Running database migrations...',
      done: 'Database migrated',
      failed: 'Failed to run migrations',
      run: alembicUpgrade,
    },
    devServer: (port) => ({
      command: `./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port ${port} --reload`,
    }),
    startCommand: './venv/bin/uvicorn app.main:app --reload',
    watch: PYTHON_WATCH,
    schemaFile: '_schema.json',
    exportSchema: (dir, schemaPath) =>
      execPython(['scripts.py', 'export-openapi', schemaPath], dir, true),
    // Nothing to compile or collect: the backend directory is deployed as is
    build: null,
    buildOutput: 'Backend ready for deployment',
    redoc: true,
  },
}

/** Every framework `--backend` accepts, in the order they are offered. */
export const BACKEND_FRAMEWORKS = Object.keys(BACKEND_TOOLCHAINS) as BackendFramework[]

/** The frameworks as a sentence: "django, express, or fastapi". */
export const BACKEND_FRAMEWORK_CHOICES = new Intl.ListFormat('en', { type: 'disjunction' }).format(BACKEND_FRAMEWORKS)
