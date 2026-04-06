import { Box, VStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <VStack gap={4} py={20}>
      {icon && (
        <Box
          css={{
            color: '#555568',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}
      <VStack gap={2}>
        <Text
          css={{
            fontWeight: 600,
            fontSize: '16px',
            color: '#8888a0',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            css={{
              fontSize: '13px',
              textAlign: 'center',
              maxWidth: '320px',
              color: '#555568',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Text>
        )}
      </VStack>
      {action}
    </VStack>
  )
}
