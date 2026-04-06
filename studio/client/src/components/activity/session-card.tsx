import { Box, HStack, VStack, Text, IconButton } from '@chakra-ui/react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { formatDate, truncate } from '@/lib/format'
import type { SessionSummary } from '@/types'

interface SessionCardProps {
  session: SessionSummary
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function SessionCard({ session, isActive, onSelect, onDelete }: SessionCardProps) {
  return (
    <Box
      p={3}
      borderRadius="md"
      border="1px solid"
      borderColor={isActive ? 'blue.400' : 'gray.600'}
      bg={isActive ? 'blue.900' : 'gray.800'}
      cursor="pointer"
      _hover={{ borderColor: 'blue.400' }}
      transition="all 0.15s"
      onClick={onSelect}
    >
      <HStack justify="space-between">
        <VStack align="start" gap={1} flex={1} minW={0}>
          <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>{session.name}</Text>
          {session.lastPrompt && (
            <Text fontSize="xs" color="gray.400" lineClamp={1}>
              {truncate(session.lastPrompt, 60)}
            </Text>
          )}
          <HStack gap={3} fontSize="xs" color="gray.500">
            <HStack gap={1}>
              <MessageSquare size={10} />
              <Text>{session.messageCount} messages</Text>
            </HStack>
            <Text>{formatDate(session.updatedAt)}</Text>
          </HStack>
        </VStack>
        <Tooltip content="Delete session">
          <IconButton
            aria-label="Delete"
            variant="ghost"
            size="xs"
            colorPalette="red"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 size={14} />
          </IconButton>
        </Tooltip>
      </HStack>
    </Box>
  )
}
