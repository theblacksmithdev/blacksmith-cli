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
            color: '#55555f',
            background: 'rgba(13,148,136,0.08)',
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
            color: '#85858f',
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
              color: '#55555f',
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
