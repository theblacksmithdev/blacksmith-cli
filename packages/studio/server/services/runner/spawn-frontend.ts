import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import type { ProcessInfo, RunnerTarget } from './types.js'
import { findAvailablePort } from './port-utils.js'
import { loadProjectConfig } from './config.js'

export async function spawnFrontend(
  projectRoot: string,
  processes: Map<RunnerTarget, ProcessInfo>,
  emit: (source: RunnerTarget, line: string) => void,
  emitStatus: () => void,
): Promise<void> {
  if (processes.has('frontend')) return

  const config = loadProjectConfig(projectRoot)
  const port = await findAvailablePort(config.frontendPort)
  const frontendDir = path.join(projectRoot, 'frontend')

  if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
    emit('frontend', '[studio] Error: No package.json found in frontend/')
    return
  }

  emit('frontend', `[studio] Starting Vite on port ${port}...`)

  const proc = spawn('npm', ['run', 'dev', '--', '--port', String(port)], {
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
    shell: true,
  })

  const info: ProcessInfo = { process: proc, port, status: 'starting' }
  processes.set('frontend', info)

  const setRunning = () => {
    if (info.status === 'starting') {
      info.status = 'running'
      emitStatus()
    }
  }

  proc.stdout!.on('data', (chunk: Buffer) => {
    const text = chunk.toString()
    if (text.includes('Local:') || text.includes('ready')) setRunning()
    for (const line of text.split('\n').filter(Boolean)) {
      emit('frontend', line)
    }
  })

  proc.stderr!.on('data', (chunk: Buffer) => {
    for (const line of chunk.toString().split('\n').filter(Boolean)) {
      emit('frontend', line)
    }
  })

  proc.on('close', (code) => {
    processes.delete('frontend')
    emit('frontend', `[studio] Vite stopped (exit code ${code})`)
    emitStatus()
  })

  proc.on('error', (err) => {
    processes.delete('frontend')
    emit('frontend', `[studio] Vite error: ${err.message}`)
    emitStatus()
  })

  emitStatus()
}
