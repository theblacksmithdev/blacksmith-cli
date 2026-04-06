import {
  HStack,
  Text,
  Box,
  Spacer,
} from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'
import { useSessions } from '@/hooks/use-sessions'

export function Header() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const sessions = useSessionStore((s) => s.sessions)
  const connectionStatus = useUiStore((s) => s.connectionStatus)
  const { createSession } = useSessions()

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <HStack
      h="50px"
      px={5}
      gap={3}
      css={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(12,12,14,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'relative',
        zIndex: 10,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.1), transparent)',
        },
      }}
    >
      {activeSession ? (
        <Text
          fontSize="sm"
          fontWeight="medium"
          css={{
            color: '#e8e8ed',
            letterSpacing: '-0.01em',
          }}
        >
          {activeSession.name}
        </Text>
      ) : (
        <Text
          fontSize="sm"
          css={{ color: '#55555f' }}
        >
          No active session
        </Text>
      )}

      {/* Connection status dot */}
      <Box
        css={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
          flexShrink: 0,
          boxShadow: connectionStatus === 'connected'
            ? '0 0 6px rgba(16,185,129,0.4)'
            : '0 0 6px rgba(239,68,68,0.4)',
        }}
      />

      <Spacer />

      <Box
        as="button"
        onClick={() => createSession()}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          letterSpacing: '-0.01em',
          '&:hover': {
            opacity: 0.9,
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
          },
          '&:active': {
            transform: 'translateY(0)',
            background: '#0f766e',
          },
        }}
      >
        <Plus size={14} />
        New Chat
      </Box>
    </HStack>
  )
}
