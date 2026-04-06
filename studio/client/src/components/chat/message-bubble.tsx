import { Box, HStack, Text, Avatar } from '@chakra-ui/react'
import { Bot, User } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { ToolCallCard } from './tool-call-card'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <HStack align="start" gap={3} py={3} px={4}>
      <Avatar.Root size="sm">
        <Avatar.Fallback bg={isUser ? 'blue.500' : 'purple.500'}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </Avatar.Fallback>
      </Avatar.Root>
      <Box flex={1} minW={0}>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
          {isUser ? 'You' : 'Claude'}
        </Text>
        {isUser ? (
          <Text fontSize="sm" whiteSpace="pre-wrap">{message.content}</Text>
        ) : (
          <>
            <MarkdownRenderer content={message.content} />
            {message.toolCalls?.map((tc) => (
              <ToolCallCard key={tc.toolId} toolCall={tc} />
            ))}
          </>
        )}
      </Box>
    </HStack>
  )
}
