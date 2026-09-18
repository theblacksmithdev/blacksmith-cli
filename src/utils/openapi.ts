import fs from 'node:fs'
import path from 'node:path'
import { exec, execPython } from './exec.js'

/**
 * Name of the schema file a backend exports.
 *
 * drf-spectacular writes YAML; the Express generator writes JSON. CI and the
 * `sync` command both read this so the two can never disagree.
 */
export function schemaFileName(isExpress: boolean): string {
  return isExpress ? '_schema.json' : '_schema.yml'
}

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
 * Export the backend's OpenAPI document to `schemaPath` without starting a
 * server. Django does this through drf-spectacular, Express through its own
 * `openapi` script.
 */
export async function exportBackendSchema(
  backendDir: string,
  schemaPath: string,
  isExpress: boolean
): Promise<void> {
  if (isExpress) {
    await exec('npm', ['run', 'openapi', '--', schemaPath], {
      cwd: backendDir,
      silent: true,
    })
  } else {
    await execPython(['manage.py', 'spectacular', '--file', schemaPath], backendDir, true)
  }
}

/**
 * Regenerate the frontend's typed client from the backend's current schema.
 *
 * Fully offline for both frameworks — nothing has to be listening.
 */
export async function syncFrontendClient(
  backendDir: string,
  frontendDir: string,
  isExpress: boolean
): Promise<void> {
  const schemaPath = path.join(frontendDir, schemaFileName(isExpress))
  await exportBackendSchema(backendDir, schemaPath, isExpress)
  await generateClientFromSchema(frontendDir, schemaPath)
}
