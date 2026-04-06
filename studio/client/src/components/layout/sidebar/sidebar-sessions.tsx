import { Box, Text, VStack } from '@chakra-ui/react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { truncate } from '@/lib/format'

interface Session {
  id: string
  name: string
  lastPrompt?: string
}

interface SidebarSessionsProps {
  sessions: Session[]
  activeSessionId: string | null
  locationPathname: string
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

export function SidebarSessions({
  sessions,
  activeSessionId,
  locationPathname,
  onSelectSession,
  onDeleteSession,
}: SidebarSessionsProps) {
  if (sessions.length === 0) return null

  return (
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
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId && locationPathname.startsWith('/chat')
          return (
            <Box
              key={session.id}
              as="button"
              onClick={() => onSelectSession(session.id)}
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
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDeleteSession(session.id) }}
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
  )
}
