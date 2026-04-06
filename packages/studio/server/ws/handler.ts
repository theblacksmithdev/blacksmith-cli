import type { Server as SocketServer } from 'socket.io'
import crypto from 'node:crypto'
import { PROMPT_SEND, PROMPT_CANCEL, CLAUDE_MESSAGE, CLAUDE_TOOL_USE, CLAUDE_DONE, CLAUDE_ERROR, RUNNER_START, RUNNER_STOP, RUNNER_STATUS, RUNNER_OUTPUT } from './events.js'
import type { ProjectManager } from '../services/projects.js'
import type { ClaudeManager } from '../services/claude/index.js'
import type { SessionManager } from '../services/sessions.js'
import type { SettingsManager } from '../services/settings.js'
import type { RunnerManager, RunnerTarget } from '../services/runner/index.js'

export function setupSocketHandlers(
  io: SocketServer,
  projectManager: ProjectManager,
  claudeManager: ClaudeManager,
  sessionManager: SessionManager,
  settingsManager: SettingsManager,
  runnerManager: RunnerManager,
) {
  runnerManager.onOutput((source, line) => {
    io.emit(RUNNER_OUTPUT, { source, line })
  })

  runnerManager.onStatusChange(() => {
    io.emit(RUNNER_STATUS, runnerManager.getStatus())
  })

  io.on('connection', (socket) => {
    console.log(`[ws] Client connected: ${socket.id}`)

    socket.on(PROMPT_SEND, async (data: { sessionId: string; prompt: string }) => {
      const { sessionId, prompt } = data
      const projectId = projectManager.getActiveId()
      const projectPath = projectManager.getActivePath()

      if (!projectId || !projectPath) {
        socket.emit(CLAUDE_ERROR, { sessionId, error: 'No active project', code: 'NO_PROJECT' })
        return
      }

      console.log(`[ws] prompt:send — session=${sessionId}, prompt="${prompt.slice(0, 80)}..."`)

      sessionManager.addMessage(sessionId, {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      })

      const allSettings = settingsManager.getAll(projectId)

      let lastContent = ''
      const toolCalls: any[] = []

      try {
        await claudeManager.sendPrompt({
          sessionId,
          prompt,
          projectRoot: projectPath,
          model: allSettings['ai.model'] || undefined,
          maxBudget: allSettings['ai.maxBudget'] || undefined,
          permissionMode: allSettings['ai.permissionMode'] || 'bypassPermissions',
          customInstructions: allSettings['ai.customInstructions'] || undefined,
        }, (chunk) => {
          if (chunk.type === 'assistant') {
            const textBlocks = (chunk.message?.content || []).filter((b: any) => b.type === 'text')
            const toolBlocks = (chunk.message?.content || []).filter((b: any) => b.type === 'tool_use')

            if (textBlocks.length > 0) {
              lastContent = textBlocks.map((b: any) => b.text).join('')
              socket.emit(CLAUDE_MESSAGE, { sessionId, content: lastContent, isPartial: !chunk.stop_reason })
            }

            for (const tool of toolBlocks) {
              toolCalls.push({ toolId: tool.id, toolName: tool.name, input: tool.input })
              socket.emit(CLAUDE_TOOL_USE, { sessionId, toolId: tool.id, toolName: tool.name, input: tool.input })
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
            socket.emit(CLAUDE_DONE, { sessionId, costUsd: chunk.cost_usd || 0, durationMs: chunk.duration_ms || 0 })
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
        socket.emit(CLAUDE_ERROR, { sessionId, error: error.message || 'Unknown error', code: 'PROCESS_ERROR' })
      }
    })

    socket.on(PROMPT_CANCEL, (data: { sessionId: string }) => {
      claudeManager.cancelPrompt(data.sessionId)
    })

    // Runner events
    socket.on(RUNNER_START, async (data: { target: RunnerTarget | 'all' }) => {
      const projectPath = projectManager.getActivePath()
      if (!projectPath) {
        socket.emit(RUNNER_OUTPUT, { source: 'backend', line: '[studio] No active project' })
        return
      }
      if (data.target === 'all') await runnerManager.startAll(projectPath)
      else if (data.target === 'backend') await runnerManager.startBackend(projectPath)
      else if (data.target === 'frontend') await runnerManager.startFrontend(projectPath)
    })

    socket.on(RUNNER_STOP, (data: { target: RunnerTarget | 'all' }) => {
      if (data.target === 'all') runnerManager.stopAll()
      else if (data.target === 'backend') runnerManager.stopBackend()
      else if (data.target === 'frontend') runnerManager.stopFrontend()
    })

    socket.emit(RUNNER_STATUS, runnerManager.getStatus())

    socket.on('disconnect', () => {
      console.log(`[ws] Client disconnected: ${socket.id}`)
    })
  })
}
