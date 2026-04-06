import { Box, Text, HStack } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { Sun, Moon } from 'lucide-react'

interface SidebarUtilityExpandedProps {
  variant: 'expanded'
  isOnline: boolean
  mode: string
  onToggleTheme: () => void
}

interface SidebarUtilityCollapsedProps {
  variant: 'collapsed'
  isOnline: boolean
  mode: string
  onToggleTheme: () => void
}

type SidebarUtilityProps = SidebarUtilityExpandedProps | SidebarUtilityCollapsedProps

export function SidebarUtility({ variant, isOnline, mode, onToggleTheme }: SidebarUtilityProps) {
  if (variant === 'collapsed') {
    return (
      <Box
        css={{
          borderTop: '1px solid var(--studio-border)',
          paddingTop: '8px',
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Box
            as="button"
            onClick={onToggleTheme}
            css={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-surface)',
              color: 'var(--studio-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                background: 'var(--studio-bg-hover)',
                color: 'var(--studio-text-primary)',
                borderColor: 'var(--studio-border-hover)',
              },
            }}
          >
            {mode === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </Box>
        </Tooltip>
        <Box
          css={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isOnline ? 'var(--studio-green)' : 'var(--studio-error)',
          }}
        />
      </Box>
    )
  }

  return (
    <Box
      css={{
        borderTop: '1px solid var(--studio-border)',
        padding: '8px 12px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <HStack gap={2}>
        <Box css={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? 'var(--studio-green)' : 'var(--studio-error)', flexShrink: 0 }} />
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </HStack>
      <Box
        as="button"
        onClick={onToggleTheme}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '100px',
          border: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-surface)',
          color: 'var(--studio-text-secondary)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-primary)', borderColor: 'var(--studio-border-hover)' },
        }}
      >
        {mode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        {mode === 'dark' ? 'Light' : 'Dark'}
      </Box>
    </Box>
  )
}
