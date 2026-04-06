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
import { useChatStore } from '@/stores/chat-store'
import { useSessions } from '@/hooks/use-sessions'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { Path, chatPath } from '@/router/paths'
import { truncate } from '@/lib/format'

const navItems = [
  { path: Path.Templates, icon: Sparkles, label: 'Templates' },
  { path: Path.Code, icon: FolderTree, label: 'Code' },
  { path: Path.Activity, icon: History, label: 'Activity' },
  { path: Path.Settings, icon: Settings, label: 'Settings' },
] as const

// Shared styles
const iconBtn = (active = false) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
  '&:hover': {
    background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
  },
})

const navRow = (active = false) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  width: '100%',
  padding: '7px 10px',
  borderRadius: '7px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  fontSize: '13px',
  fontWeight: active ? 500 : 400,
  cursor: 'pointer',
  transition: 'all 0.1s ease',
  textAlign: 'left' as const,
  '&:hover': {
    background: 'var(--studio-bg-surface)',
    color: 'var(--studio-text-secondary)',
  },
})

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { sessions, createSession, loadSession, deleteSession } = useSessions()
  const { mode, toggle: toggleTheme } = useThemeMode()

  const handleNewChat = () => {
    useChatStore.getState().clearMessages()
    useSessionStore.getState().setActiveSession(null)
    navigate(Path.NewChat)
  }

  const handleSelectSession = async (id: string) => {
    await loadSession(id)
    navigate(chatPath(id))
  }

  const recentSessions = sessions.slice(0, 8)
  const isOnline = connectionStatus === 'connected'

  /*
   * Layout zones (same order in both states):
   *
   * 1. Header — logo + brand/collapse
   * 2. New chat button
   * 3. Sessions (scrollable, flex:1)
   * 4. Nav menu (border-top)
   * 5. Utility bar (border-top) — status + theme toggle
   */

  // ─── Collapsed ───
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
          paddingBottom: '10px',
        }}
      >
        {/* 1. Header — expand toggle */}
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
            <Box as="button" onClick={() => navigate(Path.Home)} css={iconBtn(location.pathname.startsWith('/chat'))}>
              <MessageSquare size={17} />
            </Box>
          </Tooltip>
          {navItems.map(({ path, icon: Icon, label }) => (
            <Tooltip key={path} content={label}>
              <Box as="button" onClick={() => navigate(path)} css={iconBtn(location.pathname === path)}>
                <Icon size={17} />
              </Box>
            </Tooltip>
          ))}
        </VStack>

        {/* 5. Utility bar */}
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
              onClick={toggleTheme}
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
      </Box>
    )
  }

  // ─── Expanded ───
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
      <Box css={{ padding: '12px 12px 8px', flexShrink: 0 }}>
        <HStack gap={0} justify="space-between" css={{ marginBottom: '12px', padding: '0 4px' }}>
          <HStack gap={3} as="button" onClick={() => navigate(Path.Home)} css={{ border: 'none', background: 'none', cursor: 'pointer' }}>
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
            onClick={toggleSidebar}
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

        {/* 2. New Chat */}
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
            '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
          }}
        >
          <Plus size={15} />
          New conversation
        </Box>
      </Box>

      {/* 3. Sessions */}
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
                const isActive = session.id === activeSessionId && location.pathname.startsWith('/chat')
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
                    <MessageSquare size={14} style={{ flexShrink: 0 }} />
                    <Text css={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', lineHeight: '20px' }}>
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

      {/* 4. Nav menu */}
      <Box css={{ borderTop: '1px solid var(--studio-border)', padding: '6px 8px', flexShrink: 0 }}>
        <VStack gap={0} align="stretch">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Box key={path} as="button" onClick={() => navigate(path)} css={navRow(location.pathname === path)}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* 5. Utility bar */}
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
          onClick={toggleTheme}
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
    </Box>
  )
}
