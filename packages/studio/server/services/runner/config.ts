import path from 'node:path'
import fs from 'node:fs'

export function loadProjectConfig(projectRoot: string): { backendPort: number; frontendPort: number } {
  const configPath = path.join(projectRoot, 'blacksmith.config.json')
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      return {
        backendPort: config.backend?.port || 8000,
        frontendPort: config.frontend?.port || 5173,
      }
    }
  } catch { /* ignore */ }
  return { backendPort: 8000, frontendPort: 5173 }
}
