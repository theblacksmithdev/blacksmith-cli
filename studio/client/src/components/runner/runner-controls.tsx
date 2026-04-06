import { Box, Text, HStack } from '@chakra-ui/react'
import { Play, Square, Server, Globe, Layers } from 'lucide-react'
import { useRunnerStore, type RunnerStatus } from '@/stores/runner-store'
import { useRunner } from '@/hooks/use-runner'

function StatusDot({ status }: { status: RunnerStatus }) {
  const color = status === 'running' ? 'var(--studio-green)' : status === 'starting' ? 'var(--studio-warning)' : 'var(--studio-text-muted)'
  return (
    <Box css={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
  )
}

function RunButton({ label, icon: Icon, status, port, onStart, onStop }: {
  label: string
  icon: typeof Server
  status: RunnerStatus
  port: number | null
  onStart: () => void
  onStop: () => void
}) {
  const isRunning = status === 'running' || status === 'starting'

  return (
    <Box
      as="button"
      onClick={isRunning ? onStop : onStart}
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid var(--studio-border)',
        background: isRunning ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
        color: 'var(--studio-text-primary)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        '&:hover': { background: 'var(--studio-bg-hover)', borderColor: 'var(--studio-border-hover)' },
      }}
    >
      <StatusDot status={status} />
      <Icon size={14} />
      <Text css={{ fontSize: '13px' }}>{label}</Text>
      {port && status === 'running' && (
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>:{port}</Text>
      )}
      <Box css={{ marginLeft: '4px', color: isRunning ? 'var(--studio-error)' : 'var(--studio-green)' }}>
        {isRunning ? <Square size={12} /> : <Play size={12} />}
      </Box>
    </Box>
  )
}

export function RunnerControls() {
  const { backendStatus, frontendStatus, backendPort, frontendPort } = useRunnerStore()
  const { start, stop } = useRunner()

  const bothRunning = backendStatus === 'running' && frontendStatus === 'running'
  const anyRunning = backendStatus === 'running' || frontendStatus === 'running' || backendStatus === 'starting' || frontendStatus === 'starting'

  return (
    <HStack
      gap={2}
      css={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--studio-border)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      <RunButton
        label="Backend"
        icon={Server}
        status={backendStatus}
        port={backendPort}
        onStart={() => start('backend')}
        onStop={() => stop('backend')}
      />
      <RunButton
        label="Frontend"
        icon={Globe}
        status={frontendStatus}
        port={frontendPort}
        onStart={() => start('frontend')}
        onStop={() => stop('frontend')}
      />
      <Box
        as="button"
        onClick={anyRunning ? () => stop('all') : () => start('all')}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: 'none',
          background: anyRunning ? 'var(--studio-error)' : 'var(--studio-accent)',
          color: anyRunning ? '#fff' : 'var(--studio-accent-fg)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.12s ease',
          '&:hover': { opacity: 0.9 },
        }}
      >
        <Layers size={14} />
        {anyRunning ? 'Stop All' : 'Start All'}
      </Box>
    </HStack>
  )
}
