import fs from 'node:fs'
import path from 'node:path'

/**
 * Write a backend's `.env` from its `.env.example` when it is missing.
 *
 * `init` writes `.env` as part of generating the backend, but the file is
 * gitignored — so a cloned checkout arrives with only `.env.example`, and
 * anything that reads the environment fails before it can run. Prisma is the
 * sharpest case: it cannot even parse `schema.prisma` without resolving
 * `env("DATABASE_URL")`, and reports it as a schema validation error (P1012).
 *
 * An existing `.env` is never touched — the user owns it.
 *
 * Returns true when a file was written.
 */
export function ensureEnvFile(backendDir: string): boolean {
  const destPath = path.join(backendDir, '.env')
  if (fs.existsSync(destPath)) return false

  const srcPath = path.join(backendDir, '.env.example')
  if (!fs.existsSync(srcPath)) return false

  fs.copyFileSync(srcPath, destPath)
  return true
}
