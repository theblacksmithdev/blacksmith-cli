import type { BackendFramework } from './paths.js'
import { exec, execPython } from './exec.js'

/** How `blacksmith backend <args>` reaches a framework's own toolchain. */
export interface BackendPassthrough {
  /** What the user must supply, for the "no command given" error. */
  needs: string
  examples: string[]
  run(args: string[], backendDir: string): Promise<unknown>
}

/**
 * Django projects get `manage.py <args>`. Express projects have no management
 * commands, so they get `npm <args>` — the same passthrough the `frontend`
 * command provides, which covers scripts, installs and `npm exec prisma ...`.
 * FastAPI projects get `python -m <args>` in the venv, which covers Alembic
 * migrations, pytest and uvicorn.
 */
export const BACKEND_PASSTHROUGHS: Record<BackendFramework, BackendPassthrough> = {
  django: {
    needs: 'a Django management command',
    examples: ['createsuperuser'],
    run: (args, backendDir) => execPython(['manage.py', ...args], backendDir),
  },
  express: {
    needs: 'an npm command',
    examples: ['run migrate', 'exec prisma studio'],
    run: (args, backendDir) => exec('npm', args, { cwd: backendDir }),
  },
  fastapi: {
    needs: 'a Python module to run',
    examples: ['alembic upgrade head', 'alembic revision --autogenerate -m "add a field"'],
    run: (args, backendDir) => execPython(['-m', ...args], backendDir),
  },
}
