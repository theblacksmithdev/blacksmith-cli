import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface SettingsSectionProps {
  id: string
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}

export function SettingsSection({ id, icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <Box id={id} css={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <HStack gap={3} css={{ marginBottom: '6px' }}>
        <Box
          css={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'var(--studio-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--studio-text-secondary)',
            flexShrink: 0,
          }}
        >
          <Icon size={14} />
        </Box>
        <Box>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            {title}
          </Text>
        </Box>
      </HStack>
      <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', marginBottom: '16px', paddingLeft: '40px' }}>
        {description}
      </Text>
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
    </Box>
  )
}
