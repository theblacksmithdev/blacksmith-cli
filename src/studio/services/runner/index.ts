import type { RunnerTarget, RunnerStatus, OutputCallback, ProcessInfo } from './types.js'
import { spawnBackend } from './spawn-backend.js'
import { spawnFrontend } from './spawn-frontend.js'

export type { RunnerTarget, RunnerStatus, OutputCallback }

export class RunnerManager {
  private projectRoot: string
  private processes = new Map<RunnerTarget, ProcessInfo>()
  private listeners: OutputCallback[] = []

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot
  }

  onOutput(callback: OutputCallback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
  }

  private emit(source: RunnerTarget, line: string) {
    for (const cb of this.listeners) cb(source, line)
  }

  getStatus() {
    const backend = this.processes.get('backend')
    const frontend = this.processes.get('frontend')
    return {
      backend: { status: backend?.status || 'stopped' as RunnerStatus, port: backend?.port || null },
      frontend: { status: frontend?.status || 'stopped' as RunnerStatus, port: frontend?.port || null },
    }
  }

  async startBackend(): Promise<void> {
    await spawnBackend(
      this.projectRoot,
      this.processes,
      (source, line) => this.emit(source, line),
      () => this.emitStatus(),
    )
  }

  async startFrontend(): Promise<void> {
    await spawnFrontend(
      this.projectRoot,
      this.processes,
      (source, line) => this.emit(source, line),
      () => this.emitStatus(),
    )
  }

  async startAll(): Promise<void> {
    await Promise.all([this.startBackend(), this.startFrontend()])
  }

  stopBackend(): void {
    const info = this.processes.get('backend')
    if (info) {
      this.emit('backend', '[studio] Stopping Django...')
      info.process.kill('SIGTERM')
    }
  }

  stopFrontend(): void {
    const info = this.processes.get('frontend')
    if (info) {
      this.emit('frontend', '[studio] Stopping Vite...')
      info.process.kill('SIGTERM')
    }
  }

  stopAll(): void {
    this.stopBackend()
    this.stopFrontend()
  }

  private statusListeners: (() => void)[] = []

  onStatusChange(callback: () => void) {
    this.statusListeners.push(callback)
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback)
    }
  }

  private emitStatus() {
    for (const cb of this.statusListeners) cb()
  }
}
