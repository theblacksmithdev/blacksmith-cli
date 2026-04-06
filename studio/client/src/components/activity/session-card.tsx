import { Box, Text, IconButton } from '@chakra-ui/react'
import { MessageSquare, Trash2 } from 'lucide-react'
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
        padding: '14px 16px',
        background: isActive ? 'var(--studio-bg-hover)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        position: 'relative',
        gap: '12px',
        border: 'none',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'var(--studio-border)',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: isActive ? 'var(--studio-text-primary)' : 'transparent',
        '&:hover': {
          background: 'var(--studio-bg-surface)',
        },
        '&:hover .delete-btn': {
          opacity: 1,
        },
      }}
    >
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Text
          css={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--studio-text-primary)',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {session.name}
        </Text>
        {session.lastPrompt && (
          <Text
            css={{
              fontSize: '12px',
              color: 'var(--studio-text-tertiary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '4px',
            }}
          >
            {truncate(session.lastPrompt, 60)}
          </Text>
        )}
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            color: 'var(--studio-text-tertiary)',
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={10} />
            <Text css={{ fontSize: '11px', color: 'var(--studio-text-tertiary)' }}>{session.messageCount}</Text>
          </Box>
        </Box>
      </Box>

      {/* Date on the right */}
      <Text
        css={{
          fontSize: '11px',
          color: 'var(--studio-text-tertiary)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {formatDate(session.updatedAt)}
      </Text>

      {/* Delete button - only shows on hover */}
      <Tooltip content="Delete session">
        <IconButton
          className="delete-btn"
          aria-label="Delete"
          variant="ghost"
          size="xs"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          css={{
            opacity: 0,
            transition: 'all 0.15s ease',
            color: 'var(--studio-text-tertiary)',
            borderRadius: '6px',
            flexShrink: 0,
            '&:hover': {
              color: 'var(--studio-error)',
              background: 'rgba(239,68,68,0.1)',
            },
          }}
        >
          <Trash2 size={13} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
