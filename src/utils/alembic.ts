import { execPython } from './exec.js'

/**
 * Alembic, run through the FastAPI backend's venv. Alembic owns the FastAPI
 * schema the way `manage.py migrate` owns Django's and Prisma owns Express's.
 */

/** Apply every pending migration. */
export function alembicUpgrade(backendDir: string) {
  return execPython(['-m', 'alembic', 'upgrade', 'head'], backendDir, true)
}

/** Write a migration for whatever the models now differ from the database by. */
export function alembicAutogenerate(backendDir: string, message: string) {
  return execPython(
    ['-m', 'alembic', 'revision', '--autogenerate', '-m', message],
    backendDir,
    true
  )
}
