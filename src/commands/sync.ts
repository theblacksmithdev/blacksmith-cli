import { findProjectRoot, getBackendDir, getBackendFramework, getFrontendDir, getProjectType } from '../utils/paths.js'
import { syncFrontendClient } from '../utils/openapi.js'
import { log, spinner } from '../utils/logger.js'

export async function sync() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const projectType = getProjectType(root)
  if (projectType !== 'fullstack') {
    log.error('The "sync" command is only available for fullstack projects.')
    log.step('It generates frontend TypeScript types from the backend API schema.')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)
  const isExpress = getBackendFramework(root) === 'express'
  const s = spinner('Syncing OpenAPI schema to frontend...')

  try {
    await syncFrontendClient(backendDir, frontendDir, isExpress)

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
    log.error(error.message || error)
    process.exit(1)
  }
}
