import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get the templates directory (relative to the built CLI)
 */
export function getTemplatesDir(): string {
  // In development: src/templates
  // In production (built): dist is sibling to src
  const devPath = path.resolve(__dirname, '..', 'templates')
  const prodPath = path.resolve(__dirname, '..', 'src', 'templates')

  if (fs.existsSync(devPath)) return devPath
  if (fs.existsSync(prodPath)) return prodPath

  throw new Error('Templates directory not found. Make sure the CLI is properly installed.')
}

/**
 * Find the Blacksmith project root by walking up directories
 * looking for blacksmith.config.json
 */
export function findProjectRoot(startDir?: string): string {
  let dir = startDir || process.cwd()

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'blacksmith.config.json'))) {
      return dir
    }
    dir = path.dirname(dir)
  }

  throw new Error(
    'Not inside a Blacksmith project. Run "blacksmith init <name>" to create one, or navigate to an existing Blacksmith project.'
  )
}

/**
 * Get the project type from config (defaults to 'fullstack' for backward compatibility)
 */
export function getProjectType(projectRoot?: string): ProjectType {
  const config = loadConfig(projectRoot)
  return config.type || 'fullstack'
}

/**
 * Check if the project has a backend
 */
export function hasBackend(projectRoot?: string): boolean {
  const type = getProjectType(projectRoot)
  return type === 'fullstack' || type === 'backend'
}

/**
 * Check if the project has a frontend
 */
export function hasFrontend(projectRoot?: string): boolean {
  const type = getProjectType(projectRoot)
  return type === 'fullstack' || type === 'frontend'
}

/**
 * Get the backend directory of a Blacksmith project
 */
export function getBackendDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot()
  const type = getProjectType(root)
  if (type === 'frontend') {
    throw new Error('This is a frontend-only project. There is no backend directory.')
  }
  return type === 'backend' ? root : path.join(root, 'backend')
}

/**
 * Get the frontend directory of a Blacksmith project
 */
export function getFrontendDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot()
  const type = getProjectType(root)
  if (type === 'backend') {
    throw new Error('This is a backend-only project. There is no frontend directory.')
  }
  return type === 'frontend' ? root : path.join(root, 'frontend')
}

export type ProjectType = 'fullstack' | 'backend' | 'frontend'

export interface BlacksmithConfig {
  name: string
  version: string
  type?: ProjectType
  backend?: { port: number }
  frontend?: { port: number }
}

export function loadConfig(projectRoot?: string): BlacksmithConfig {
  const root = projectRoot || findProjectRoot()
  const configPath = path.join(root, 'blacksmith.config.json')
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

/**
 * Check if a directory exists
 */
export function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
}
