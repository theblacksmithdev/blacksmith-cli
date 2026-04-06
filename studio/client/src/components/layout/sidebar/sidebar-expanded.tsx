import { Box, VStack } from '@chakra-ui/react'
import { SidebarHeader } from './sidebar-header'
import { SidebarSessions } from './sidebar-sessions'
import { SidebarUtility } from './sidebar-utility'
import { navItems } from './sidebar-nav'
import { navRow } from './styles'

interface Session {
  id: string
  name: string
  lastPrompt?: string
}

interface SidebarExpandedProps {
  locationPathname: string
  isOnline: boolean
  mode: string
  activeSessionId: string | null
  recentSessions: Session[]
  onToggleSidebar: () => void
  onNewChat: () => void
  onNavigate: (path: string) => void
  onToggleTheme: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

export function SidebarExpanded({
  locationPathname,
  isOnline,
  mode,
  activeSessionId,
  recentSessions,
  onToggleSidebar,
  onNewChat,
  onNavigate,
  onToggleTheme,
  onSelectSession,
  onDeleteSession,
}: SidebarExpandedProps) {
  return (
    <Box
      as="nav"
      css={{
        width: '260px',
        background: 'var(--studio-bg-sidebar)',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. Header — logo + brand + collapse */}
      <SidebarHeader onNavigate={onNavigate} onToggle={onToggleSidebar} onNewChat={onNewChat} />

      {/* 3. Sessions */}
      <Box css={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        <SidebarSessions
          sessions={recentSessions}
          activeSessionId={activeSessionId}
          locationPathname={locationPathname}
          onSelectSession={onSelectSession}
          onDeleteSession={onDeleteSession}
        />
      </Box>

      {/* 4. Nav menu */}
      <Box css={{ borderTop: '1px solid var(--studio-border)', padding: '6px 8px', flexShrink: 0 }}>
        <VStack gap={0} align="stretch">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Box key={path} as="button" onClick={() => onNavigate(path)} css={navRow(locationPathname === path)}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* 5. Utility bar */}
      <SidebarUtility variant="expanded" isOnline={isOnline} mode={mode} onToggleTheme={onToggleTheme} />
    </Box>
  )
}
