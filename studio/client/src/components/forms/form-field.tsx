import { Box, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <Box css={{ width: '100%' }}>
      <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '6px' }}>
        {label}
      </Text>
      {children}
      {error && (
        <Text css={{ fontSize: '12px', color: 'var(--studio-error)', marginTop: '4px' }}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export const inputCss: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '7px',
  border: '1px solid var(--studio-border)',
  background: 'var(--studio-bg-surface)',
  color: 'var(--studio-text-primary)',
  fontSize: '14px',
  outline: 'none',
}

export const selectCss: React.CSSProperties = {
  ...inputCss,
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
}
