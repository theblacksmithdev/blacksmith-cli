import { Box, HStack, VStack, Text, Badge } from '@chakra-ui/react'
import {
  Layout, Database, Zap, Bug, Component, RefreshCw, TestTube, Sparkles,
} from 'lucide-react'
import type { PromptTemplate } from '@/types'

const iconMap: Record<string, typeof Layout> = {
  Layout, Database, Zap, Bug, Component, RefreshCw, TestTube, Sparkles,
}

interface TemplateCardProps {
  template: PromptTemplate
  onClick: () => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const Icon = iconMap[template.icon] || Sparkles

  return (
    <Box
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.600"
      bg="gray.800"
      cursor="pointer"
      _hover={{ borderColor: 'blue.400', bg: 'gray.750' }}
      transition="all 0.15s"
      onClick={onClick}
    >
      <VStack align="start" gap={2}>
        <HStack>
          <Icon size={18} />
          <Text fontWeight="semibold" fontSize="sm">{template.name}</Text>
        </HStack>
        <Text fontSize="xs" color="gray.400">{template.description}</Text>
        <Badge variant="subtle" colorPalette="blue" fontSize="xs">{template.category}</Badge>
      </VStack>
    </Box>
  )
}
