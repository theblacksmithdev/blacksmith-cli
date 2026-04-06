import { Box, Text } from '@chakra-ui/react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'

interface StreamingIndicatorProps {
  partialMessage: string | null
}

export function StreamingIndicator({ partialMessage }: StreamingIndicatorProps) {
  return (
    <Box>
      {/* Role label */}
      <Text
        css={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--studio-text-tertiary)',
          marginBottom: '6px',
          paddingLeft: '12px',
        }}
      >
        Claude
      </Text>

      <Box
        css={{
          borderLeft: '2px solid var(--studio-border)',
          paddingLeft: '16px',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
      >
        {partialMessage ? (
          <MarkdownRenderer content={partialMessage + ' \u258A'} />
        ) : (
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 0',
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                css={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--studio-text-secondary)',
                  animation: `dotPulse 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
