import { useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { MessageBubble } from './message-bubble'
import { StreamingIndicator } from './streaming-indicator'
import { PageContainer } from '@/components/shared/page-container'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  partialMessage: string | null
}

export function MessageList({ messages, isStreaming, partialMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partialMessage])

  return (
    <Box flex={1} overflowY="auto">
      <PageContainer padded={false}>
        <Box css={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <Box key={msg.id}>
              {i > 0 && msg.role !== messages[i - 1]?.role && (
                <Box
                  css={{
                    height: '1px',
                    background: 'var(--studio-border)',
                    margin: '8px 0 16px',
                  }}
                />
              )}
              <MessageBubble message={msg} />
            </Box>
          ))}
          {isStreaming && <StreamingIndicator partialMessage={partialMessage} />}
          <div ref={bottomRef} />
        </Box>
      </PageContainer>
    </Box>
  )
}
