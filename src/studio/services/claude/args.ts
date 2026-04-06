import { STUDIO_SYSTEM_PROMPT } from './system-prompt.js'

/**
 * Build the CLI arguments for a Claude Code subprocess.
 */
export function buildClaudeArgs(sessionId: string, prompt: string): string[] {
  return [
    '-p', prompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages',
    '--session-id', sessionId,
    '--permission-mode', 'bypassPermissions',
    '--append-system-prompt', STUDIO_SYSTEM_PROMPT,
  ]
}
