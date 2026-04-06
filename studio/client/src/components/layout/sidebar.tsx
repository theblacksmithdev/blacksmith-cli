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
} from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { useSessionStore } from '@/stores/session-store'
import { useSessions } from '@/hooks/use-sessions'
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
          background: '#171717',
          borderRight: '1px solid rgba(255,255,255,0.08)',
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
              color: '#8e8e8e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'all 0.12s ease',
              '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
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
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#2f2f2f',
              color: '#ececec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.12s ease',
              '&:hover': { background: '#3a3a3a', borderColor: 'rgba(255,255,255,0.15)' },
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
                background: location.pathname === Path.Chat ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: location.pathname === Path.Chat ? '#ececec' : '#8e8e8e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                '&:hover': {
                  background: location.pathname === Path.Chat ? 'rgba(255,255,255,0.08)' : '#2f2f2f',
                  color: location.pathname === Path.Chat ? '#ececec' : '#b4b4b4',
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
                  background: location.pathname === path ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: location.pathname === path ? '#ececec' : '#8e8e8e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
                }}
              >
                <Icon size={18} />
              </Box>
            </Tooltip>
          ))}
        </VStack>

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
              background: location.pathname === Path.Settings ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: location.pathname === Path.Settings ? '#ececec' : '#8e8e8e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
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
            background: connectionStatus === 'connected' ? '#10a37f' : '#ef4444',
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
        background: '#171717',
        borderRight: '1px solid rgba(255,255,255,0.08)',
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
              css={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: '#ececec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Anvil size={14} color="#212121" />
            </Box>
            <Box>
              <Text
                css={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ececec',
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
                    background: connectionStatus === 'connected' ? '#10a37f' : '#ef4444',
                    flexShrink: 0,
                  }}
                />
                <Text css={{ fontSize: '10px', color: '#8e8e8e' }}>
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
              color: '#8e8e8e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
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
            border: '1px solid rgba(255,255,255,0.08)',
            background: '#2f2f2f',
            color: '#ececec',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              background: '#3a3a3a',
              borderColor: 'rgba(255,255,255,0.15)',
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
                color: '#8e8e8e',
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
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: isActive ? '#ececec' : '#b4b4b4',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                      textAlign: 'left',
                      '&:hover': {
                        background: isActive ? 'rgba(255,255,255,0.08)' : '#2f2f2f',
                        color: '#ececec',
                        '& .del': { opacity: 1 },
                      },
                    }}
                  >
                    <MessageSquare
                      size={14}
                      style={{ flexShrink: 0, color: isActive ? '#ececec' : 'inherit' }}
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
                        color: '#8e8e8e',
                        flexShrink: 0,
                        transition: 'all 0.1s ease',
                        '&:hover': { color: '#ef4444', background: 'rgba(239,68,68,0.1)' },
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
          borderTop: '1px solid rgba(255,255,255,0.08)',
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
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#ececec' : '#8e8e8e',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  textAlign: 'left',
                  '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                {label}
              </Box>
            )
          })}
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
              background: location.pathname === Path.Settings ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: location.pathname === Path.Settings ? '#ececec' : '#8e8e8e',
              fontSize: '13px',
              fontWeight: location.pathname === Path.Settings ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textAlign: 'left',
              '&:hover': { background: '#2f2f2f', color: '#b4b4b4' },
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
