import { Box, Text, VStack } from '@chakra-ui/react'
import { Code2 } from 'lucide-react'

export function EmptyViewer() {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'var(--studio-bg-main)',
      }}
    >
      <VStack gap={3} css={{ color: 'var(--studio-text-muted)' }}>
        <Box
          css={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--studio-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Code2 size={22} />
        </Box>
        <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-secondary)' }}>
          Select a file to view
        </Text>
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)' }}>
          Browse the file tree on the left
        </Text>
      </VStack>
    </Box>
  )
}
