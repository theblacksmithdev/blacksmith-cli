import { Box, HStack, Text, Badge, Code } from '@chakra-ui/react'
import { FileEdit, Terminal, Eye, FileSearch } from 'lucide-react'
import type { ToolCall } from '@/types'

const toolIcons: Record<string, typeof FileEdit> = {
  Edit: FileEdit,
  Write: FileEdit,
  Bash: Terminal,
  Read: Eye,
  Grep: FileSearch,
}

interface ToolCallCardProps {
  toolCall: ToolCall
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const Icon = toolIcons[toolCall.toolName] || Terminal

  const summary = (() => {
    const input = toolCall.input
    if (toolCall.toolName === 'Edit' || toolCall.toolName === 'Write') {
      return (input as any).file_path || (input as any).path || 'file'
    }
    if (toolCall.toolName === 'Bash') {
      return (input as any).command || ''
    }
    if (toolCall.toolName === 'Read') {
      return (input as any).file_path || ''
    }
    return JSON.stringify(input).slice(0, 100)
  })()

  return (
    <Box
      mt={2}
      p={2}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.600"
      bg="gray.800"
      fontSize="xs"
    >
      <HStack gap={2}>
        <Icon size={14} />
        <Badge colorPalette="blue" variant="subtle" fontSize="xs">
          {toolCall.toolName}
        </Badge>
        <Code fontSize="xs" bg="transparent" color="gray.300" lineClamp={1}>
          {summary}
        </Code>
      </HStack>
    </Box>
  )
}
