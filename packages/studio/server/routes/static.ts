import { Router } from 'express'
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'

export function createStaticRouter(clientDir: string): Router {
  const router = Router()

  if (fs.existsSync(clientDir)) {
    router.use(express.static(clientDir))

    // SPA fallback — serve index.html for all non-API, non-file routes
    router.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'))
    })
  } else {
    router.get('/{*splat}', (_req, res) => {
      res.status(503).send(`
        <html>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: #e0e0e0;">
            <div style="text-align: center;">
              <h1>Blacksmith Studio</h1>
              <p>Studio client not built. Run <code>npm run build:studio</code> first.</p>
            </div>
          </body>
        </html>
      `)
    })
  }

  return router
}
