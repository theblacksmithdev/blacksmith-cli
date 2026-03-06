import { findProjectRoot, getFrontendDir } from '../utils/paths.js'
import { exec } from '../utils/exec.js'
import { log, spinner } from '../utils/logger.js'

export async function sync() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Forge project. Run "forge init <name>" first.')
    process.exit(1)
  }

  const frontendDir = getFrontendDir(root)
  const s = spinner('Syncing OpenAPI schema to frontend...')

  try {
    await exec('npx', ['openapi-ts'], { cwd: frontendDir, silent: true })

    s.succeed('Frontend types, schemas, and hooks synced from OpenAPI spec')
    log.blank()
    log.step('Generated files in frontend/src/api/generated/:')
    log.step('  types.gen.ts            → TypeScript interfaces')
    log.step('  zod.gen.ts              → Zod validation schemas')
    log.step('  sdk.gen.ts              → API client functions')
    log.step('  @tanstack/react-query.gen.ts → TanStack Query hooks')
    log.blank()
  } catch (error: any) {
    s.fail('Failed to sync OpenAPI schema')
    log.error('Make sure Django is running on port 8000, or run "forge dev" first.')
    log.error(error.message || error)
    process.exit(1)
  }
}
