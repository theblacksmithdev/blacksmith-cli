import { useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { FileEdit, Terminal, Eye, FileSearch, ChevronRight, ChevronDown } from 'lucide-react'
import type { ToolCall } from '@/types'

const toolIcons: Record<string, typeof FileEdit> = {
  Edit: FileEdit,
  Write: FileEdit,
  Bash: Terminal,
  Read: Eye,
  Grep: FileSearch,
}

interface ToolCallCardProps {
  toolCall: ToolCall
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = toolIcons[toolCall.toolName] || Terminal

  const summary = (() => {
    const input = toolCall.input
    if (toolCall.toolName === 'Edit' || toolCall.toolName === 'Write') {
      return (input as any).file_path || (input as any).path || 'file'
    }
    if (toolCall.toolName === 'Bash') {
      return (input as any).command || ''
    }
    if (toolCall.toolName === 'Read') {
      return (input as any).file_path || ''
    }
    return JSON.stringify(input).slice(0, 100)
  })()

  return (
    <Box
      css={{
        marginTop: '8px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        background: '#12121a',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(255,255,255,0.1)',
        },
      }}
    >
      <Box
        as="button"
        onClick={() => setExpanded(!expanded)}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#8888a0',
          fontSize: '12px',
          borderLeft: '2px solid rgba(99,102,241,0.4)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#f0f0f5',
          },
        }}
      >
        <Icon size={13} />
        <Text
          css={{
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#6366f1',
            flexShrink: 0,
          }}
        >
          {toolCall.toolName}
        </Text>
        <Text
          css={{
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
            fontSize: '11px',
            color: '#8888a0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            textAlign: 'left',
          }}
        >
          {summary}
        </Text>
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </Box>

      {expanded && toolCall.output && (
        <Box
          css={{
            padding: '8px 12px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <Text
            css={{
              fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
              fontSize: '11px',
              color: '#8888a0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {toolCall.output}
          </Text>
        </Box>
      )}
    </Box>
  )
}
