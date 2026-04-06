import type { ChildProcess } from 'node:child_process'
import { checkClaudeInstalled } from './check-installed.js'
import { spawnClaudePrompt } from './spawn-prompt.js'
import type { ClaudeInstallStatus, ChunkCallback } from './types.js'

export type { ClaudeInstallStatus, ChunkCallback } from './types.js'

export class ClaudeManager {
  private processes = new Map<string, ChildProcess>()
  private projectRoot: string

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  checkInstalled(): Promise<ClaudeInstallStatus> {
    return checkClaudeInstalled(this.projectRoot)
  }

  async sendPrompt(
    sessionId: string,
    prompt: string,
    onChunk: ChunkCallback,
  ): Promise<void> {
    const { promise, process } = spawnClaudePrompt(
      sessionId,
      prompt,
      this.projectRoot,
      onChunk,
    )

    this.processes.set(sessionId, process)

    try {
      await promise
    } finally {
      this.processes.delete(sessionId)
    }
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
