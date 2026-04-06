import { HStack, Text, Box, Spacer } from '@chakra-ui/react'
import { useSessionStore } from '@/stores/session-store'

export function Header() {
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const sessions = useSessionStore((s) => s.sessions)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <HStack
      h="48px"
      px={5}
      gap={3}
      css={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(23,23,23,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}
    >
      {activeSession ? (
        <Text
          css={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#b4b4b4',
            letterSpacing: '-0.01em',
          }}
        >
          {activeSession.name}
        </Text>
      ) : (
        <Text
          css={{
            fontSize: '13px',
            color: '#8e8e8e',
          }}
        >
          Home
        </Text>
      )}
      <Spacer />
    </HStack>
  )
}
