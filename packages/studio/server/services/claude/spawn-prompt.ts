import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { buildClaudeArgs, type ClaudeArgsOptions } from './args.js'
import { createNdjsonParser } from './ndjson-parser.js'
import type { ChunkCallback } from './types.js'

export interface SpawnOptions extends Omit<ClaudeArgsOptions, 'sessionId' | 'prompt'> {
  sessionId: string
  prompt: string
  projectRoot: string
}

/**
 * Spawn a Claude Code subprocess for a single prompt.
 * Returns a promise that resolves on successful exit, rejects on error.
 * The returned ChildProcess can be used to cancel (kill) the prompt.
 */
export function spawnClaudePrompt(
  options: SpawnOptions,
  onChunk: ChunkCallback,
): { promise: Promise<void>; process: ChildProcess } {
  const { sessionId, prompt, projectRoot, ...argsOptions } = options
  console.log(`[claude] Spawning for session ${sessionId}, prompt: "${prompt.slice(0, 80)}..."`)

  const args = buildClaudeArgs({ sessionId, prompt, ...argsOptions })

  const proc = spawn('claude', args, {
    cwd: options.projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })

  const parser = createNdjsonParser(onChunk)
  let stderrBuffer = ''

  const promise = new Promise<void>((resolve, reject) => {
    proc.stdout.on('data', (chunk: Buffer) => {
      parser.write(chunk.toString())
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString()
      console.log(`[claude] stderr: ${chunk.toString().trim()}`)
    })

    proc.on('close', (code, signal) => {
      console.log(`[claude] Process exited: code=${code}, signal=${signal}`)
      parser.flush()

      if (code === 0 || code === null) {
        resolve()
      } else {
        const errorMsg = stderrBuffer.trim() || `Claude process exited with code ${code}`
        reject(new Error(errorMsg))
      }
    })

    proc.on('error', (err) => {
      console.error(`[claude] Spawn error:`, err)
      reject(new Error(`Failed to spawn claude: ${err.message}`))
    })
  })

  return { promise, process: proc }
}
