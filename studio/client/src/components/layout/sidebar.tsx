import { useEffect } from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { Tooltip } from '@/components/shared/tooltip'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MessageSquare,
  Sparkles,
  FolderTree,
  History,
  Settings,
  Anvil,
  Plus,
  Trash2,
  PanelLeft,
  PanelLeftClose,
  Sun,
  Moon,
} from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { useSessionStore } from '@/stores/session-store'
import { useSessions } from '@/hooks/use-sessions'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { Path } from '@/router/paths'
import { truncate } from '@/lib/format'

const navItems = [
  { path: Path.Templates, icon: Sparkles, label: 'Templates' },
  { path: Path.Files, icon: FolderTree, label: 'Files' },
  { path: Path.Activity, icon: History, label: 'Activity' },
] as const

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const sessions = useSessionStore((s) => s.sessions)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { fetchSessions, createSession, loadSession, deleteSession } = useSessions()
  const { mode, toggle: toggleTheme } = useThemeMode()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleNewChat = async () => {
    await createSession()
    navigate(Path.Chat)
  }

  const handleSelectSession = async (id: string) => {
    await loadSession(id)
    navigate(Path.Chat)
  }

  const recentSessions = sessions.slice(0, 8)

  // ─── Collapsed state (icon rail) ───
  if (collapsed) {
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
          paddingBottom: '12px',
          transition: 'width 0.2s ease',
        }}
      >
        {/* Logo — navigates home */}
        <Tooltip content="Home">
          <Box
            as="button"
            onClick={() => navigate(Path.Chat)}
            css={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--studio-accent)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'opacity 0.15s ease',
              '&:hover': { opacity: 0.85 },
            }}
          >
            <Anvil size={15} color="var(--studio-accent-fg)" />
          </Box>
        </Tooltip>

        {/* Expand toggle */}
        <Tooltip content="Expand sidebar">
          <Box
            as="button"
            onClick={toggleSidebar}
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
              transition: 'all 0.12s ease',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            <PanelLeft size={18} />
          </Box>
        </Tooltip>

        {/* New chat */}
        <Tooltip content="New conversation">
          <Box
            as="button"
            onClick={handleNewChat}
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
              marginBottom: '16px',
              transition: 'all 0.12s ease',
              '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
            }}
          >
            <Plus size={16} />
          </Box>
        </Tooltip>

        {/* Nav icons */}
        <VStack gap={1} flex={1}>
          <Tooltip content="Chat">
            <Box
              as="button"
              onClick={() => navigate(Path.Chat)}
              css={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                background: location.pathname === Path.Chat ? 'var(--studio-bg-hover)' : 'transparent',
                color: location.pathname === Path.Chat ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': {
                  background: location.pathname === Path.Chat ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
                  color: location.pathname === Path.Chat ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
                },
              }}
            >
              <MessageSquare size={18} />
            </Box>
          </Tooltip>

          {navItems.map(({ path, icon: Icon, label }) => (
            <Tooltip key={path} content={label}>
              <Box
                as="button"
                onClick={() => navigate(path)}
                css={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  background: location.pathname === path ? 'var(--studio-bg-hover)' : 'transparent',
                  color: location.pathname === path ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
                }}
              >
                <Icon size={18} />
              </Box>
            </Tooltip>
          ))}
        </VStack>

        {/* Theme toggle */}
        <Tooltip content={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Box
            as="button"
            onClick={toggleTheme}
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
              transition: 'all 0.12s ease',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Box>
        </Tooltip>

        {/* Bottom */}
        <Tooltip content="Settings">
          <Box
            as="button"
            onClick={() => navigate(Path.Settings)}
            css={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: location.pathname === Path.Settings ? 'var(--studio-bg-hover)' : 'transparent',
              color: location.pathname === Path.Settings ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            <Settings size={16} />
          </Box>
        </Tooltip>

        {/* Connection dot */}
        <Box
          css={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: connectionStatus === 'connected' ? 'var(--studio-green)' : 'var(--studio-error)',
            marginTop: '10px',
          }}
        />
      </Box>
    )
  }

  // ─── Expanded state ───
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
        transition: 'width 0.2s ease',
      }}
    >
      {/* Header */}
      <Box css={{ padding: '12px 12px 8px', flexShrink: 0 }}>
        {/* Brand row + collapse toggle */}
        <HStack
          gap={0}
          justify="space-between"
          css={{ marginBottom: '12px', padding: '0 4px' }}
        >
          <HStack gap={3}>
            <Box
              as="button"
              onClick={() => navigate(Path.Chat)}
              css={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'var(--studio-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
                '&:hover': { opacity: 0.85 },
              }}
            >
              <Anvil size={14} color="var(--studio-accent-fg)" />
            </Box>
            <Box>
              <Text
                css={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--studio-text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                Studio
              </Text>
              <HStack gap={1} css={{ marginTop: '1px' }}>
                <Box
                  css={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: connectionStatus === 'connected' ? 'var(--studio-green)' : 'var(--studio-error)',
                    flexShrink: 0,
                  }}
                />
                <Text css={{ fontSize: '10px', color: 'var(--studio-text-tertiary)' }}>
                  {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </Text>
              </HStack>
            </Box>
          </HStack>

          <Box
            as="button"
            onClick={toggleSidebar}
            css={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--studio-text-tertiary)',
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
          onClick={handleNewChat}
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
            '&:hover': {
              background: 'var(--studio-bg-hover)',
              borderColor: 'var(--studio-border-hover)',
            },
          }}
        >
          <Plus size={15} />
          New conversation
        </Box>
      </Box>

      {/* Sessions */}
      <Box css={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {recentSessions.length > 0 && (
          <Box>
            <Text
              css={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--studio-text-tertiary)',
                padding: '10px 8px 6px',
              }}
            >
              Recent
            </Text>
            <VStack gap={0} align="stretch">
              {recentSessions.map((session) => {
                const isActive = session.id === activeSessionId && location.pathname === Path.Chat
                return (
                  <Box
                    key={session.id}
                    as="button"
                    onClick={() => handleSelectSession(session.id)}
                    css={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '7px 8px',
                      borderRadius: '7px',
                      border: 'none',
                      background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                      color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      textAlign: 'left',
                      '&:hover': {
                        background: isActive ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
                        color: 'var(--studio-text-primary)',
                        '& .del': { opacity: 1 },
                      },
                    }}
                  >
                    <MessageSquare
                      size={14}
                      style={{ flexShrink: 0 }}
                    />
                    <Text
                      css={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                        lineHeight: '20px',
                      }}
                    >
                      {session.lastPrompt ? truncate(session.lastPrompt, 28) : session.name}
                    </Text>
                    <Box
                      as="span"
                      className="del"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteSession(session.id) }}
                      css={{
                        opacity: 0,
                        padding: '2px',
                        borderRadius: '4px',
                        color: 'var(--studio-text-tertiary)',
                        flexShrink: 0,
                        transition: 'all 0.1s ease',
                        '&:hover': { color: 'var(--studio-error)', background: 'rgba(239,68,68,0.1)' },
                      }}
                    >
                      <Trash2 size={12} />
                    </Box>
                  </Box>
                )
              })}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Bottom nav */}
      <Box
        css={{
          borderTop: '1px solid var(--studio-border)',
          padding: '6px 8px 8px',
          flexShrink: 0,
        }}
      >
        <VStack gap={0} align="stretch">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <Box
                key={path}
                as="button"
                onClick={() => navigate(path)}
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
                  color: isActive ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  textAlign: 'left',
                  '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </Box>
            )
          })}
          {/* Theme toggle */}
          <Box
            as="button"
            onClick={toggleTheme}
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              width: '100%',
              padding: '7px 10px',
              borderRadius: '7px',
              border: 'none',
              background: 'transparent',
              color: 'var(--studio-text-tertiary)',
              fontSize: '13px',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textAlign: 'left',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            {mode === 'dark' ? <Sun size={15} style={{ flexShrink: 0 }} /> : <Moon size={15} style={{ flexShrink: 0 }} />}
            {mode === 'dark' ? 'Light mode' : 'Dark mode'}
          </Box>
          <Box
            as="button"
            onClick={() => navigate(Path.Settings)}
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              width: '100%',
              padding: '7px 10px',
              borderRadius: '7px',
              border: 'none',
              background: location.pathname === Path.Settings ? 'var(--studio-bg-hover)' : 'transparent',
              color: location.pathname === Path.Settings ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
              fontSize: '13px',
              fontWeight: location.pathname === Path.Settings ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textAlign: 'left',
              '&:hover': { background: 'var(--studio-bg-surface)', color: 'var(--studio-text-secondary)' },
            }}
          >
            <Settings size={15} style={{ flexShrink: 0 }} />
            Settings
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
