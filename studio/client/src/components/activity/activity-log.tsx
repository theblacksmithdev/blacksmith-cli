import { useEffect } from 'react'
import { Box, VStack, Heading } from '@chakra-ui/react'
import { History } from 'lucide-react'
import { SessionCard } from './session-card'
import { EmptyState } from '@/components/shared/empty-state'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { useUiStore } from '@/stores/ui-store'

export function ActivityLog() {
  const { fetchSessions, loadSession, deleteSession } = useSessions()
  const sessions = useSessionStore((s) => s.sessions)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const setActiveView = useUiStore((s) => s.setActiveView)

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleSelect = async (id: string) => {
    await loadSession(id)
    setActiveView('chat')
  }

  if (sessions.length === 0) {
    return (
      <Box p={6} display="flex" alignItems="center" justifyContent="center" h="full">
        <EmptyState
          icon={<History size={40} />}
          title="No sessions yet"
          description="Start a conversation and it will appear here."
        />
      </Box>
    )
  }

  return (
    <Box p={6}>
      <Heading size="md" mb={4}>Activity Log</Heading>
      <VStack gap={2} align="stretch">
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
    </Box>
  )
}
