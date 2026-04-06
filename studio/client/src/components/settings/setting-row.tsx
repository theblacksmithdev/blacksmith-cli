import { Box, Text, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  /** If true, renders children below the label (full width) instead of inline right */
  fullWidth?: boolean
  children: ReactNode
}

export function SettingRow({ label, description, fullWidth, children }: SettingRowProps) {
  if (fullWidth) {
    return (
      <Box
        css={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--studio-border)',
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
          {label}
        </Text>
        {description && (
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginBottom: '10px' }}>
            {description}
          </Text>
        )}
        {children}
      </Box>
    )
  }

  return (
    <HStack
      gap={4}
      css={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--studio-border)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
          {label}
        </Text>
        {description && (
          <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', marginTop: '1px' }}>
            {description}
          </Text>
        )}
      </Box>
      <Box css={{ flexShrink: 0 }}>
        {children}
      </Box>
    </HStack>
  )
}
