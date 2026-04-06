import { spawn, type ChildProcess } from 'node:child_process'

export class ClaudeManager {
  private processes = new Map<string, ChildProcess>()
  private projectRoot: string

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      const proc = spawn('claude', ['--version'], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      let stdout = ''
      proc.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString()
      })

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ installed: true, version: stdout.trim() })
        } else {
          resolve({ installed: false })
        }
      })

      proc.on('error', () => {
        resolve({ installed: false })
      })
    })
  }

  async sendPrompt(
    sessionId: string,
    prompt: string,
    onChunk: (parsed: any) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log(`[claude] Spawning for session ${sessionId}, prompt: "${prompt.slice(0, 80)}..."`)

      const proc = spawn('claude', [
        '-p', prompt,
        '--output-format', 'stream-json',
        '--verbose',
        '--include-partial-messages',
        '--session-id', sessionId,
        '--permission-mode', 'bypassPermissions',
      ], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      })

      this.processes.set(sessionId, proc)

      let buffer = ''
      let stderrBuffer = ''

      proc.stdout.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            onChunk(parsed)
          } catch {
            console.log(`[claude] Non-JSON stdout: ${line.slice(0, 200)}`)
          }
        }
      })

      proc.stderr.on('data', (chunk: Buffer) => {
        stderrBuffer += chunk.toString()
        console.log(`[claude] stderr: ${chunk.toString().trim()}`)
      })

      proc.on('close', (code, signal) => {
        this.processes.delete(sessionId)
        console.log(`[claude] Process exited: code=${code}, signal=${signal}`)

        // Process remaining buffer
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer)
            onChunk(parsed)
          } catch {
            // Ignore
          }
        }

        if (code === 0 || code === null) {
          resolve()
        } else {
          const errorMsg = stderrBuffer.trim() || `Claude process exited with code ${code}`
          reject(new Error(errorMsg))
        }
      })

      proc.on('error', (err) => {
        this.processes.delete(sessionId)
        console.error(`[claude] Spawn error:`, err)
        reject(new Error(`Failed to spawn claude: ${err.message}`))
      })
    })
  }

  cancelPrompt(sessionId: string): void {
    const proc = this.processes.get(sessionId)
    if (proc) {
      console.log(`[claude] Killing process for session ${sessionId}`)
      proc.kill('SIGTERM')
      this.processes.delete(sessionId)
    }
  }
}
