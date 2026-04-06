import { useEffect, useCallback, useRef } from 'react'
import { useSocket } from './use-socket'
import { useChatStore } from '@/stores/chat-store'
import { useFileStore } from '@/stores/file-store'

export function useClaude() {
  const socket = useSocket()
  const lastContentRef = useRef('')
  const chatStore = useChatStore
  const markChanged = useFileStore((s) => s.markChanged)

  useEffect(() => {
    const onMessage = (data: { sessionId: string; content: string; isPartial: boolean }) => {
      lastContentRef.current = data.content
      chatStore.getState().updateStreamingMessage(data.content)
    }

    const onToolUse = (data: { sessionId: string; toolId: string; toolName: string; input: Record<string, unknown> }) => {
      chatStore.getState().addToolCall({
        toolId: data.toolId,
        toolName: data.toolName,
        input: data.input,
      })
    }

    const onDone = () => {
      chatStore.getState().finalizeAssistantMessage(lastContentRef.current)
      lastContentRef.current = ''
    }

    const onError = (data: { sessionId: string; error: string; code: string }) => {
      chatStore.getState().finalizeAssistantMessage(`Error: ${data.error}`)
      lastContentRef.current = ''
    }

    const onFilesChanged = (data: { paths: string[] }) => {
      markChanged(data.paths)
    }

    socket.on('claude:message', onMessage)
    socket.on('claude:tool_use', onToolUse)
    socket.on('claude:done', onDone)
    socket.on('claude:error', onError)
    socket.on('files:changed', onFilesChanged)

    return () => {
      socket.off('claude:message', onMessage)
      socket.off('claude:tool_use', onToolUse)
      socket.off('claude:done', onDone)
      socket.off('claude:error', onError)
      socket.off('files:changed', onFilesChanged)
    }
  }, [socket, markChanged])

  const sendPrompt = useCallback(
    (prompt: string, sessionId: string) => {
      const store = chatStore.getState()
      store.addUserMessage(prompt)
      store.setStreaming(true)
      store.updateStreamingMessage('')
      lastContentRef.current = ''
      socket.emit('prompt:send', { sessionId, prompt })
    },
    [socket],
  )

  const cancelPrompt = useCallback(
    (sessionId: string) => {
      socket.emit('prompt:cancel', { sessionId })
      chatStore.getState().setStreaming(false)
    },
    [socket],
  )

  return { sendPrompt, cancelPrompt }
}
