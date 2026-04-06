import { Box, HStack, Text, Badge, Code } from '@chakra-ui/react'
import { EmptyState } from '@/components/shared/empty-state'
import { Eye } from 'lucide-react'

interface FileViewerProps {
  filePath: string | null
  content: string | null
  language: string
  isChanged: boolean
}

export function FileViewer({ filePath, content, language, isChanged }: FileViewerProps) {
  if (!filePath || content === null) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="full">
        <EmptyState
          icon={<Eye size={32} />}
          title="Select a file"
          description="Click a file in the tree to view its contents."
        />
      </Box>
    )
  }

  return (
    <Box h="full" display="flex" flexDir="column">
      <HStack px={3} py={2} borderBottom="1px solid" borderColor="gray.700" bg="gray.800">
        <Text fontSize="xs" color="gray.400" flex={1} lineClamp={1}>{filePath}</Text>
        {isChanged && <Badge colorPalette="orange" fontSize="xs">Modified by Claude</Badge>}
        <Badge variant="subtle" fontSize="xs">{language}</Badge>
      </HStack>
      <Box flex={1} overflowY="auto" p={3} bg="gray.900">
        <Code
          display="block"
          whiteSpace="pre"
          fontSize="xs"
          bg="transparent"
          color="gray.200"
          overflowX="auto"
        >
          {content}
        </Code>
      </Box>
    </Box>
  )
}
