import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  /** Max width of the content area. Defaults to 'md' (720px). */
  size?: 'sm' | 'md' | 'lg' | 'full'
  /** Add vertical padding. Defaults to true. */
  padded?: boolean
}

const maxWidths = {
  sm: '560px',
  md: '720px',
  lg: '960px',
  full: '100%',
}

export function PageContainer({ children, size = 'md', padded = true }: PageContainerProps) {
  return (
    <Box
      css={{
        width: '100%',
        maxWidth: maxWidths[size],
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: padded ? '32px 24px' : '0 24px',
      }}
    >
      {children}
    </Box>
  )
}
