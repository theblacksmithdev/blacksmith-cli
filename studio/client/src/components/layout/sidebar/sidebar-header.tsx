import { Box, Text, HStack } from '@chakra-ui/react'
import { Anvil, PanelLeftClose, Plus } from 'lucide-react'
import { Path } from '@/router/paths'

interface SidebarHeaderProps {
  onNavigate: (path: string) => void
  onToggle: () => void
  onNewChat: () => void
}

export function SidebarHeader({ onNavigate, onToggle, onNewChat }: SidebarHeaderProps) {
  return (
    <Box css={{ padding: '12px 12px 8px', flexShrink: 0 }}>
      <HStack gap={0} justify="space-between" css={{ marginBottom: '12px', padding: '0 4px' }}>
        <HStack gap={3} as="button" onClick={() => onNavigate(Path.Home)} css={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          <Box
            css={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'var(--studio-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 0.15s ease',
              '&:hover': { opacity: 0.85 },
            }}
          >
            <Anvil size={14} color="var(--studio-accent-fg)" />
          </Box>
          <Text
            css={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--studio-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Studio
          </Text>
        </HStack>
        <Box
          as="button"
          onClick={onToggle}
          css={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--studio-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
          }}
        >
          <PanelLeftClose size={15} />
        </Box>
      </HStack>

      {/* New Chat */}
      <Box
        as="button"
        onClick={onNewChat}
        css={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-surface)',
          color: 'var(--studio-text-primary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
        }}
      >
        <Plus size={15} />
        New conversation
      </Box>
    </Box>
  )
}
