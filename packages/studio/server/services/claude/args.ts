import { STUDIO_SYSTEM_PROMPT } from './system-prompt.js'

export interface ClaudeArgsOptions {
  sessionId: string
  prompt: string
  model?: string
  maxBudget?: number | null
  permissionMode?: string
  customInstructions?: string
}

/**
 * Build the CLI arguments for a Claude Code subprocess.
 * Accepts optional settings overrides for model, budget, permissions, and custom instructions.
 */
export function buildClaudeArgs(options: ClaudeArgsOptions): string[] {
  const {
    sessionId,
    prompt,
    model,
    maxBudget,
    permissionMode = 'bypassPermissions',
    customInstructions,
  } = options

  const systemPrompt = customInstructions
    ? `${STUDIO_SYSTEM_PROMPT}\n\n## User's Custom Instructions\n\n${customInstructions}`
    : STUDIO_SYSTEM_PROMPT

  const args = [
    '-p', prompt,
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages',
    '--session-id', sessionId,
    '--permission-mode', permissionMode,
    '--append-system-prompt', systemPrompt,
  ]

  if (model) {
    args.push('--model', model)
  }

  if (maxBudget != null && maxBudget > 0) {
    args.push('--max-budget-usd', String(maxBudget))
  }

  return args
}
