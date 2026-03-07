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
 * Get the backend directory of a Blacksmith project
 */
export function getBackendDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot()
  return path.join(root, 'backend')
}

/**
 * Get the frontend directory of a Blacksmith project
 */
export function getFrontendDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot()
  return path.join(root, 'frontend')
}

export interface BlacksmithConfig {
  name: string
  version: string
  backend: { port: number }
  frontend: { port: number }
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
