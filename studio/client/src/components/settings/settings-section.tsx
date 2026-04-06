import { Box, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  description: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <VStack gap={0} align="stretch">
      <Box css={{ marginBottom: '16px' }}>
        <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
          {title}
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
          {description}
        </Text>
      </Box>
      <VStack
        gap={0}
        align="stretch"
        css={{
          borderRadius: '10px',
          border: '1px solid var(--studio-border)',
          overflow: 'hidden',
          background: 'var(--studio-bg-sidebar)',
        }}
      >
        {children}
      </VStack>
    </VStack>
  )
}
