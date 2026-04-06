import { Box, VStack } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { MessageSquare, PanelLeft, Plus } from 'lucide-react'
import { iconBtn } from './styles'
import { navItems } from './sidebar-nav'
import { SidebarUtility } from './sidebar-utility'
import { Path } from '@/router/paths'

interface SidebarCollapsedProps {
  locationPathname: string
  isOnline: boolean
  mode: string
  onToggleSidebar: () => void
  onNewChat: () => void
  onNavigate: (path: string) => void
  onToggleTheme: () => void
}

export function SidebarCollapsed({
  locationPathname,
  isOnline,
  mode,
  onToggleSidebar,
  onNewChat,
  onNavigate,
  onToggleTheme,
}: SidebarCollapsedProps) {
  return (
    <Box
      as="nav"
      css={{
        width: '56px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        flexShrink: 0,
        paddingTop: '12px',
        paddingBottom: '10px',
      }}
    >
      {/* 1. Header — expand toggle */}
      <Tooltip content="Expand sidebar">
        <Box
          as="button"
          onClick={onToggleSidebar}
          css={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--studio-text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '8px',
            flexShrink: 0,
            transition: 'all 0.12s ease',
            '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
          }}
        >
          <PanelLeft size={18} />
        </Box>
      </Tooltip>

      {/* 2. New chat */}
      <Tooltip content="New conversation">
        <Box
          as="button"
          onClick={onNewChat}
          css={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-surface)',
            color: 'var(--studio-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '8px',
            flexShrink: 0,
            transition: 'all 0.12s ease',
            '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
          }}
        >
          <Plus size={16} />
        </Box>
      </Tooltip>

      {/* 3. Sessions area (just spacer in collapsed — no room for list) */}
      <Box css={{ flex: 1 }} />

      {/* 4. Nav menu */}
      <VStack
        gap={1}
        css={{
          borderTop: '1px solid var(--studio-border)',
          paddingTop: '8px',
          marginTop: '4px',
          flexShrink: 0,
        }}
      >
        <Tooltip content="Chat">
          <Box as="button" onClick={() => onNavigate(Path.Home)} css={iconBtn(locationPathname.startsWith('/chat'))}>
            <MessageSquare size={17} />
          </Box>
        </Tooltip>
        {navItems.map(({ path, icon: Icon, label }) => (
          <Tooltip key={path} content={label}>
            <Box as="button" onClick={() => onNavigate(path)} css={iconBtn(locationPathname === path)}>
              <Icon size={17} />
            </Box>
          </Tooltip>
        ))}
      </VStack>

      {/* 5. Utility bar */}
      <SidebarUtility variant="collapsed" isOnline={isOnline} mode={mode} onToggleTheme={onToggleTheme} />
    </Box>
  )
}
