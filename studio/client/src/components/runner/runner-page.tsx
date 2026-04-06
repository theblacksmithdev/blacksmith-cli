import { Box } from '@chakra-ui/react'
import { RunnerControls } from './runner-controls'
import { RunnerLogs } from './runner-logs'
import { RunnerPreview } from './runner-preview'
import { useRunner } from '@/hooks/use-runner'

export function RunnerPage() {
  // Initialize WebSocket listener
  useRunner()

  return (
    <Box css={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <RunnerControls />

      {/* Split: logs + preview */}
      <Box css={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Logs panel */}
        <Box css={{ flex: 3, minWidth: 0, borderRight: '1px solid var(--studio-border)' }}>
          <RunnerLogs />
        </Box>

        {/* Preview panel */}
        <Box css={{ flex: 2, minWidth: 0 }}>
          <RunnerPreview />
        </Box>
      </Box>
    </Box>
  )
}
