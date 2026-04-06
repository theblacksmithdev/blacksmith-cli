import { Box, Text, HStack } from '@chakra-ui/react'
import { Circle } from 'lucide-react'

interface StatusBarProps {
  lineCount: number
  language: string
  isChanged: boolean
}

export function StatusBar({ lineCount, language, isChanged }: StatusBarProps) {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 14px',
        borderTop: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        fontSize: '11px',
        color: 'var(--studio-text-muted)',
        flexShrink: 0,
      }}
    >
      <Text>{lineCount} lines</Text>
      <HStack gap={3}>
        {isChanged && (
          <HStack gap={1}>
            <Circle size={5} fill="var(--studio-warning)" style={{ color: 'var(--studio-warning)' }} />
            <Text css={{ color: 'var(--studio-warning)' }}>Modified</Text>
          </HStack>
        )}
        <Text css={{ textTransform: 'uppercase', letterSpacing: '0.03em' }}>{language}</Text>
        <Text>UTF-8</Text>
      </HStack>
    </Box>
  )
}
