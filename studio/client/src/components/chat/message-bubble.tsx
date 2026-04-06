import { Box, Text } from '@chakra-ui/react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { ToolCallCard } from './tool-call-card'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <Box
      css={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '4px 0',
        animation: 'fadeIn 0.3s ease',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        css={{
          maxWidth: isUser ? '85%' : '100%',
          width: isUser ? 'auto' : '100%',
        }}
      >
        {/* Role label */}
        <Text
          css={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#8e8e8e',
            marginBottom: '6px',
            textAlign: isUser ? 'right' : 'left',
            paddingLeft: isUser ? '0' : '12px',
            paddingRight: isUser ? '0' : '0',
          }}
        >
          {isUser ? 'You' : 'Claude'}
        </Text>

        {isUser ? (
          <Box
            css={{
              background: '#2f2f2f',
              borderRadius: '14px 14px 4px 14px',
              padding: '12px 16px',
              borderLeft: 'none',
            }}
          >
            <Text css={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#ececec' }}>
              {message.content}
            </Text>
          </Box>
        ) : (
          <Box
            css={{
              borderLeft: '2px solid rgba(255,255,255,0.08)',
              paddingLeft: '16px',
              paddingTop: '2px',
              paddingBottom: '2px',
            }}
          >
            <MarkdownRenderer content={message.content} />
            {message.toolCalls?.map((tc) => (
              <ToolCallCard key={tc.toolId} toolCall={tc} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
