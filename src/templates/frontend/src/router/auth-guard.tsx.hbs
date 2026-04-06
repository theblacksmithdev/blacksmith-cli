import { Navigate, useLocation } from 'react-router-dom'
import { Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Button, Box } from '@chakra-ui/react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Path } from '@/router/paths'

interface AuthGuardProps {
  roles?: string[]
  children: React.ReactNode
}

export function AuthGuard({ roles, children }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${Path.Login}?redirect=${redirectParam}`} replace />
  }

  if (roles && roles.length > 0 && user) {
    const userRoles = (user as any).roles || []
    const hasRole = roles.some((role) => userRoles.includes(role))
    if (!hasRole) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You don't have permission to view this page.
                </AlertDescription>
              </Box>
            </Alert>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
