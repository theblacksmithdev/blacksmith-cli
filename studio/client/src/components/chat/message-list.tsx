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
    <Box flex={1} overflowY="auto" py={2}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && <StreamingIndicator partialMessage={partialMessage} />}
      <div ref={bottomRef} />
    </Box>
  )
}
