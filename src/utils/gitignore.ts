import fs from 'node:fs'
import path from 'node:path'
import { getTemplatesDir } from './paths.js'

/**
 * Which template directory to take a `.gitignore` from. Backend kinds are
 * paths into the template tree, so they match `backendTemplateDir()`.
 */
export type GitignoreKind =
  | 'project'
  | 'frontend'
  | 'backend/django'
  | 'backend/express'

/**
 * Write the `.gitignore` for a generated directory if one is not already there.
 *
 * Templates ship the file dot-less (see DOTFILE_TEMPLATES in utils/template.ts),
 * so the leading dot is added here. An existing `.gitignore` is never touched —
 * the user may have edited it.
 *
 * Returns true when a file was written.
 */
export function ensureGitignore(targetDir: string, kind: GitignoreKind): boolean {
  const destPath = path.join(targetDir, '.gitignore')
  if (fs.existsSync(destPath)) return false

  const srcPath = path.join(getTemplatesDir(), kind, 'gitignore')
  if (!fs.existsSync(srcPath)) return false

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  fs.copyFileSync(srcPath, destPath)
  return true
}
