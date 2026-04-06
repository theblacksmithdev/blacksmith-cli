import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import type { ProcessInfo, RunnerTarget } from './types.js'
import { findAvailablePort } from './port-utils.js'
import { loadProjectConfig } from './config.js'

export async function spawnBackend(
  projectRoot: string,
  processes: Map<RunnerTarget, ProcessInfo>,
  emit: (source: RunnerTarget, line: string) => void,
  emitStatus: () => void,
): Promise<void> {
  if (processes.has('backend')) return

  const config = loadProjectConfig(projectRoot)
  const port = await findAvailablePort(config.backendPort)
  const backendDir = path.join(projectRoot, 'backend')
  const venvPython = path.join(backendDir, 'venv', 'bin', 'python')

  if (!fs.existsSync(venvPython)) {
    emit('backend', '[studio] Error: Python venv not found at backend/venv/bin/python')
    return
  }

  emit('backend', `[studio] Starting Django on port ${port}...`)

  const proc = spawn(venvPython, ['manage.py', 'runserver', `0.0.0.0:${port}`, '--noreload'], {
    cwd: backendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  })

  const info: ProcessInfo = { process: proc, port, status: 'starting' }
  processes.set('backend', info)

  const setRunning = () => {
    if (info.status === 'starting') {
      info.status = 'running'
      emitStatus()
    }
  }

  proc.stdout!.on('data', (chunk: Buffer) => {
    const text = chunk.toString()
    setRunning()
    for (const line of text.split('\n').filter(Boolean)) {
      emit('backend', line)
    }
  })

  proc.stderr!.on('data', (chunk: Buffer) => {
    const text = chunk.toString()
    setRunning()
    for (const line of text.split('\n').filter(Boolean)) {
      emit('backend', line)
    }
  })

  proc.on('close', (code) => {
    processes.delete('backend')
    emit('backend', `[studio] Django stopped (exit code ${code})`)
    emitStatus()
  })

  proc.on('error', (err) => {
    processes.delete('backend')
    emit('backend', `[studio] Django error: ${err.message}`)
    emitStatus()
  })

  emitStatus()
}
