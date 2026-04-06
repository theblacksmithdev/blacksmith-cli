import { Box, Text } from '@chakra-ui/react'
import { Anvil } from 'lucide-react'

export function HomeHero() {
  return (
    <>
      <Box
        css={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--studio-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
        }}
      >
        <Anvil size={26} color="var(--studio-accent-fg)" />
      </Box>

      <Text
        css={{
          fontSize: '28px',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          color: 'var(--studio-text-primary)',
          textAlign: 'center',
          lineHeight: 1.3,
          marginBottom: '8px',
        }}
      >
        What are we building today?
      </Text>
      <Text
        css={{
          fontSize: '15px',
          color: 'var(--studio-text-tertiary)',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '40px',
        }}
      >
        Describe your idea or pick a starting point below.
      </Text>
    </>
  )
}
