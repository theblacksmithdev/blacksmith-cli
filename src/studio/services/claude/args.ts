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
  ]
}
