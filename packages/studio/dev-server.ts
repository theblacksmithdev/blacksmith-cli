/**
 * Development server for Blacksmith Studio.
 * Run alongside Vite to get the backend API + WebSocket running.
 *
 * Usage: npx tsx dev-server.ts
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  // Default project root: parent of packages/studio (the forge repo root)
  const projectRoot = process.env.PROJECT_ROOT || path.resolve(__dirname, '..', '..')

  const { createStudioServer } = await import('./server/index.js')

  const port = 3939
  const { server } = await createStudioServer({ projectRoot, port })

  console.log(`\n  Blacksmith Studio API running on http://localhost:${port}`)
  console.log(`  Project root: ${projectRoot}\n`)

  process.on('SIGINT', () => {
    server.close()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Failed to start dev server:', err)
  process.exit(1)
})
