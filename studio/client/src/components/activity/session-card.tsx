import { Box, Text, HStack } from '@chakra-ui/react'
import { MessageSquare, Trash2, ArrowRight } from 'lucide-react'
import { Tooltip } from '@/components/shared/tooltip'
import { formatDate, truncate } from '@/lib/format'
import type { SessionSummary } from '@/types'

interface SessionCardProps {
  session: SessionSummary
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function SessionCard({ session, isActive, onSelect, onDelete }: SessionCardProps) {
  return (
    <Box
      as="button"
      onClick={onSelect}
      css={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 14px',
        background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        textAlign: 'left',
        gap: '12px',
        border: 'none',
        borderBottom: '1px solid var(--studio-border)',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': {
          background: 'var(--studio-bg-hover)',
          '& .session-actions': { opacity: 1 },
          '& .session-arrow': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      {/* Icon */}
      <Box
        css={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isActive ? 'var(--studio-bg-hover-strong)' : 'var(--studio-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--studio-text-tertiary)',
          flexShrink: 0,
        }}
      >
        <MessageSquare size={15} />
      </Box>

      {/* Content */}
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Text
          css={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--studio-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '2px',
          }}
        >
          {session.lastPrompt ? truncate(session.lastPrompt, 50) : session.name}
        </Text>
        <HStack gap={2}>
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
            {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
          </Text>
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
            {formatDate(session.updatedAt)}
          </Text>
        </HStack>
      </Box>

      {/* Actions — hover only */}
      <HStack gap={1} className="session-actions" css={{ opacity: 0, transition: 'opacity 0.12s ease', flexShrink: 0 }}>
        <Tooltip content="Delete">
          <Box
            as="span"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete() }}
            css={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--studio-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              '&:hover': { color: 'var(--studio-error)', background: 'rgba(239,68,68,0.1)' },
            }}
          >
            <Trash2 size={13} />
          </Box>
        </Tooltip>
        <Box
          className="session-arrow"
          css={{
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'all 0.12s ease',
            color: 'var(--studio-text-muted)',
          }}
        >
          <ArrowRight size={14} />
        </Box>
      </HStack>
    </Box>
  )
}
