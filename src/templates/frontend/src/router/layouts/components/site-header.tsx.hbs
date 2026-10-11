import { Link } from 'react-router-dom'
import { Box, Button, Container, HStack } from '@chakra-ui/react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Path } from '@/router/paths'
import { BrandLogo } from '@/shared/components/brand-logo'
import { ColorModeButton } from '@/shared/components/ui/color-mode-button'
import { UserMenu } from './user-menu'

export function SiteHeader() {
  const { isAuthenticated } = useAuth()

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg/80"
      backdropFilter="saturate(180%) blur(16px)"
      borderBottomWidth="1px"
      borderColor="border.muted"
    >
      <Container maxW="6xl">
        <HStack h="16" justify="space-between">
          <BrandLogo />

          <HStack gap="2">
            <ColorModeButton />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to={Path.Login}>Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={Path.Register}>Sign up</Link>
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
