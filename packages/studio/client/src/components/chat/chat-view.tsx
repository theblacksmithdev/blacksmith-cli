import { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'

export function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { sendPrompt, cancelPrompt } = useClaude()
  const { loadSession } = useSessions()
  const { messages, isStreaming, partialMessage } = useChatStore()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)

  // Load session from URL param on mount or when sessionId changes
  useEffect(() => {
    if (sessionId && sessionId !== activeSessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, activeSessionId, loadSession])

  const handleSend = async (text: string) => {
    if (!sessionId) return
    sendPrompt(text, sessionId)
  }

  const handleCancel = () => {
    if (sessionId) {
      cancelPrompt(sessionId)
    }
  }

  return (
    <Box display="flex" flexDir="column" h="full">
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        partialMessage={partialMessage}
      />
      <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
    </Box>
  )
}
