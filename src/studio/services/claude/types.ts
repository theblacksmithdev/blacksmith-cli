import type { ChildProcess } from 'node:child_process'

export interface ClaudeProcess {
  sessionId: string
  process: ChildProcess
}

export interface ClaudeInstallStatus {
  installed: boolean
  version?: string
}

export interface ClaudeSpawnOptions {
  sessionId: string
  prompt: string
  projectRoot: string
}

export type ChunkCallback = (parsed: any) => void
