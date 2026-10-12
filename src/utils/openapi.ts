import fs from 'node:fs'
import path from 'node:path'
import { exec } from './exec.js'
import { BACKEND_TOOLCHAINS } from './backend-toolchains.js'
import type { BackendFramework } from './paths.js'

/** Path to the frontend's local openapi-ts binary. */
export function openApiTsBin(frontendDir: string): string {
  return path.join(frontendDir, 'node_modules', '.bin', 'openapi-ts')
}

/** Run openapi-ts against whatever input its config currently points at. */
export async function runOpenApiTs(frontendDir: string): Promise<void> {
  await exec(process.execPath, [openApiTsBin(frontendDir)], {
    cwd: frontendDir,
    silent: true,
  })
}

/**
 * Generate the frontend client from a schema file on disk.
 *
 * openapi-ts.config.ts normally points at the running backend's `/api/schema/`
 * endpoint, so it is redirected at the local file for the length of one run.
 * The original config is restored and the schema file removed whatever happens
 * — a failed run must not leave the project's config rewritten.
 */
export async function generateClientFromSchema(
  frontendDir: string,
  schemaPath: string
): Promise<void> {
  const configPath = path.join(frontendDir, 'openapi-ts.config.ts')
  let original: string | null = null

  // The outer finally also covers a failure reading or patching the config,
  // which would otherwise leave the exported schema behind in the project.
  try {
    original = fs.readFileSync(configPath, 'utf-8')
    const patched = original.replace(
      /path:\s*['"]http[^'"]+['"]/,
      `path: './${path.basename(schemaPath)}'`
    )
    fs.writeFileSync(configPath, patched, 'utf-8')

    await runOpenApiTs(frontendDir)
  } finally {
    if (original !== null) fs.writeFileSync(configPath, original, 'utf-8')
    if (fs.existsSync(schemaPath)) fs.unlinkSync(schemaPath)
  }
}

/**
 * Regenerate the frontend's typed client from the backend's current schema.
 *
 * Fully offline for every framework — nothing has to be listening.
 */
export async function syncFrontendClient(
  backendDir: string,
  frontendDir: string,
  framework: BackendFramework
): Promise<void> {
  const toolchain = BACKEND_TOOLCHAINS[framework]
  const schemaPath = path.join(frontendDir, toolchain.schemaFile)
  await toolchain.exportSchema(backendDir, schemaPath)
  await generateClientFromSchema(frontendDir, schemaPath)
}
