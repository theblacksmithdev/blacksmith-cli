import { HStack, Box, Avatar } from '@chakra-ui/react'
import { Bot } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'

interface StreamingIndicatorProps {
  partialMessage: string | null
}

export function StreamingIndicator({ partialMessage }: StreamingIndicatorProps) {
  return (
    <HStack align="start" gap={3} py={3} px={4}>
      <Avatar.Root size="sm">
        <Avatar.Fallback bg="purple.500">
          <Bot size={16} />
        </Avatar.Fallback>
      </Avatar.Root>
      <Box flex={1} minW={0}>
        <Box fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>
          Claude
        </Box>
        {partialMessage ? (
          <MarkdownRenderer content={partialMessage + ' ▊'} />
        ) : (
          <HStack gap={1}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                w="6px"
                h="6px"
                borderRadius="full"
                bg="blue.400"
                animation={`pulse 1.4s ease-in-out ${i * 0.2}s infinite`}
                css={{
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.3 },
                    '50%': { opacity: 1 },
                  },
                }}
              />
            ))}
          </HStack>
        )}
      </Box>
    </HStack>
  )
}
