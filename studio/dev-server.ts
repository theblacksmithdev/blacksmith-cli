/**
 * Development server for Blacksmith Studio.
 * Run this alongside `vite` to get the backend API + WebSocket running.
 *
 * Usage: npx tsx studio/dev-server.ts
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dynamically import server to avoid tsup bundling issues
async function main() {
  // Use the project root where this repo lives as the "project" for dev
  const projectRoot = path.resolve(__dirname, '..')

  // Import the server module directly from source
  const { createStudioServer } = await import('../src/studio/server.js')

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
