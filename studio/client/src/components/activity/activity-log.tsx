import { useEffect } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { History } from 'lucide-react'
import { SessionCard } from './session-card'
import { EmptyState } from '@/components/shared/empty-state'
import { PageContainer } from '@/components/shared/page-container'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { chatPath } from '@/router/paths'

export function ActivityLog() {
  const { fetchSessions, loadSession, deleteSession } = useSessions()
  const sessions = useSessionStore((s) => s.sessions)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleSelect = async (id: string) => {
    await loadSession(id)
    navigate(chatPath(id))
  }

  if (sessions.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="full">
        <EmptyState
          icon={<History size={40} />}
          title="No sessions yet"
          description="Start a conversation and it will appear here."
        />
      </Box>
    )
  }

  return (
    <PageContainer>
      <Text
        css={{
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--studio-text-primary)',
          marginBottom: '24px',
        }}
      >
        Recent Sessions
      </Text>

      <VStack gap={0} align="stretch">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isActive={session.id === activeSessionId}
            onSelect={() => handleSelect(session.id)}
            onDelete={() => deleteSession(session.id)}
          />
        ))}
      </VStack>
    </PageContainer>
  )
}
