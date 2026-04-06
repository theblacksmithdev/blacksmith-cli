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
            background: 'var(--studio-bg-hover-strong)',
            color: 'var(--studio-text-primary)',
            fontSize: '12px',
            fontWeight: 500,
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--studio-border)',
            boxShadow: 'var(--studio-shadow)',
          }}
        >
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  )
}
