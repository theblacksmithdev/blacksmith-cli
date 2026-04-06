import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { History, MessageSquare, Clock } from 'lucide-react'
import { SessionCard } from './session-card'
import { EmptyState } from '@/components/shared/empty-state'
import { PageContainer } from '@/components/shared/page-container'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { useProjectStore } from '@/stores/project-store'
import { chatPath } from '@/router/paths'

function groupSessionsByDate(sessions: any[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; sessions: any[] }[] = [
    { label: 'Today', sessions: [] },
    { label: 'Yesterday', sessions: [] },
    { label: 'This week', sessions: [] },
    { label: 'Older', sessions: [] },
  ]

  for (const session of sessions) {
    const date = new Date(session.updatedAt)
    if (date >= today) groups[0].sessions.push(session)
    else if (date >= yesterday) groups[1].sessions.push(session)
    else if (date >= weekAgo) groups[2].sessions.push(session)
    else groups[3].sessions.push(session)
  }

  return groups.filter((g) => g.sessions.length > 0)
}

export function ActivityLog() {
  const { sessions, loadSession, deleteSession } = useSessions()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const activeProject = useProjectStore((s) => s.activeProject)
  const navigate = useNavigate()

  const handleSelect = async (id: string) => {
    if (!activeProject) return
    await loadSession(id)
    navigate(chatPath(activeProject.id, id))
  }

  if (sessions.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="full">
        <EmptyState
          icon={<History size={40} />}
          title="No conversations yet"
          description="Start a conversation and it will appear here."
        />
      </Box>
    )
  }

  const groups = groupSessionsByDate(sessions)

  return (
    <Box css={{ height: '100%', overflowY: 'auto' }}>
      <PageContainer>
        {/* Header */}
        <Box css={{ marginBottom: '28px' }}>
          <Text
            css={{
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--studio-text-primary)',
              marginBottom: '4px',
            }}
          >
            Activity
          </Text>
          <HStack gap={3}>
            <HStack gap={1}>
              <MessageSquare size={13} style={{ color: 'var(--studio-text-muted)' }} />
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          </HStack>
        </Box>

        {/* Grouped sessions */}
        <VStack gap={6} align="stretch">
          {groups.map((group) => (
            <Box key={group.label}>
              <HStack gap={2} css={{ marginBottom: '10px', padding: '0 2px' }}>
                <Clock size={12} style={{ color: 'var(--studio-text-muted)' }} />
                <Text
                  css={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--studio-text-muted)',
                  }}
                >
                  {group.label}
                </Text>
              </HStack>
              <VStack
                gap={0}
                align="stretch"
                css={{
                  borderRadius: '10px',
                  border: '1px solid var(--studio-border)',
                  overflow: 'hidden',
                  background: 'var(--studio-bg-sidebar)',
                }}
              >
                {group.sessions.map((session: any) => (
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
          ))}
        </VStack>
      </PageContainer>
    </Box>
  )
}
