import type { ChunkCallback } from './types.js'

/**
 * Creates an NDJSON (newline-delimited JSON) stream parser.
 * Buffers incoming data and emits parsed JSON objects line by line.
 */
export function createNdjsonParser(onChunk: ChunkCallback) {
  let buffer = ''

  return {
    write(data: string) {
      buffer += data
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
    },

    flush() {
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer)
          onChunk(parsed)
        } catch {
          // Ignore incomplete data
        }
        buffer = ''
      }
    },
  }
}
