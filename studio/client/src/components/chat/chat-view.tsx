import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { Code, Palette, Database, Zap } from 'lucide-react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { useClaude } from '@/hooks/use-claude'
import { useSessions } from '@/hooks/use-sessions'
import { useChatStore } from '@/stores/chat-store'
import { useSessionStore } from '@/stores/session-store'

const suggestions = [
  { icon: Code, label: 'Build a REST API', prompt: 'Build a REST API with Express and TypeScript' },
  { icon: Palette, label: 'Create a landing page', prompt: 'Create a modern landing page with React and Tailwind CSS' },
  { icon: Database, label: 'Set up a database', prompt: 'Set up a PostgreSQL database with Prisma ORM' },
  { icon: Zap, label: 'Add authentication', prompt: 'Add JWT authentication to my Express API' },
]

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
          <VStack gap={8} css={{ maxWidth: '560px', padding: '0 24px' }}>
            <VStack gap={3}>
              <Text
                css={{
                  fontSize: '32px',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #f0f0f5 0%, #8888a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                What would you like to build?
              </Text>
              <Text
                css={{
                  fontSize: '14px',
                  color: '#555568',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Describe what you want and Claude will help you create it.
              </Text>
            </VStack>

            {/* Suggestion chips */}
            <Box
              css={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                width: '100%',
              }}
            >
              {suggestions.map(({ icon: Icon, label, prompt }) => (
                <Box
                  key={label}
                  as="button"
                  onClick={() => handleSend(prompt)}
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: '#12121a',
                    color: '#8888a0',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    '&:hover': {
                      background: '#1a1a26',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: '#f0f0f5',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Box>
              ))}
            </Box>
          </VStack>
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
