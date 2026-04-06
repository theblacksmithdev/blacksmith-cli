// Client → Server
export const PROMPT_SEND = 'prompt:send'
export const PROMPT_CANCEL = 'prompt:cancel'

// Server → Client
export const CLAUDE_MESSAGE = 'claude:message'
export const CLAUDE_TOOL_USE = 'claude:tool_use'
export const CLAUDE_TOOL_RESULT = 'claude:tool_result'
export const CLAUDE_DONE = 'claude:done'
export const CLAUDE_ERROR = 'claude:error'
export const FILES_CHANGED = 'files:changed'

// Runner
export const RUNNER_START = 'runner:start'
export const RUNNER_STOP = 'runner:stop'
export const RUNNER_STATUS = 'runner:status'
export const RUNNER_OUTPUT = 'runner:output'
