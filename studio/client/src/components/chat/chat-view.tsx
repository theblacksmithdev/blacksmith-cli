import { useEffect } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { MessageSquare } from 'lucide-react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { EmptyState } from '@/components/shared/empty-state'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'

export function ChatView() {
  const { sendPrompt, cancelPrompt } = useClaude()
  const { createSession } = useSessions()
  const { messages, isStreaming, partialMessage } = useChatStore()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)

  const handleSend = async (text: string) => {
    let sessionId = activeSessionId
    if (!sessionId) {
      const session = await createSession()
      sessionId = session.id
    }
    sendPrompt(text, sessionId!)
  }

  const handleCancel = () => {
    if (activeSessionId) {
      cancelPrompt(activeSessionId)
    }
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <Box display="flex" flexDir="column" h="full">
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <EmptyState
            icon={<MessageSquare size={40} />}
            title="Start a conversation"
            description="Describe what you want to build and Claude will help you create it."
          />
        </Box>
        <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
      </Box>
    )
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
