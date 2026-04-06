import { VStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <VStack gap={3} py={16} color="gray.500">
      {icon}
      <Text fontWeight="medium">{title}</Text>
      {description && <Text fontSize="sm" textAlign="center" maxW="sm">{description}</Text>}
      {action}
    </VStack>
  )
}
