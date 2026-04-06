import fs from 'node:fs'
import path from 'node:path'
import type { FileNode } from '../types.js'

const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', '__pycache__', 'venv', 'dist', '.env',
  '.blacksmith-studio', '.claude', '.vscode', '.idea',
  'htmlcov', '.pytest_cache', '.mypy_cache',
])

const IGNORE_EXTENSIONS = new Set(['.pyc', '.pyo', '.egg-info'])

export function buildFileTree(
  projectRoot: string,
  dir?: string,
  depth = 0,
  maxDepth = 6,
): FileNode {
  const currentDir = dir || projectRoot
  const name = dir ? path.basename(currentDir) : path.basename(projectRoot)
  const relativePath = path.relative(projectRoot, currentDir)

  if (depth >= maxDepth) {
    return { name, path: relativePath || '.', type: 'directory', children: [] }
  }

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true })
  } catch {
    return { name, path: relativePath || '.', type: 'directory', children: [] }
  }

  const children: FileNode[] = []

  for (const entry of entries.sort((a, b) => {
    // Directories first, then alphabetical
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })) {
    if (entry.name.startsWith('.') && DEFAULT_IGNORE.has(entry.name)) continue
    if (DEFAULT_IGNORE.has(entry.name)) continue
    if (IGNORE_EXTENSIONS.has(path.extname(entry.name))) continue

    const fullPath = path.join(currentDir, entry.name)
    const relPath = path.relative(projectRoot, fullPath)

    if (entry.isDirectory()) {
      children.push(buildFileTree(projectRoot, fullPath, depth + 1, maxDepth))
    } else {
      children.push({ name: entry.name, path: relPath, type: 'file' })
    }
  }

  return {
    name,
    path: relativePath || '.',
    type: 'directory',
    children,
  }
}

export function readFileContent(
  projectRoot: string,
  relativePath: string,
): { content: string; language: string; size: number } {
  const fullPath = path.resolve(projectRoot, relativePath)

  // Security: ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw new Error('Access denied: path outside project root')
  }

  const stat = fs.statSync(fullPath)
  if (stat.size > 1024 * 512) {
    throw new Error('File too large (max 512KB)')
  }

  const content = fs.readFileSync(fullPath, 'utf-8')
  const ext = path.extname(relativePath).slice(1)
  const languageMap: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    py: 'python', json: 'json', md: 'markdown', css: 'css', html: 'html',
    yml: 'yaml', yaml: 'yaml', toml: 'toml', sql: 'sql', sh: 'bash',
    txt: 'text', hbs: 'handlebars',
  }

  return { content, language: languageMap[ext] || ext || 'text', size: stat.size }
}
