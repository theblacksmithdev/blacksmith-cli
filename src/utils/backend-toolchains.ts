import { exec, execGradle, execPython } from './exec.js'
import { alembicUpgrade } from './alembic.js'
import type { BackendFramework } from './paths.js'
import type { Runtime } from './runtimes.js'
import type { Step } from './steps.js'

export interface DevProcess {
  /** The log prefix. */
  name: string
  command: string
  env?: Record<string, string>
}

/**
 * Everything the CLI's commands need to know to drive one backend framework.
 * Commands look the framework up here; none of them branch on its name.
 */
export interface BackendToolchain {
  label: string
  runtime: Runtime
  /** One line on the stack, for the generated dashboard. */
  summary: string
  /**
   * `init`: create the first migration state of a freshly generated project.
   * Null when the application applies its migrations itself as it starts.
   */
  initialMigration: Step | null
  /** `setup:backend deps`: apply the committed migrations of an existing checkout. */
  migrate: Step | null
  /** `dev`: the processes that serve the backend on a port and reload it on save. */
  devProcesses(port: number): DevProcess[]
  /** `eject`: how to start the server without Blacksmith. */
  startCommand: string
  /**
   * `dev`: which file changes should re-sync the frontend client, and how long
   * to wait after the last one for the server to come back with the change.
   */
  watch: { ext: string; ignoredPrefixes: string[]; ignoredFragments: string[]; settleMs: number }
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

const PYTHON_WATCH = { ext: '.py', ignoredPrefixes: ['venv/'], ignoredFragments: ['__pycache__', '/migrations/'], settleMs: 2000 }

export const BACKEND_TOOLCHAINS: Record<BackendFramework, BackendToolchain> = {
  django: {
    label: 'Django',
    runtime: 'python',
    summary: 'Django REST API with JWT auth, serializers, and auto-generated OpenAPI docs.',
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
    devProcesses: (port) => [
      { name: 'django', command: `./venv/bin/python manage.py runserver 0.0.0.0:${port}` },
    ],
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
    summary: 'Express REST API with JWT auth, Prisma, and auto-generated OpenAPI docs.',
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
    devProcesses: (port) => [
      { name: 'express', command: 'npm run dev', env: { PORT: String(port) } },
    ],
    startCommand: 'npm run dev',
    watch: {
      ext: '.ts',
      ignoredPrefixes: ['node_modules/', 'dist/', '.git/'],
      ignoredFragments: ['/node_modules/', '/dist/'],
      settleMs: 2000,
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
    summary: 'FastAPI with JWT auth, SQLAlchemy, and auto-generated OpenAPI docs.',
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
    devProcesses: (port) => [
      { name: 'fastapi', command: `./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port ${port} --reload` },
    ],
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
  spring: {
    label: 'Spring Boot',
    runtime: 'jvm',
    summary: 'Spring Boot REST API with JWT auth, JPA, Flyway, and auto-generated OpenAPI docs.',
    // Flyway applies pending migrations as the application starts
    initialMigration: null,
    migrate: null,
    // DevTools restarts the application when its classes change, and nothing
    // recompiles them from a terminal, so a continuous compile runs beside it
    devProcesses: (port) => [
      { name: 'spring', command: './gradlew bootRun --console=plain', env: { SERVER_PORT: String(port) } },
      { name: 'javac', command: './gradlew --continuous classes --quiet --console=plain' },
    ],
    startCommand: './gradlew bootRun',
    watch: {
      ext: '.java',
      ignoredPrefixes: ['build/', '.gradle/', 'bin/'],
      ignoredFragments: ['/build/'],
      // Compile, then restart: a few seconds before the new schema is served
      settleMs: 8000,
    },
    schemaFile: '_schema.json',
    exportSchema: (dir, schemaPath) =>
      execGradle(['exportOpenApi', `-Pout=${schemaPath}`, '--quiet', '--console=plain'], dir, true),
    build: {
      pending: 'Building backend...',
      done: 'Backend built → build/libs/app.jar',
      failed: 'Backend build failed',
      run: (dir) => execGradle(['bootJar', '--console=plain'], dir, true),
    },
    buildOutput: 'Backend output: build/libs/app.jar',
    redoc: true,
  },
}

/** Every framework `--backend` accepts, in the order they are offered. */
export const BACKEND_FRAMEWORKS = Object.keys(BACKEND_TOOLCHAINS) as BackendFramework[]

const listWithOr = new Intl.ListFormat('en', { type: 'disjunction' })

/** The frameworks as a sentence: "django, express, or fastapi". */
export const BACKEND_FRAMEWORK_CHOICES = listWithOr.format(BACKEND_FRAMEWORKS)

/** The same, as markdown config values: `"django"`, `"express"`, or `"fastapi"`. */
export const BACKEND_FRAMEWORK_CHOICES_QUOTED = listWithOr.format(BACKEND_FRAMEWORKS.map((framework) => `\`"${framework}"\``))
