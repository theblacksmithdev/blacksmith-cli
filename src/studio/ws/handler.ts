import type { Server as SocketServer } from 'socket.io'
import crypto from 'node:crypto'
import { PROMPT_SEND, PROMPT_CANCEL, CLAUDE_MESSAGE, CLAUDE_TOOL_USE, CLAUDE_DONE, CLAUDE_ERROR } from './events.js'
import type { ClaudeManager } from '../services/claude/index.js'
import type { SessionManager } from '../services/sessions.js'
import type { SettingsManager } from '../services/settings.js'

export function setupSocketHandlers(
  io: SocketServer,
  claudeManager: ClaudeManager,
  sessionManager: SessionManager,
  settingsManager: SettingsManager,
) {
  io.on('connection', (socket) => {
    console.log(`[ws] Client connected: ${socket.id}`)

    socket.on(PROMPT_SEND, async (data: { sessionId: string; prompt: string }) => {
      const { sessionId, prompt } = data
      console.log(`[ws] prompt:send — session=${sessionId}, prompt="${prompt.slice(0, 80)}..."`)

      // Persist user message
      sessionManager.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      })

      // Read AI settings
      const allSettings = settingsManager.getAll()

      let lastContent = ''
      const toolCalls: any[] = []

      try {
        await claudeManager.sendPrompt({
          sessionId,
          prompt,
          model: allSettings['ai.model'] || undefined,
          maxBudget: allSettings['ai.maxBudget'] || undefined,
          permissionMode: allSettings['ai.permissionMode'] || 'bypassPermissions',
          customInstructions: allSettings['ai.customInstructions'] || undefined,
        }, (chunk) => {
          if (chunk.type === 'assistant') {
            const textBlocks = (chunk.message?.content || []).filter(
              (b: any) => b.type === 'text',
            )
            const toolBlocks = (chunk.message?.content || []).filter(
              (b: any) => b.type === 'tool_use',
            )

            if (textBlocks.length > 0) {
              lastContent = textBlocks.map((b: any) => b.text).join('')
              socket.emit(CLAUDE_MESSAGE, {
                sessionId,
                content: lastContent,
                isPartial: !chunk.stop_reason,
              })
            }

            for (const tool of toolBlocks) {
              toolCalls.push({
                toolId: tool.id,
                toolName: tool.name,
                input: tool.input,
              })
              socket.emit(CLAUDE_TOOL_USE, {
                sessionId,
                toolId: tool.id,
                toolName: tool.name,
                input: tool.input,
              })
            }
          } else if (chunk.type === 'result') {
            if (lastContent) {
              sessionManager.addMessage(sessionId, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: lastContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                timestamp: new Date().toISOString(),
              })
            }

            socket.emit(CLAUDE_DONE, {
              sessionId,
              costUsd: chunk.cost_usd || 0,
              durationMs: chunk.duration_ms || 0,
            })
          }
        })
      } catch (error: any) {
        console.error(`[ws] Claude error:`, error.message)

        sessionManager.addMessage(sessionId, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        })

        socket.emit(CLAUDE_ERROR, {
          sessionId,
          error: error.message || 'Unknown error',
          code: 'PROCESS_ERROR',
        })
      }
    })

    socket.on(PROMPT_CANCEL, (data: { sessionId: string }) => {
      console.log(`[ws] prompt:cancel — session=${data.sessionId}`)
      claudeManager.cancelPrompt(data.sessionId)
    })

    socket.on('disconnect', () => {
      console.log(`[ws] Client disconnected: ${socket.id}`)
    })
  })
}
