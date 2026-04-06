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
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isActive ? 'rgba(13,148,136,0.06)' : 'transparent',
        borderLeft: isActive ? '2px solid #0d9488' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        position: 'relative',
        gap: '12px',
        border: 'none',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'rgba(255,255,255,0.04)',
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: isActive ? '#0d9488' : 'transparent',
        '&:hover': {
          background: '#141416',
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
            color: '#e8e8ed',
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
              color: '#55555f',
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
            color: '#55555f',
          }}
        >
          <Box css={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={10} />
            <Text css={{ fontSize: '11px', color: '#55555f' }}>{session.messageCount}</Text>
          </Box>
        </Box>
      </Box>

      {/* Date on the right */}
      <Text
        css={{
          fontSize: '11px',
          color: '#55555f',
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
            color: '#55555f',
            borderRadius: '6px',
            flexShrink: 0,
            '&:hover': {
              color: '#ef4444',
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
