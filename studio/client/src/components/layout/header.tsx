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
        borderBottom: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
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
            color: 'var(--studio-text-secondary)',
            letterSpacing: '-0.01em',
          }}
        >
          {activeSession.name}
        </Text>
      ) : (
        <Text
          css={{
            fontSize: '13px',
            color: 'var(--studio-text-tertiary)',
          }}
        >
          Home
        </Text>
      )}
      <Spacer />
    </HStack>
  )
}
