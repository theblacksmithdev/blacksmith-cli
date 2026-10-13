import type { ReactNode } from 'react'
import { Stack } from '@chakra-ui/react'
import { PageHeader } from '@/shared/components/page-header'
import { StatusAlert } from '@/shared/components/status-alert'

interface AuthPanelProps {
  title: string
  description: string
  /** Error from the auth adapter, shown above the form. */
  error?: string | null
  /** Success confirmation, shown above the form. */
  notice?: string | null
  /** Links under the form ("Don't have an account? Sign up"). */
  footer?: ReactNode
  children: ReactNode
}

/**
 * Shared frame for every auth page: centered heading, status messages,
 * the form itself, and secondary links.
 */
export function AuthPanel({ title, description, error, notice, footer, children }: AuthPanelProps) {
  return (
    <Stack gap="8">
      <PageHeader align="center" title={title} description={description} />

      {(error || notice) && (
        <Stack gap="3">
          {error && <StatusAlert message={error} />}
          {notice && <StatusAlert status="success" message={notice} />}
        </Stack>
      )}

      {children}

      {footer && (
        <Stack gap="2" align="center" textStyle="sm" color="fg.muted">
          {footer}
        </Stack>
      )}
    </Stack>
  )
}
