import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import { Button } from '@chakra-ui/react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { StatusPage } from '@/shared/components/status-page'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  if (isRouteErrorResponse(error)) {
    return (
      <StatusPage
        fullPage
        code={error.status}
        title={error.statusText || 'Something went wrong'}
        actions={
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft />
            Go Back
          </Button>
        }
      />
    )
  }

  return (
    <StatusPage
      fullPage
      title="Something went wrong"
      description={error instanceof Error ? error.message : 'An unexpected error occurred.'}
      actions={
        <Button onClick={() => window.location.reload()}>
          <RefreshCw />
          Reload Page
        </Button>
      }
    />
  )
}
