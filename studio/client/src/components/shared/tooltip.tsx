import { Tooltip as ChakraTooltip } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <ChakraTooltip.Root>
      <ChakraTooltip.Trigger asChild>
        {children}
      </ChakraTooltip.Trigger>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content
          css={{
            background: '#1a1a26',
            color: '#f0f0f5',
            fontSize: '12px',
            fontWeight: 500,
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  )
}
