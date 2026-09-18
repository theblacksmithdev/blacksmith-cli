import fs from 'node:fs'
import path from 'node:path'
import { getTemplatesDir } from './paths.js'

export type GitignoreKind = 'project' | 'backend' | 'backend-express' | 'frontend'

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
