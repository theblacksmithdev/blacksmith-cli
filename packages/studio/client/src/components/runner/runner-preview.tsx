import { Box, Text, VStack } from '@chakra-ui/react'
import { Globe, ExternalLink } from 'lucide-react'
import { useRunnerStore } from '@/stores/runner-store'

export function RunnerPreview() {
  const frontendStatus = useRunnerStore((s) => s.frontendStatus)
  const frontendPort = useRunnerStore((s) => s.frontendPort)

  const url = frontendPort ? `http://localhost:${frontendPort}` : null

  if (frontendStatus !== 'running' || !url) {
    return (
      <Box css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--studio-bg-sidebar)' }}>
        <VStack gap={2} css={{ color: 'var(--studio-text-muted)' }}>
          <Globe size={24} />
          <Text css={{ fontSize: '13px' }}>
            {frontendStatus === 'starting' ? 'Starting frontend...' : 'Start the frontend to see a preview'}
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Preview header */}
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderBottom: '1px solid var(--studio-border)',
          flexShrink: 0,
          background: 'var(--studio-bg-sidebar)',
        }}
      >
        <Globe size={12} style={{ color: 'var(--studio-text-muted)' }} />
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-tertiary)', flex: 1 }}>
          {url}
        </Text>
        <Box
          as="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          css={{
            color: 'var(--studio-text-muted)',
            display: 'flex',
            '&:hover': { color: 'var(--studio-text-secondary)' },
          }}
        >
          <ExternalLink size={12} />
        </Box>
      </Box>

      {/* iframe */}
      <Box css={{ flex: 1 }}>
        <iframe
          src={url}
          title="Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#fff',
          }}
        />
      </Box>
    </Box>
  )
}
