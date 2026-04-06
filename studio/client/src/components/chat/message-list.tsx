import { useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { MessageBubble } from './message-bubble'
import { StreamingIndicator } from './streaming-indicator'
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
    <Box
      flex={1}
      overflowY="auto"
      css={{
        padding: '16px 24px',
      }}
    >
      <Box
        css={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((msg, i) => (
          <Box key={msg.id}>
            {i > 0 && msg.role !== messages[i - 1]?.role && (
              <Box
                css={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
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
    </Box>
  )
}
