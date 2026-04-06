import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'
import {
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Box,
} from '@chakra-ui/react'
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{error.status}</h1>
          <p className="text-xl text-muted-foreground">{error.statusText}</p>
          <div className="pt-2">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md">
        <CardBody className="pt-6 space-y-4">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred.'}
              </AlertDescription>
            </Box>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
