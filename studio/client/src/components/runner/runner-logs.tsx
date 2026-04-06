import { useRef, useEffect, useState } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { Trash2, ArrowDown } from 'lucide-react'
import { useRunnerStore, type LogEntry } from '@/stores/runner-store'
import { Tooltip } from '@/components/shared/tooltip'

type LogFilter = 'all' | 'backend' | 'frontend'

function getLineColor(line: string): string {
  // Errors
  if (/error|Error|ERROR|Traceback|Exception/i.test(line)) return 'var(--studio-error)'
  // Warnings
  if (/warn|Warning|WARNING|WARN/i.test(line)) return '#f59e0b'
  // HTTP status codes
  if (/\s(4\d{2}|5\d{2})\s/.test(line)) return 'var(--studio-error)'
  if (/\s(2\d{2}|3\d{2})\s/.test(line)) return '#10b981'
  // Studio messages
  if (line.startsWith('[studio]')) return 'var(--studio-text-tertiary)'
  // URLs
  if (/https?:\/\//.test(line)) return 'var(--studio-link)'
  return 'var(--studio-text-primary)'
}

function LogLine({ entry }: { entry: LogEntry }) {
  return (
    <Box
      css={{
        display: 'flex',
        gap: '8px',
        padding: '1px 14px',
        '&:hover': { background: 'var(--studio-bg-surface)' },
      }}
    >
      <Text
        css={{
          width: '52px',
          flexShrink: 0,
          color: entry.source === 'backend' ? '#10b981' : '#3b82f6',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '10px',
          paddingTop: '3px',
          letterSpacing: '0.02em',
        }}
      >
        {entry.source === 'backend' ? 'django' : 'vite'}
      </Text>
      <Text
        css={{
          color: getLineColor(entry.line),
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          flex: 1,
        }}
      >
        {entry.line}
      </Text>
    </Box>
  )
}

export function RunnerLogs() {
  const logs = useRunnerStore((s) => s.logs)
  const clearLogs = useRunnerStore((s) => s.clearLogs)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<LogFilter>('all')
  const [autoScroll, setAutoScroll] = useState(true)

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.source === filter)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  const filterBtn = (value: LogFilter, label: string) => (
    <Box
      as="button"
      onClick={() => setFilter(value)}
      css={{
        padding: '2px 8px',
        borderRadius: '4px',
        border: 'none',
        background: filter === value ? 'var(--studio-bg-hover)' : 'transparent',
        color: filter === value ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
        fontSize: '11px',
        fontWeight: filter === value ? 500 : 400,
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        '&:hover': { color: 'var(--studio-text-secondary)' },
      }}
    >
      {label}
    </Box>
  )

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <HStack
        gap={1}
        css={{
          padding: '6px 14px',
          borderBottom: '1px solid var(--studio-border)',
          flexShrink: 0,
        }}
      >
        <Text
          css={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--studio-text-muted)',
            marginRight: '8px',
          }}
        >
          Output
        </Text>

        {filterBtn('all', 'All')}
        {filterBtn('backend', 'Django')}
        {filterBtn('frontend', 'Vite')}

        <Box css={{ flex: 1 }} />

        <Text css={{ fontSize: '10px', color: 'var(--studio-text-muted)', marginRight: '4px' }}>
          {filteredLogs.length} lines
        </Text>

        {!autoScroll && (
          <Tooltip content="Scroll to bottom">
            <Box
              as="button"
              onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
              css={{
                width: '22px', height: '22px', borderRadius: '4px', border: 'none',
                background: 'transparent', color: 'var(--studio-text-muted)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                '&:hover': { color: 'var(--studio-text-secondary)', background: 'var(--studio-bg-surface)' },
              }}
            >
              <ArrowDown size={12} />
            </Box>
          </Tooltip>
        )}

        <Tooltip content="Clear logs">
          <Box
            as="button"
            onClick={clearLogs}
            css={{
              width: '22px', height: '22px', borderRadius: '4px', border: 'none',
              background: 'transparent', color: 'var(--studio-text-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              '&:hover': { color: 'var(--studio-text-secondary)', background: 'var(--studio-bg-surface)' },
            }}
          >
            <Trash2 size={12} />
          </Box>
        </Tooltip>
      </HStack>

      {/* Logs */}
      <Box
        ref={containerRef}
        onScroll={handleScroll}
        css={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 0',
          fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
          fontSize: '12px',
          lineHeight: '18px',
          background: 'var(--studio-bg-sidebar)',
        }}
      >
        {filteredLogs.length === 0 ? (
          <Text css={{ padding: '24px 16px', color: 'var(--studio-text-muted)', textAlign: 'center', fontFamily: 'inherit', fontSize: '12px' }}>
            {logs.length === 0 ? 'No output yet. Start a server to see logs here.' : 'No logs match this filter.'}
          </Text>
        ) : (
          filteredLogs.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </Box>
    </Box>
  )
}
