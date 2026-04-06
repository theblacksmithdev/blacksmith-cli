import type { ChildProcess } from 'node:child_process'

export type RunnerTarget = 'backend' | 'frontend'
export type RunnerStatus = 'stopped' | 'starting' | 'running'
export type OutputCallback = (source: RunnerTarget, line: string) => void

export interface ProcessInfo {
  process: ChildProcess
  port: number
  status: RunnerStatus
}
