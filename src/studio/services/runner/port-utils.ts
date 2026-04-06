import net from 'node:net'

export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => { server.close(() => resolve(true)) })
    server.listen(port)
  })
}

export async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort
  while (port < startPort + 100) {
    if (await isPortAvailable(port)) return port
    port++
  }
  throw new Error(`No available port found near ${startPort}`)
}
