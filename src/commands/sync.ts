import path from 'node:path'
import fs from 'node:fs'
import { findProjectRoot, getBackendDir, getFrontendDir } from '../utils/paths.js'
import { exec, execPython } from '../utils/exec.js'
import { log, spinner } from '../utils/logger.js'

export async function sync() {
  let root: string
  try {
    root = findProjectRoot()
  } catch {
    log.error('Not inside a Blacksmith project. Run "blacksmith init <name>" first.')
    process.exit(1)
  }

  const backendDir = getBackendDir(root)
  const frontendDir = getFrontendDir(root)
  const s = spinner('Syncing OpenAPI schema to frontend...')

  try {
    // Generate schema offline using drf-spectacular management command
    const schemaPath = path.join(frontendDir, '_schema.yml')
    await execPython(['manage.py', 'spectacular', '--file', schemaPath], backendDir, true)

    // Temporarily update the openapi-ts config to use the local schema file
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
      // Always restore the original config and clean up the schema file
      fs.writeFileSync(configPath, configBackup, 'utf-8')
      if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath)
    }

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
