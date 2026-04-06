import { spawn } from 'node:child_process'
import type { ClaudeInstallStatus } from './types.js'

/**
 * Check if the Claude Code CLI is installed and return its version.
 */
export function checkClaudeInstalled(cwd: string): Promise<ClaudeInstallStatus> {
  return new Promise((resolve) => {
    const proc = spawn('claude', ['--version'], {
      cwd,
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
